import { prisma } from "@/lib/prisma";

export type MealType = "breakfast" | "lunch" | "dinner";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

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

export async function generateMealPlan(
  organizationId: string,
  options: { startDate: Date; endDate: Date; vegetarianOnly?: boolean; avoidRepeats?: boolean },
) {
  const recipes = await prisma.recipe.findMany({ where: { organizationId } });
  if (recipes.length === 0) return [];

  const pool = options.vegetarianOnly ? recipes.filter((r) => r.tags.includes("Veg")) : recipes;
  const usable = pool.length ? pool : recipes;
  const ids = usable.map((r) => r.id);
  const breakfastIds = usable.filter((r) => r.tags.includes("Breakfast")).map((r) => r.id);
  const breakfastPool = breakfastIds.length ? breakfastIds : ids;

  const used = new Set<string>();
  const pick = (fromIds: string[]) => {
    const available = options.avoidRepeats ? fromIds.filter((id) => !used.has(id)) : fromIds;
    const source = available.length ? available : fromIds;
    const id = source[Math.floor(Math.random() * source.length)];
    used.add(id);
    return id;
  };

  const entries: { date: Date; mealType: MealType; recipeId: string }[] = [];
  for (const date of eachDate(options.startDate, options.endDate)) {
    entries.push({ date, mealType: "breakfast", recipeId: pick(breakfastPool) });
    entries.push({ date, mealType: "lunch", recipeId: pick(ids) });
    entries.push({ date, mealType: "dinner", recipeId: pick(ids) });
  }

  return Promise.all(entries.map((entry) => upsertMealPlanEntry(organizationId, entry)));
}
