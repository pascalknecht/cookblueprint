import type { MealType } from '@/constants/meal-types';
import type { RecipeFrequency } from '@/constants/recipe-frequency';
import type { RecipeMealType } from '@/constants/recipe-meal-types';
import type { ShoppingCategory } from '@/constants/shopping-categories';

// Single source of truth for the data shapes shared between the remote
// (API-backed) and local (trial-mode) implementations of the data hooks —
// both apps/mobile/src/hooks/*.ts and apps/mobile/src/lib/local-db/*.ts
// import from here, so a trial user's local data and a signed-in user's
// server data always look identical to the UI.

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
  mealTypes: RecipeMealType[];
  ingredients: Ingredient[];
  steps: string[];
};

export type RecipeInput = {
  title: string;
  color: string;
  imageUrl?: string | null;
  frequency: RecipeFrequency;
  time: number;
  servings: number;
  kcal: string;
  mealTypes: RecipeMealType[];
  ingredients: Ingredient[];
  steps: string[];
};

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
};

export type ShoppingItemInput = { name: string; quantity: string; category: string };

export type RecentShoppingItem = { id: string; name: string; category: string; lastUsedAt: string };

export type MealPlanEntry = {
  id: string;
  date: string;
  mealType: MealType;
  recipeId: string;
  recipe: Recipe;
};

export type OrganizationSettings = { enabledMealTypes: MealType[]; shoppingCategoryOrder: ShoppingCategory[] };
