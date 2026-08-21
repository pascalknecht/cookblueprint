export const ALL_SHOPPING_CATEGORIES = ['Produce', 'Dairy & Eggs', 'Meat & Fish', 'Bakery', 'Pantry'] as const;

export type ShoppingCategory = (typeof ALL_SHOPPING_CATEGORIES)[number];

export const DEFAULT_SHOPPING_CATEGORY_ORDER: ShoppingCategory[] = [...ALL_SHOPPING_CATEGORIES];

function isShoppingCategory(value: string): value is ShoppingCategory {
  return (ALL_SHOPPING_CATEGORIES as readonly string[]).includes(value);
}

/** Validates a proposed category order, appending any category missing from it so every category is always present exactly once. */
export function normalizeShoppingCategoryOrder(order: string[]): ShoppingCategory[] {
  const valid = order.filter(isShoppingCategory);
  const missing = ALL_SHOPPING_CATEGORIES.filter((cat) => !valid.includes(cat));
  return [...valid, ...missing];
}
