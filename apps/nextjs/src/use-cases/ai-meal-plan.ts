import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";

import { getMealPlanModel } from "@/lib/ai/meal-plan-model";
import { ALL_MEAL_TYPES, type MealType } from "@/lib/meal-types";
import { prisma } from "@/lib/prisma";
import { COOLDOWN_DAYS, WEEKLY_CAP } from "@/lib/recipe-frequency";
import {
  generateMealPlanEntries,
  type CookingStyle,
  type GeneratedMealPlanEntry,
  type MealPlanGeneratorPriorEntry,
} from "@repo/shared";

type OrgRecipe = {
  id: string;
  title: string;
  mealTypes: string[];
  frequency: string | null;
  time: number;
  kcal: string;
  ingredients: unknown;
};

export type AiMealPlanOptions = {
  startDate: Date;
  endDate: Date;
  enabledMealTypes: MealType[];
  recipes: OrgRecipe[];
  priorEntries: MealPlanGeneratorPriorEntry[];
  cookingStyle?: CookingStyle;
  leftovers?: boolean;
  keepPlanned?: boolean;
};

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function slotKey(date: string, mealType: string): string {
  return `${date}|${mealType}`;
}

function ingredientNames(ingredients: unknown): string[] {
  if (!Array.isArray(ingredients)) return [];
  return ingredients
    .map((ing) => (ing && typeof ing === "object" && "n" in ing ? String((ing as { n: unknown }).n) : null))
    .filter((name): name is string => Boolean(name));
}

function frequencyRulesText(): string {
  const capLines = Object.entries(WEEKLY_CAP)
    .filter(([, cap]) => Number.isFinite(cap))
    .map(([freq, cap]) => `- "${freq}": at most ${cap}x within the requested range`);
  const cooldownLines = Object.entries(COOLDOWN_DAYS).map(
    ([freq, days]) => `- "${freq}": don't repeat within ${days} days of its last use`,
  );
  return [...capLines, ...cooldownLines].join("\n");
}

/**
 * AI-driven meal plan generation for entitled organizations: the model gets
 * read access to the org's recipes and meal-plan history via tools, and
 * submits its picks through a write tool that only guards referential
 * integrity (no hallucinated recipe ids, no writes outside the request).
 * Weekly-cap/cooldown/variety judgment is left to the model, informed by the
 * real data it fetches. Any slot it doesn't fill — because it ran out of
 * steps, errored, or no API key is configured — is backfilled by the plain
 * deterministic generator, so a complete plan is always returned.
 */
