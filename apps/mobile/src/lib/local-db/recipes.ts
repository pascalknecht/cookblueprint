import * as Crypto from 'expo-crypto';

import type { RecipeMealType } from '@/constants/recipe-meal-types';

import { LOCAL_KEYS } from './keys';
import { getJSON, setJSON } from './store';
import type { Recipe, RecipeInput } from './types';

function readAll(): Promise<Recipe[]> {
  return getJSON<Recipe[]>(LOCAL_KEYS.recipes, []);
}

export async function listRecipes(filters?: { mealType?: RecipeMealType }): Promise<Recipe[]> {
  const recipes = await readAll();
  if (!filters?.mealType) return recipes;
  return recipes.filter((recipe) => recipe.mealTypes.includes(filters.mealType!));
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const recipes = await readAll();
  return recipes.find((recipe) => recipe.id === id);
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const recipes = await readAll();
  const recipe: Recipe = { id: Crypto.randomUUID(), ...input };
  await setJSON(LOCAL_KEYS.recipes, [...recipes, recipe]);
  return recipe;
}

export async function updateRecipe(id: string, input: RecipeInput): Promise<Recipe | null> {
  const recipes = await readAll();
  const index = recipes.findIndex((recipe) => recipe.id === id);
  if (index === -1) return null;

  const updated: Recipe = { id, ...input };
  const next = [...recipes];
  next[index] = updated;
  await setJSON(LOCAL_KEYS.recipes, next);
  return updated;
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const recipes = await readAll();
  const next = recipes.filter((recipe) => recipe.id !== id);
  if (next.length === recipes.length) return false;

  await setJSON(LOCAL_KEYS.recipes, next);

  // Meal-plan entries point at a recipe id; drop them here so local storage
  // matches the server cascade instead of leaving orphans that embedRecipes()
  // would silently skip.
  const entries = await getJSON<{ recipeId: string }[]>(LOCAL_KEYS.mealPlanEntries, []);
  await setJSON(
    LOCAL_KEYS.mealPlanEntries,
    entries.filter((entry) => entry.recipeId !== id),
  );
  return true;
}
