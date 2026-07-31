import { prisma } from "@/lib/prisma";
import { ALL_MEAL_TYPES, normalizeEnabledMealTypes, type MealType } from "@/lib/meal-types";
import { COOLDOWN_DAYS, DEFAULT_RECIPE_FREQUENCY, MAX_COOLDOWN_DAYS, WEEKLY_CAP, type RecipeFrequency } from "@/lib/recipe-frequency";
import type { Recipe } from "@/lib/generated/prisma/client/client";

export { ALL_MEAL_TYPES as MEAL_TYPES, type MealType };

export function listMealPlanEntries(organizationId: string, startDate: Date, endDate: Date) {
  return prisma.mealPlanEntry.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
    include: { recipe: true },
    orderBy: [{ date: "asc" }, { mealType: "asc" }],
  });
}

export function upsertMealPlanEntry(
  organizationId: string,
  data: { date: Date; mealType: MealType; recipeId: string },
) {
  return prisma.mealPlanEntry.upsert({
    where: {
      organizationId_date_mealType: {
        organizationId,
        date: data.date,
        mealType: data.mealType,
      },
    },
    create: { ...data, organizationId },
    update: { recipeId: data.recipeId },
    include: { recipe: true },
  });
}

export async function deleteMealPlanEntry(organizationId: string, id: string) {
  const existing = await prisma.mealPlanEntry.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!existing) return false;

  await prisma.mealPlanEntry.delete({ where: { id } });
  return true;
}

function eachDate(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function frequencyOf(recipe: Recipe): RecipeFrequency {
  return (recipe.frequency as RecipeFrequency) ?? DEFAULT_RECIPE_FREQUENCY;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function generateMealPlan(
  organizationId: string,
  options: { startDate: Date; endDate: Date; vegetarianOnly?: boolean; avoidRepeats?: boolean },
) {
  const [recipes, organization, priorEntries] = await Promise.all([
    prisma.recipe.findMany({ where: { organizationId } }),
    prisma.organization.findUnique({ where: { id: organizationId }, select: { enabledMealTypes: true } }),
    prisma.mealPlanEntry.findMany({
      where: {
        organizationId,
        date: { gte: addDays(options.startDate, -MAX_COOLDOWN_DAYS), lt: options.startDate },
      },
      select: { recipeId: true, date: true },
    }),
  ]);
  if (recipes.length === 0) return [];

  const mealTypes = normalizeEnabledMealTypes(organization?.enabledMealTypes ?? []);

  // Most recent prior use of each recipe, for the "every two weeks" / "rarely" cooldown.
  const lastUsedDate = new Map<string, Date>();
  for (const entry of priorEntries) {
    const current = lastUsedDate.get(entry.recipeId);
    if (!current || entry.date > current) lastUsedDate.set(entry.recipeId, entry.date);
  }

  const pool = options.vegetarianOnly ? recipes.filter((r) => r.tags.includes("Veg")) : recipes;
  const usable = pool.length ? pool : recipes;
  const breakfastPool = usable.filter((r) => r.tags.includes("Breakfast"));
  const breakfastFallback = breakfastPool.length ? breakfastPool : usable;

  // Times each recipe has already been scheduled within *this* generation run.
  const usedThisWeek = new Map<string, number>();

  function isEligible(recipe: Recipe, slotDate: Date): boolean {
    const frequency = frequencyOf(recipe);
    if ((usedThisWeek.get(recipe.id) ?? 0) >= WEEKLY_CAP[frequency]) return false;

    const cooldownDays = COOLDOWN_DAYS[frequency];
    if (cooldownDays !== undefined) {
      const lastUsed = lastUsedDate.get(recipe.id);
      if (lastUsed && (slotDate.getTime() - lastUsed.getTime()) / MS_PER_DAY < cooldownDays) return false;
    }

    return true;
  }

  function pick(basePool: Recipe[], slotDate: Date): string {
    const eligible = basePool.filter((r) => isEligible(r, slotDate));
    let candidates = eligible;
    if (options.avoidRepeats) {
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

  const entries: { date: Date; mealType: MealType; recipeId: string }[] = [];
  for (const date of eachDate(options.startDate, options.endDate)) {
    for (const mealType of mealTypes) {
      const basePool = mealType === "breakfast" ? breakfastFallback : usable;
      entries.push({ date, mealType, recipeId: pick(basePool, date) });
    }
  }

  return Promise.all(entries.map((entry) => upsertMealPlanEntry(organizationId, entry)));
}
