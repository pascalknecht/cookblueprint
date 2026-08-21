// Canonical definitions live in packages/shared/src/meal-types.ts, shared
// with apps/nextjs/src/lib/meal-types.ts.

// Display labels live in src/lib/i18n/{en,de}.ts under `mealTypes` — look them up via
// `t(\`mealTypes.${mealType}\`)` rather than a hardcoded English map.

export {
  ALL_MEAL_TYPES,
  DEFAULT_ENABLED_MEAL_TYPES,
  normalizeEnabledMealTypes,
  sortMealTypes,
} from '@repo/shared';
export type { MealType } from '@repo/shared';
