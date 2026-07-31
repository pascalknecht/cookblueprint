import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { RecipeFrequency } from '@/constants/recipe-frequency';
import { api } from '@/lib/api-client';

export type Ingredient = { n: string; q: string; cat: string };

export type Recipe = {
  id: string;
  title: string;
  color: string;
  imageUrl?: string | null;
  frequency: RecipeFrequency;
  time: number;
  servings: number;
  kcal: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
};

export type RecipeInput = {
  title: string;
  color: string;
  frequency: RecipeFrequency;
  time: number;
  servings: number;
  kcal: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
};

type RecipesResponse = { items: Recipe[]; total: number };

export function useRecipes(filters?: { tag?: string }) {
  const tag = filters?.tag && filters.tag !== 'All' ? filters.tag : undefined;

  return useQuery({
    queryKey: ['recipes', { tag }],
    queryFn: () => {
      const params = new URLSearchParams({ perPage: '100' });
      if (tag) params.set('tag', tag);
      return api.get<RecipesResponse>(`/api/recipes?${params}`);
    },
    select: (data) => data.items,
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: () => api.get<Recipe>(`/api/recipes/${id}`),
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecipeInput) => api.post<Recipe>('/api/recipes', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });
}
