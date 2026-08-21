import * as Crypto from 'expo-crypto';

import { ALL_MEAL_TYPES, generateMealPlanEntries, MAX_COOLDOWN_DAYS, type MealType } from '@repo/shared';

import { fromISODate, toISODate } from '@/lib/date-utils';

import { TRIAL_KEYS } from './keys';
import { listRecipes, getRecipe } from './recipes';
import { getSettings } from './settings';
import { getJSON, setJSON } from './store';
import type { MealPlanEntry } from './types';

type StoredEntry = { id: string; date: string; mealType: MealType; recipeId: string };

const MEAL_TYPE_ORDER = new Map(ALL_MEAL_TYPES.map((type, index) => [type, index]));

function readEntries(): Promise<StoredEntry[]> {
  return getJSON<StoredEntry[]>(TRIAL_KEYS.mealPlanEntries, []);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function embedRecipes(entries: StoredEntry[]): Promise<MealPlanEntry[]> {
  const recipes = await listRecipes();
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  return entries
    .map((entry) => {
      const recipe = byId.get(entry.recipeId);
      return recipe ? { ...entry, recipe } : null;
    })
    .filter((entry): entry is MealPlanEntry => entry !== null);
}

/** Every locally-stored meal-plan entry, regardless of date — used for reconciliation, not by any screen. */
export async function listAllMealPlanEntries(): Promise<MealPlanEntry[]> {
  const entries = await readEntries();
  const withRecipes = await embedRecipes(entries);
  return withRecipes.sort((a, b) => a.date.localeCompare(b.date));
}

export async function listMealPlanEntries(startDate: Date, endDate: Date): Promise<MealPlanEntry[]> {
  const startISO = toISODate(startDate);
  const endISO = toISODate(endDate);
  const entries = await readEntries();
  const inWindow = entries.filter((entry) => entry.date >= startISO && entry.date <= endISO);
  const withRecipes = await embedRecipes(inWindow);

  return withRecipes.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (MEAL_TYPE_ORDER.get(a.mealType) ?? 0) - (MEAL_TYPE_ORDER.get(b.mealType) ?? 0);
  });
}

export async function assignMeal(input: { date: Date; mealType: MealType; recipeId: string }): Promise<MealPlanEntry> {
  const recipe = await getRecipe(input.recipeId);
  if (!recipe) throw new Error('Recipe not found');

  const dateISO = toISODate(input.date);
  const entries = await readEntries();
  const index = entries.findIndex((entry) => entry.date === dateISO && entry.mealType === input.mealType);

  const stored: StoredEntry = {
    id: index === -1 ? Crypto.randomUUID() : entries[index].id,
    date: dateISO,
    mealType: input.mealType,
    recipeId: input.recipeId,
  };

  const next = [...entries];
  if (index === -1) next.push(stored);
  else next[index] = stored;
  await setJSON(TRIAL_KEYS.mealPlanEntries, next);

  return { ...stored, recipe };
}

export async function deleteMealAssignment(id: string): Promise<boolean> {
  const entries = await readEntries();
  const next = entries.filter((entry) => entry.id !== id);
  if (next.length === entries.length) return false;

  await setJSON(TRIAL_KEYS.mealPlanEntries, next);
  return true;
}

export async function generateMealPlan(options: {
  startDate: Date;
  endDate: Date;
  avoidRepeats?: boolean;
}): Promise<MealPlanEntry[]> {
  const [recipes, settings, entries] = await Promise.all([listRecipes(), getSettings(), readEntries()]);
  if (recipes.length === 0) return [];

  const lookbackStartISO = toISODate(addDays(options.startDate, -MAX_COOLDOWN_DAYS));
  const startISO = toISODate(options.startDate);
  const priorEntries = entries
    .filter((entry) => entry.date >= lookbackStartISO && entry.date < startISO)
    .map((entry) => ({ recipeId: entry.recipeId, date: fromISODate(entry.date) }));

  const generated = generateMealPlanEntries({
    startDate: options.startDate,
    endDate: options.endDate,
    avoidRepeats: options.avoidRepeats,
    recipes: recipes.map((recipe) => ({ id: recipe.id, frequency: recipe.frequency, mealTypes: recipe.mealTypes })),
    enabledMealTypes: settings.enabledMealTypes,
    priorEntries,
  });

  // Single read-modify-write over the whole batch (rather than one assignMeal()
  // call per entry) so concurrent local writes can't race and drop updates.
  const next = [...entries];
  for (const entry of generated) {
    const dateISO = toISODate(entry.date);
    const index = next.findIndex((existing) => existing.date === dateISO && existing.mealType === entry.mealType);
    const stored: StoredEntry = {
      id: index === -1 ? Crypto.randomUUID() : next[index].id,
      date: dateISO,
      mealType: entry.mealType,
      recipeId: entry.recipeId,
    };
    if (index === -1) next.push(stored);
    else next[index] = stored;
  }
  await setJSON(TRIAL_KEYS.mealPlanEntries, next);

  return listMealPlanEntries(options.startDate, options.endDate);
}
