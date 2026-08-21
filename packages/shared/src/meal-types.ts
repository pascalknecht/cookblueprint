export const ALL_MEAL_TYPES = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner'] as const;

export type MealType = (typeof ALL_MEAL_TYPES)[number];

export const DEFAULT_ENABLED_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

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
