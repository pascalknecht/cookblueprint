// Canonical definitions (including the generation-weighting constants,
// now also used by the mobile app's local trial-mode meal-plan generator)
// live in packages/shared/src/recipe-frequency.ts, shared with
// apps/mobile/src/constants/recipe-frequency.ts.

export {
  ALL_RECIPE_FREQUENCIES,
  COOLDOWN_DAYS,
  DEFAULT_RECIPE_FREQUENCY,
  MAX_COOLDOWN_DAYS,
  WEEKLY_CAP,
} from "@repo/shared";
export type { RecipeFrequency } from "@repo/shared";

import type { RecipeFrequency } from "@repo/shared";

export const RECIPE_FREQUENCY_LABELS: Record<RecipeFrequency, string> = {
  daily: "Daily",
  biweekly: "Biweekly",
  weekly: "Weekly",
  everyTwoWeeks: "Every two weeks",
  rarely: "Rarely",
};
