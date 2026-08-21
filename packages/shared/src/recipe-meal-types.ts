// Deliberately a separate, smaller set from meal-types.ts's MealType (which
// drives per-day meal-plan slots, including morning/afternoon snacks) — this
// one just categorizes a recipe for filtering/browsing.

export const RECIPE_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export type RecipeMealType = (typeof RECIPE_MEAL_TYPES)[number];

function isRecipeMealType(value: string): value is RecipeMealType {
  return (RECIPE_MEAL_TYPES as readonly string[]).includes(value);
}

/** Filters a proposed meal-types list down to valid, deduped values. */
export function normalizeRecipeMealTypes(mealTypes: string[]): RecipeMealType[] {
  return Array.from(new Set(mealTypes.filter(isRecipeMealType)));
}
