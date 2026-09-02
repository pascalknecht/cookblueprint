import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock, generateTextMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  generateTextMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    mealPlanEntry: { findMany: findManyMock },
  },
}));

vi.mock("@/lib/ai/meal-plan-model", () => ({
  getMealPlanModel: () => "mock-model",
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return { ...actual, generateText: generateTextMock };
});

const { generateMealPlanWithAI } = await import("@/use-cases/ai-meal-plan");

type ToolSet = {
  getRecipes: { execute: (input: unknown) => Promise<unknown> };
  getMealPlanEntries: { execute: (input: unknown) => Promise<unknown> };
  submitMealPlan: { execute: (input: unknown) => Promise<{ results: { ok: boolean; reason?: string }[] }> };
};

const RECIPES = [
  {
    id: "r1",
    title: "Oatmeal",
    mealTypes: ["breakfast"],
    frequency: "daily",
    time: 10,
    kcal: "300",
    ingredients: [{ n: "oats", q: "1 cup", cat: "Pantry" }],
  },
  {
    id: "r2",
    title: "Salad",
    mealTypes: ["lunch", "dinner"],
    frequency: "weekly",
    time: 15,
    kcal: "400",
    ingredients: [{ n: "lettuce", q: "1 head", cat: "Produce" }],
  },
];

const baseOptions = {
  startDate: new Date("2026-09-07T00:00:00.000Z"),
  endDate: new Date("2026-09-07T00:00:00.000Z"),
  enabledMealTypes: ["breakfast", "lunch"] as const,
  recipes: RECIPES,
  priorEntries: [],
};

beforeEach(() => {
  generateTextMock.mockReset();
  findManyMock.mockReset();
  findManyMock.mockResolvedValue([]);
});

describe("generateMealPlanWithAI", () => {
  it("accepts a valid submission covering every slot, and exposes recipes/history via tools", async () => {
    findManyMock.mockResolvedValue([
      { date: new Date("2026-08-31T00:00:00.000Z"), mealType: "dinner", recipeId: "r2", recipe: { title: "Salad" } },
    ]);

    generateTextMock.mockImplementation(async ({ tools }: { tools: ToolSet }) => {
      const recipes = (await tools.getRecipes.execute({})) as unknown[];
      expect(recipes).toHaveLength(2);

      const history = (await tools.getMealPlanEntries.execute({
        startDate: "2026-08-01",
        endDate: "2026-09-07",
      })) as { date: string; mealType: string; recipeId: string; recipeTitle: string }[];
      expect(findManyMock).toHaveBeenCalled();
      expect(history).toEqual([{ date: "2026-08-31", mealType: "dinner", recipeId: "r2", recipeTitle: "Salad" }]);

      await tools.submitMealPlan.execute({
        entries: [
          { date: "2026-09-07", mealType: "breakfast", recipeId: "r1" },
          { date: "2026-09-07", mealType: "lunch", recipeId: "r2" },
        ],
      });
      return {};
    });

    const result = await generateMealPlanWithAI("org1", baseOptions as never);

    expect(result).toHaveLength(2);
    expect(result.find((e) => e.mealType === "breakfast")?.recipeId).toBe("r1");
    expect(result.find((e) => e.mealType === "lunch")?.recipeId).toBe("r2");
  });

  it("rejects an unknown recipeId with a reason and backfills the slot deterministically", async () => {
    generateTextMock.mockImplementation(async ({ tools }: { tools: ToolSet }) => {
      const submission = await tools.submitMealPlan.execute({
        entries: [{ date: "2026-09-07", mealType: "breakfast", recipeId: "does-not-exist" }],
      });
      expect(submission.results[0].ok).toBe(false);
      expect(submission.results[0].reason).toMatch(/getRecipes/i);
      return {};
    });

    const result = await generateMealPlanWithAI("org1", baseOptions as never);

    expect(result).toHaveLength(2);
    const validIds = new Set(RECIPES.map((r) => r.id));
    for (const entry of result) {
      expect(validIds.has(entry.recipeId)).toBe(true);
    }
    // Only r1 supports breakfast, so the backfilled breakfast slot must be r1.
    expect(result.find((e) => e.mealType === "breakfast")?.recipeId).toBe("r1");
  });

  it("rejects a recipe that doesn't support the submitted meal type", async () => {
    generateTextMock.mockImplementation(async ({ tools }: { tools: ToolSet }) => {
      const submission = await tools.submitMealPlan.execute({
        entries: [{ date: "2026-09-07", mealType: "lunch", recipeId: "r1" }],
      });
      expect(submission.results[0].ok).toBe(false);
      expect(submission.results[0].reason).toMatch(/lunch/);
      return {};
    });

    await generateMealPlanWithAI("org1", baseOptions as never);
  });

  it("rejects a date outside the requested range", async () => {
    generateTextMock.mockImplementation(async ({ tools }: { tools: ToolSet }) => {
      const submission = await tools.submitMealPlan.execute({
        entries: [{ date: "2026-01-01", mealType: "breakfast", recipeId: "r1" }],
      });
      expect(submission.results[0].ok).toBe(false);
      expect(submission.results[0].reason).toMatch(/range/i);
      return {};
    });

    await generateMealPlanWithAI("org1", baseOptions as never);
  });

  it("falls back to a fully deterministic plan when the model call throws", async () => {
    generateTextMock.mockRejectedValue(new Error("provider unavailable"));

    const result = await generateMealPlanWithAI("org1", baseOptions as never);

    expect(result).toHaveLength(2);
    expect(result.every((e) => RECIPES.some((r) => r.id === e.recipeId))).toBe(true);
  });
});
