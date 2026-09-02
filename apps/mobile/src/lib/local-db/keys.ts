export const LOCAL_KEYS = {
  active: 'local.active',
  recipes: 'local.recipes',
  mealPlanEntries: 'local.mealPlanEntries',
  shoppingItems: 'local.shoppingItems',
  recentShoppingItems: 'local.recentShoppingItems',
  settings: 'local.settings',
} as const;

/** Previous key prefix — getJSON still reads these if the new key is empty. */
const LEGACY_KEY_PREFIX = 'trial.';

export function legacyKeyFor(localKey: string): string | null {
  if (!localKey.startsWith('local.')) return null;
  return `${LEGACY_KEY_PREFIX}${localKey.slice('local.'.length)}`;
}

/** Storage keys holding actual local data — cleared on reconciliation, but not the flags themselves. */
export const LOCAL_DATA_KEYS = [
  LOCAL_KEYS.recipes,
  LOCAL_KEYS.mealPlanEntries,
  LOCAL_KEYS.shoppingItems,
  LOCAL_KEYS.recentShoppingItems,
  LOCAL_KEYS.settings,
] as const;