export async function generateMealPlanWithAI(
  organizationId: string,
  options: AiMealPlanOptions,
): Promise<GeneratedMealPlanEntry[]> {
  const { startDate, endDate, enabledMealTypes, recipes, priorEntries } = options;
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const accepted = new Map<string, GeneratedMealPlanEntry>();

  const getRecipesTool = tool({
    description: "Get every recipe available to this household, including ingredients.",
    inputSchema: z.object({}),
    execute: async () =>
      recipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        mealTypes: recipe.mealTypes,
        frequency: recipe.frequency,
        timeMinutes: recipe.time,
        kcal: recipe.kcal,
        ingredients: ingredientNames(recipe.ingredients),
      })),
  });

  const getMealPlanEntriesTool = tool({
    description:
      "Get the household's meal plan entries (already cooked or already scheduled) for a date range. Use this to check recent history and what's already planned in the target range.",
    inputSchema: z.object({
      startDate: z.string().describe("ISO date, e.g. 2026-09-01"),
      endDate: z.string().describe("ISO date, e.g. 2026-09-07"),
    }),
    execute: async ({ startDate: from, endDate: to }) => {
      const entries = await prisma.mealPlanEntry.findMany({
        where: { organizationId, date: { gte: new Date(from), lte: new Date(to) } },
        include: { recipe: { select: { title: true } } },
        orderBy: [{ date: "asc" }, { mealType: "asc" }],
      });
      return entries.map((entry) => ({
        date: toISODate(entry.date),
        mealType: entry.mealType,
        recipeId: entry.recipeId,
        recipeTitle: entry.recipe.title,
      }));
    },
  });

  const submitMealPlanTool = tool({
    description:
      "Submit meal plan entries for the requested date range. Call once with a complete week; you may call again to fix any entries that come back rejected.",
    inputSchema: z.object({
      entries: z.array(
        z.object({
          date: z.string().describe("ISO date, e.g. 2026-09-01"),
          mealType: z.enum(ALL_MEAL_TYPES),
          recipeId: z.string(),
        }),
      ),
    }),
    execute: async ({ entries }) => ({
      results: entries.map((entry) => {
        const recipe = recipesById.get(entry.recipeId);
        if (!recipe) {
          return { ...entry, ok: false, reason: "Unknown recipeId — call getRecipes first." };
        }
        if (!recipe.mealTypes.includes(entry.mealType)) {
          return { ...entry, ok: false, reason: `This recipe doesn't support ${entry.mealType}.` };
        }
        if (!enabledMealTypes.includes(entry.mealType)) {
          return { ...entry, ok: false, reason: `${entry.mealType} isn't an enabled meal type.` };
        }
        const parsedDate = new Date(entry.date);
        if (Number.isNaN(parsedDate.getTime()) || parsedDate < startDate || parsedDate > endDate) {
          return { ...entry, ok: false, reason: "Date is outside the requested range." };
        }

        accepted.set(slotKey(entry.date, entry.mealType), {
          date: parsedDate,
          mealType: entry.mealType,
          recipeId: entry.recipeId,
        });
        return { ...entry, ok: true };
      }),
    }),
  });

  const preferenceLines = [
    options.cookingStyle
      ? `Cooking style: "${options.cookingStyle}". "optimized" means favor recipes that share ingredients across the week (cook once, eat twice — a bunch of herbs or a base ingredient covers several meals). "balanced" means some ingredient overlap between adjacent days, then reset. "diverse" means every meal stands on its own — don't optimize for ingredient overlap.`
      : null,
    options.leftovers
      ? "Leftovers: when it makes sense, you may submit the same recipeId for a lunch slot the day after it was used for dinner — that's just dinner leftovers for lunch, not a repeat to avoid."
      : null,
    options.keepPlanned
      ? "Some slots in the target range may already be planned — check getMealPlanEntries for the target range first and focus your picks on the empty ones."
      : null,
  ].filter((line): line is string => Boolean(line));

  const system = [
    `You are planning meals for a household from ${toISODate(startDate)} to ${toISODate(endDate)}, for these meal types: ${enabledMealTypes.join(", ")}.`,
    "Call getRecipes and getMealPlanEntries (covering roughly the last 4 weeks, plus the target range) before deciding.",
    "Each recipe has a frequency that limits how often it should appear:",
    frequencyRulesText(),
    "Then call submitMealPlan once with one entry per (date, mealType) slot in the target range. If some entries come back rejected, call submitMealPlan again to fix just those.",
    ...preferenceLines,
  ].join("\n\n");

  try {
    await generateText({
      model: getMealPlanModel(),
      system,
      prompt: "Plan the meals now.",
      tools: {
        getRecipes: getRecipesTool,
        getMealPlanEntries: getMealPlanEntriesTool,
        submitMealPlan: submitMealPlanTool,
      },
      stopWhen: stepCountIs(6),
    });
  } catch (error) {
    console.warn("AI meal plan generation failed, falling back to deterministic picks.", error);
  }

  const backfillCandidates = generateMealPlanEntries({
    startDate,
    endDate,
    recipes: recipes.map((recipe) => ({ id: recipe.id, frequency: recipe.frequency, mealTypes: recipe.mealTypes })),
    enabledMealTypes,
    priorEntries,
  });

  for (const entry of backfillCandidates) {
    const key = slotKey(toISODate(entry.date), entry.mealType);
    if (!accepted.has(key)) accepted.set(key, entry);
  }

  return Array.from(accepted.values());
}
