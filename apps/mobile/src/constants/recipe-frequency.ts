// Mirrored in apps/nextjs/src/lib/recipe-frequency.ts — keep the two in sync.
// There's no shared package between the apps yet (see root README), so this
// is duplicated deliberately rather than reached into from the other app.

export const ALL_RECIPE_FREQUENCIES = ['daily', 'biweekly', 'weekly', 'everyTwoWeeks', 'rarely'] as const;

export type RecipeFrequency = (typeof ALL_RECIPE_FREQUENCIES)[number];

// Display labels live in src/lib/i18n/{en,de}.ts under `recipeFrequency` — look them up via
// `t(\`recipeFrequency.${frequency}\`)` rather than a hardcoded English map.

export const DEFAULT_RECIPE_FREQUENCY: RecipeFrequency = 'weekly';
