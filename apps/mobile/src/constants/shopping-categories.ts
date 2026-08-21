import type { Ionicons } from '@expo/vector-icons';
import { ALL_SHOPPING_CATEGORIES, type ShoppingCategory } from '@repo/shared';

import { MiseColors } from '@/constants/theme';

// Canonical list/order-normalization live in packages/shared/src/shopping-categories.ts,
// shared with apps/nextjs/src/lib/shopping-categories.ts. Icons/colors below are UI-only.

export { DEFAULT_SHOPPING_CATEGORY_ORDER, normalizeShoppingCategoryOrder } from '@repo/shared';
export type { ShoppingCategory } from '@repo/shared';

export const SHOPPING_CATEGORIES = ALL_SHOPPING_CATEGORIES;

export const DEFAULT_SHOPPING_CATEGORY: ShoppingCategory = 'Produce';

export const SHOPPING_CATEGORY_ICON: Record<ShoppingCategory, keyof typeof Ionicons.glyphMap> = {
  Produce: 'leaf-outline',
  'Dairy & Eggs': 'egg-outline',
  'Meat & Fish': 'fish-outline',
  Bakery: 'pizza-outline',
  Pantry: 'basket-outline',
};

export const SHOPPING_CATEGORY_COLOR: Record<ShoppingCategory, string> = {
  Produce: MiseColors.success,
  'Dairy & Eggs': MiseColors.gold,
  'Meat & Fish': MiseColors.brand,
  Bakery: MiseColors.clay,
  Pantry: MiseColors.berry,
};

// SHOPPING_CATEGORIES values are stored/queried as-is (English) for data integrity — this maps
// each to its translation key under src/lib/i18n/{en,de}.ts's `shoppingCategories`, e.g.
// `t(\`shoppingCategories.${SHOPPING_CATEGORY_KEY[cat]}\`)`, for display only.
export const SHOPPING_CATEGORY_KEY: Record<ShoppingCategory, string> = {
  Produce: 'produce',
  'Dairy & Eggs': 'dairyEggs',
  'Meat & Fish': 'meatFish',
  Bakery: 'bakery',
  Pantry: 'pantry',
};
