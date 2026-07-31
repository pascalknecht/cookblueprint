// Mirrored in apps/nextjs/src/lib/meal-types.ts — keep the two in sync.
// There's no shared package between the apps yet (see root README), so this
// is duplicated deliberately rather than reached into from the other app.

export const ALL_MEAL_TYPES = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner'] as const;

export type MealType = (typeof ALL_MEAL_TYPES)[number];

// Display labels live in src/lib/i18n/{en,de}.ts under `mealTypes` — look them up via
// `t(\`mealTypes.${mealType}\`)` rather than a hardcoded English map.

export const DEFAULT_ENABLED_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

/** Puts meal types back into their canonical day order, deduped. */
export function sortMealTypes(mealTypes: MealType[]): MealType[] {
  const set = new Set(mealTypes);
  return ALL_MEAL_TYPES.filter((type) => set.has(type));
}
