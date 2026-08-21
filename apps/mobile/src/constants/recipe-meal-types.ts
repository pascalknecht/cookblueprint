// Canonical definitions live in packages/shared/src/recipe-meal-types.ts,
// shared with apps/nextjs/src/lib/recipe-meal-types.ts.
//
// Deliberately a separate, smaller set from constants/meal-types.ts's MealType
// (which drives per-day meal-plan slots, including morning/afternoon snacks) —
// this one just categorizes a recipe for filtering/browsing.

// Display labels live in src/lib/i18n/{en,de}.ts under `recipeMealTypes` — look them up via
// `t(\`recipeMealTypes.${mealType}\`)` rather than a hardcoded English map.

export { RECIPE_MEAL_TYPES, normalizeRecipeMealTypes } from '@repo/shared';
export type { RecipeMealType } from '@repo/shared';
