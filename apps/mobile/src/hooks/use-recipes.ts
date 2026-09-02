import { extractIngredientLines, extractRecipeJsonLd, mapSchemaRecipeToInput, preprocessIngredientLines } from '@repo/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import type { RecipeMealType } from '@/constants/recipe-meal-types';
import { api } from '@/lib/api-client';
import * as localRecipes from '@/lib/local-db/recipes';
import type { Ingredient, Recipe, RecipeInput } from '@/lib/local-db/types';
import { useHtmlFetcher } from '@/store/html-fetcher';
import { useNeedle } from '@/store/needle';
import { refreshMealPlanWidget } from '@/widgets/refresh-widgets';

import { useLocalMode } from './use-local-mode';

export type { Ingredient, Recipe, RecipeInput };

type RecipesResponse = { items: Recipe[]; total: number };

export function useRecipes(filters?: { mealType?: RecipeMealType }) {
  const mealType = filters?.mealType;
  const { data: isLocal } = useLocalMode();

  return useQuery({
    queryKey: ['recipes', { mealType }],
    enabled: isLocal !== undefined,
    queryFn: () => {
      if (isLocal) return localRecipes.listRecipes(filters);
      const params = new URLSearchParams({ perPage: '100' });
      if (mealType) params.set('mealType', mealType);
      return api.get<RecipesResponse>(`/api/recipes?${params}`).then((data) => data.items);
    },
  });
}

export function useRecipe(id: string) {
  const { data: isLocal } = useLocalMode();

  return useQuery({
    queryKey: ['recipes', id],
    enabled: !!id && isLocal !== undefined,
    queryFn: async () => {
      if (!isLocal) return api.get<Recipe>(`/api/recipes/${id}`);
      const recipe = await localRecipes.getRecipe(id);
      if (!recipe) throw new Error('Recipe not found');
      return recipe;
    },
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  const { data: isLocal } = useLocalMode();
  return useMutation({
    mutationFn: (input: RecipeInput) =>
      isLocal ? localRecipes.createRecipe(input) : api.post<Recipe>('/api/recipes', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  const { data: isLocal } = useLocalMode();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecipeInput }) =>
      isLocal ? localRecipes.updateRecipe(id, input) : api.put<Recipe>(`/api/recipes/${id}`, input),
    onSuccess: (recipe) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      if (recipe) queryClient.setQueryData(['recipes', recipe.id], recipe);
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  const { data: isLocal } = useLocalMode();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isLocal) {
        const deleted = await localRecipes.deleteRecipe(id);
        if (!deleted) throw new Error('Recipe not found');
        return { id };
      }
      return api.delete<{ id: string }>(`/api/recipes/${id}`);
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['recipes', id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      refreshMealPlanWidget();
    },
  });
}

/**
 * Uploads a locally-picked photo (e.g. from expo-image-picker) so it can be set as a
 * recipe's imageUrl. Local-mode data never leaves the device, so those users just keep the
 * local file:// URI as-is — only signed-in accounts actually upload anywhere.
 *
 * Sent as base64 JSON rather than multipart FormData — React Native's FormData
 * file-part shape ({ uri, name, type }) hits a native "Unsupported FormDataPart
 * implementation" error on this RN version, so the picker is asked for base64
 * directly (see edit-recipe.tsx's `base64: true` option) and that's shipped as
 * a plain JSON string, reusing the same api.post() path every other mutation uses.
 */
export function useUploadRecipeImage() {
  const { data: isLocal } = useLocalMode();
  return useMutation({
    mutationFn: async (asset: { uri: string; base64?: string | null; mimeType?: string | null }): Promise<string> => {
      if (isLocal) return asset.uri;
      if (!asset.base64) throw new Error('No image data to upload.');

      const response = await api.post<{ url: string }>('/api/uploads/image', {
        data: asset.base64,
        contentType: asset.mimeType ?? 'image/jpeg',
      });
      return response.url;
    },
  });
}

/**
 * Extracts a URL's schema.org Recipe markup, if any. Always done on-device via a hidden
 * WebView — that runs the page's own JS before reading it, so client-rendered recipe sites
 * work too, not just static HTML. Ingredient lines are then preprocessed with Needle 2
 * (on-device WASM) to split amount/unit from the name; the deterministic parser is the
 * fallback when Needle is not ready or declines a line. The result is just a preview;
 * saving it (useCreateRecipe) is what actually persists it, locally for local-mode users
 * or to the API for signed-in ones.
 */
export function useImportRecipe() {
  const { fetchHtml } = useHtmlFetcher();
  const { extractIngredients } = useNeedle();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (url: string): Promise<RecipeInput> => {
      const html = await fetchHtml(url);
      const schemaRecipe = extractRecipeJsonLd(html);
      if (!schemaRecipe) throw new Error(t('importRecipe.noRecipeFound'));
      const recipe = mapSchemaRecipeToInput(schemaRecipe);
      const lines = extractIngredientLines(schemaRecipe);
      if (lines.length === 0) return recipe;
      const extracts = await extractIngredients(lines);
      return { ...recipe, ingredients: preprocessIngredientLines(lines, extracts) };
    },
  });
}
