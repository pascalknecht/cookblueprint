// recipe.tags / the recipes-screen filter chips are free-form strings stored/queried as-is
// (English) for data integrity. This maps the small set of *known* tags to their translation
// key under src/lib/i18n/{en,de}.ts's `recipeTags`, e.g. `t(\`recipeTags.${RECIPE_TAG_KEY[tag]}\`)`,
// for display only. Unrecognized/custom tags (e.g. "Imported", "My recipe") fall back to the
// raw tag text — see callers.
export const RECIPE_TAG_KEY: Record<string, string> = {
  Breakfast: 'breakfast',
  Lunch: 'lunch',
  Dinner: 'dinner',
  Veg: 'veg',
};
