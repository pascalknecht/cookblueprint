import * as Crypto from 'expo-crypto';

import type { RecipeMealType } from '@/constants/recipe-meal-types';

import { TRIAL_KEYS } from './keys';
import { getJSON, setJSON } from './store';
import type { Recipe, RecipeInput } from './types';

function readAll(): Promise<Recipe[]> {
  return getJSON<Recipe[]>(TRIAL_KEYS.recipes, []);
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
  await setJSON(TRIAL_KEYS.recipes, [...recipes, recipe]);
  return recipe;
}

export async function updateRecipe(id: string, input: RecipeInput): Promise<Recipe | null> {
  const recipes = await readAll();
  const index = recipes.findIndex((recipe) => recipe.id === id);
  if (index === -1) return null;

  const updated: Recipe = { id, ...input };
  const next = [...recipes];
  next[index] = updated;
  await setJSON(TRIAL_KEYS.recipes, next);
  return updated;
}
