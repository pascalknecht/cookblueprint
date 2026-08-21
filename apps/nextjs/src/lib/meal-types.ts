// Canonical definitions live in packages/shared/src/meal-types.ts, shared
// with apps/mobile/src/constants/meal-types.ts.

export { ALL_MEAL_TYPES, DEFAULT_ENABLED_MEAL_TYPES, normalizeEnabledMealTypes, sortMealTypes } from "@repo/shared";
export type { MealType } from "@repo/shared";

import type { MealType } from "@repo/shared";

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  morningSnack: "Morning snack",
  lunch: "Lunch",
  afternoonSnack: "Afternoon snack",
  dinner: "Dinner",
};
