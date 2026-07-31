// Mirrored in apps/mobile/src/constants/meal-types.ts — keep the two in sync.
// There's no shared package between the apps yet (see root README), so this
// is duplicated deliberately rather than reached into from the other app.

export const ALL_MEAL_TYPES = ["breakfast", "morningSnack", "lunch", "afternoonSnack", "dinner"] as const;

export type MealType = (typeof ALL_MEAL_TYPES)[number];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  morningSnack: "Morning snack",
  lunch: "Lunch",
  afternoonSnack: "Afternoon snack",
  dinner: "Dinner",
};

export const DEFAULT_ENABLED_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

/** Puts meal types back into their canonical day order, deduped. */
export function sortMealTypes(mealTypes: MealType[]): MealType[] {
  const set = new Set(mealTypes);
  return ALL_MEAL_TYPES.filter((type) => set.has(type));
}

function isMealType(value: string): value is MealType {
  return (ALL_MEAL_TYPES as readonly string[]).includes(value);
}

/** Validates + normalizes a proposed enabled-meal-types list. Never returns an empty list. */
export function normalizeEnabledMealTypes(mealTypes: string[]): MealType[] {
  const valid = sortMealTypes(mealTypes.filter(isMealType));
  return valid.length ? valid : DEFAULT_ENABLED_MEAL_TYPES;
}
