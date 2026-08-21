import { prisma } from "@/lib/prisma";
import { ALL_MEAL_TYPES, type MealType } from "@/lib/meal-types";
import { MAX_COOLDOWN_DAYS } from "@/lib/recipe-frequency";
import { generateMealPlanEntries } from "@repo/shared";

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

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export async function generateMealPlan(
  organizationId: string,
  options: { startDate: Date; endDate: Date; avoidRepeats?: boolean },
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

  const entries = generateMealPlanEntries({
    startDate: options.startDate,
    endDate: options.endDate,
    avoidRepeats: options.avoidRepeats,
    recipes,
    enabledMealTypes: organization?.enabledMealTypes ?? [],
    priorEntries,
  });

  return Promise.all(entries.map((entry) => upsertMealPlanEntry(organizationId, entry)));
}
