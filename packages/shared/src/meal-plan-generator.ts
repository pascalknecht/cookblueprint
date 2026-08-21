import { normalizeEnabledMealTypes, type MealType } from './meal-types';
import { COOLDOWN_DAYS, DEFAULT_RECIPE_FREQUENCY, WEEKLY_CAP, type RecipeFrequency } from './recipe-frequency';

export type MealPlanGeneratorRecipe = {
  id: string;
  frequency: string | null;
  mealTypes: string[];
};

export type MealPlanGeneratorPriorEntry = {
  recipeId: string;
  date: Date;
};

export type GeneratedMealPlanEntry = {
  date: Date;
  mealType: MealType;
  recipeId: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function eachDate(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function frequencyOf(recipe: MealPlanGeneratorRecipe): RecipeFrequency {
  return (recipe.frequency as RecipeFrequency) ?? DEFAULT_RECIPE_FREQUENCY;
}

/**
 * Pure meal-plan-generation algorithm, shared between the Next.js backend
 * (apps/nextjs/src/use-cases/meal-plans.ts, for signed-in accounts) and the
 * mobile app's local trial-mode generator (apps/mobile/src/lib/local-db) —
 * each wraps this with its own data fetching/persistence, but the actual
 * weekly-cap / cooldown / avoid-repeats scheduling rules live here exactly
 * once. `priorEntries` should already be filtered to the `MAX_COOLDOWN_DAYS`
 * lookback window before `startDate`.
 */
export function generateMealPlanEntries(options: {
  startDate: Date;
  endDate: Date;
  avoidRepeats?: boolean;
  recipes: MealPlanGeneratorRecipe[];
  enabledMealTypes: string[];
  priorEntries: MealPlanGeneratorPriorEntry[];
}): GeneratedMealPlanEntry[] {
  const { startDate, endDate, avoidRepeats, recipes, priorEntries } = options;
  if (recipes.length === 0) return [];

  const mealTypes = normalizeEnabledMealTypes(options.enabledMealTypes);

  // Most recent prior use of each recipe, for the "every two weeks" / "rarely" cooldown.
  const lastUsedDate = new Map<string, Date>();
  for (const entry of priorEntries) {
    const current = lastUsedDate.get(entry.recipeId);
    if (!current || entry.date > current) lastUsedDate.set(entry.recipeId, entry.date);
  }

  const breakfastPool = recipes.filter((r) => r.mealTypes.includes('breakfast'));
  const breakfastFallback = breakfastPool.length ? breakfastPool : recipes;

  // Times each recipe has already been scheduled within *this* generation run.
  const usedThisWeek = new Map<string, number>();

  function isEligible(recipe: MealPlanGeneratorRecipe, slotDate: Date): boolean {
    const frequency = frequencyOf(recipe);
    if ((usedThisWeek.get(recipe.id) ?? 0) >= WEEKLY_CAP[frequency]) return false;

    const cooldownDays = COOLDOWN_DAYS[frequency];
    if (cooldownDays !== undefined) {
      const lastUsed = lastUsedDate.get(recipe.id);
      if (lastUsed && (slotDate.getTime() - lastUsed.getTime()) / MS_PER_DAY < cooldownDays) return false;
    }

    return true;
  }

  function pick(basePool: MealPlanGeneratorRecipe[], slotDate: Date): string {
    const eligible = basePool.filter((r) => isEligible(r, slotDate));
    let candidates = eligible;
    if (avoidRepeats) {
      const fresh = eligible.filter((r) => !usedThisWeek.has(r.id));
      if (fresh.length) candidates = fresh;
    }
    // Nothing satisfies the frequency rules (e.g. a tiny library) — fall back
    // to the base pool so a slot is never left unfilled.
    if (!candidates.length) candidates = basePool.length ? basePool : recipes;

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    usedThisWeek.set(chosen.id, (usedThisWeek.get(chosen.id) ?? 0) + 1);
    return chosen.id;
  }

  const entries: GeneratedMealPlanEntry[] = [];
  for (const date of eachDate(startDate, endDate)) {
    for (const mealType of mealTypes) {
      const basePool = mealType === 'breakfast' ? breakfastFallback : recipes;
      entries.push({ date, mealType, recipeId: pick(basePool, date) });
    }
  }

  return entries;
}
