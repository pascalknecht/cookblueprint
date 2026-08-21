export const TRIAL_KEYS = {
  active: 'trial.active',
  recipes: 'trial.recipes',
  mealPlanEntries: 'trial.mealPlanEntries',
  shoppingItems: 'trial.shoppingItems',
  recentShoppingItems: 'trial.recentShoppingItems',
  settings: 'trial.settings',
} as const;

/** Storage keys holding actual trial data — cleared on reconciliation, but not the flags themselves. */
export const TRIAL_DATA_KEYS = [
  TRIAL_KEYS.recipes,
  TRIAL_KEYS.mealPlanEntries,
  TRIAL_KEYS.shoppingItems,
  TRIAL_KEYS.recentShoppingItems,
  TRIAL_KEYS.settings,
] as const;
