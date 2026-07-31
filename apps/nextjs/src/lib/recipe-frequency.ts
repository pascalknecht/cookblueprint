// Mirrored (labels/hints only — the generation weighting below is backend-only)
// in apps/mobile/src/constants/recipe-frequency.ts. Keep the two in sync.

export const ALL_RECIPE_FREQUENCIES = ["daily", "biweekly", "weekly", "everyTwoWeeks", "rarely"] as const;

export type RecipeFrequency = (typeof ALL_RECIPE_FREQUENCIES)[number];

export const RECIPE_FREQUENCY_LABELS: Record<RecipeFrequency, string> = {
  daily: "Daily",
  biweekly: "Biweekly",
  weekly: "Weekly",
  everyTwoWeeks: "Every two weeks",
  rarely: "Rarely",
};

export const DEFAULT_RECIPE_FREQUENCY: RecipeFrequency = "weekly";

/** Max times a recipe can be scheduled within a single generated week. */
export const WEEKLY_CAP: Record<RecipeFrequency, number> = {
  daily: Infinity,
  biweekly: 2,
  weekly: 1,
  everyTwoWeeks: 1,
  rarely: 1,
};

/**
 * Days to look back before a generation's start date: a recipe used more
 * recently than this is skipped, so "every two weeks" / "rarely" recipes
 * actually stay spaced out across separate auto-plan runs, not just within
 * one generated week. Frequencies absent here have no cross-week cooldown.
 */
export const COOLDOWN_DAYS: Partial<Record<RecipeFrequency, number>> = {
  everyTwoWeeks: 13,
  rarely: 41,
};

export const MAX_COOLDOWN_DAYS = Math.max(...Object.values(COOLDOWN_DAYS));
