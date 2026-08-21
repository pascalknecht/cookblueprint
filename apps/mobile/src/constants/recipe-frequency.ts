// Canonical definitions (including the generation-weighting constants used by
// the local trial-mode meal-plan generator) live in
// packages/shared/src/recipe-frequency.ts, shared with
// apps/nextjs/src/lib/recipe-frequency.ts.

// Display labels live in src/lib/i18n/{en,de}.ts under `recipeFrequency` — look them up via
// `t(\`recipeFrequency.${frequency}\`)` rather than a hardcoded English map.

export {
  ALL_RECIPE_FREQUENCIES,
  COOLDOWN_DAYS,
  DEFAULT_RECIPE_FREQUENCY,
  MAX_COOLDOWN_DAYS,
  WEEKLY_CAP,
} from '@repo/shared';
export type { RecipeFrequency } from '@repo/shared';
