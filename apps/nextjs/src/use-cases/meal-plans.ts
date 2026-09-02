import { env } from "@/env";
import { hasActiveEntitlement } from "@/lib/entitlement";
import { prisma } from "@/lib/prisma";
import { ALL_MEAL_TYPES, normalizeEnabledMealTypes, type MealType } from "@/lib/meal-types";
import { MAX_COOLDOWN_DAYS } from "@/lib/recipe-frequency";
import { generateMealPlanEntries, type CookingStyle } from "@repo/shared";
import { generateMealPlanWithAI } from "./ai-meal-plan";

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

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function generateMealPlan(
  organizationId: string,
  userId: string,
  options: {
    startDate: Date;
    endDate: Date;
    avoidRepeats?: boolean;
    cookingStyle?: CookingStyle;
    leftovers?: boolean;
    keepPlanned?: boolean;
  },
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

  const enabledMealTypes = normalizeEnabledMealTypes(organization?.enabledMealTypes ?? []);
  const wantsAI = Boolean(options.cookingStyle || options.leftovers);
  const useAI = wantsAI && (env.MEAL_PLAN_AI_FORCE === "true" || (await hasActiveEntitlement(userId)));

  let entries = useAI
    ? await generateMealPlanWithAI(organizationId, {
        startDate: options.startDate,
        endDate: options.endDate,
        enabledMealTypes,
        recipes,
        priorEntries,
        cookingStyle: options.cookingStyle,
        leftovers: options.leftovers,
        keepPlanned: options.keepPlanned,
      })
    : generateMealPlanEntries({
        startDate: options.startDate,
        endDate: options.endDate,
        avoidRepeats: options.avoidRepeats,
        recipes,
        enabledMealTypes,
        priorEntries,
      });

  if (options.keepPlanned) {
    const existing = await prisma.mealPlanEntry.findMany({
      where: { organizationId, date: { gte: options.startDate, lte: options.endDate } },
      select: { date: true, mealType: true },
    });
    const plannedKeys = new Set(existing.map((entry) => `${toISODate(entry.date)}|${entry.mealType}`));
    entries = entries.filter((entry) => !plannedKeys.has(`${toISODate(entry.date)}|${entry.mealType}`));
  }

  return Promise.all(entries.map((entry) => upsertMealPlanEntry(organizationId, entry)));
}
