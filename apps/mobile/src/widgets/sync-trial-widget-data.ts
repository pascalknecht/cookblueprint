import { ExtensionStorage } from '@bacons/apple-targets';
import { Platform } from 'react-native';

import { listAllMealPlanEntries } from '@/lib/local-db/meal-plan';
import { listShoppingItems } from '@/lib/local-db/shopping-items';
import { isTrialActive } from '@/lib/local-db/trial-state';

import { WIDGET_APP_GROUP } from './widget-names';

/**
 * The iOS widget extension is a separate process with no access to
 * expo-sqlite, so trial-mode data has to be pushed into the same shared App
 * Group storage `useSyncWidgetAuth` already uses for the session cookie —
 * just JSON shaped to match what SharedData.swift/Models.swift decode.
 * Mirrors apps/nextjs's /api/meal-plans and /api/shopping-items response
 * shapes (only the fields the Swift widgets actually render).
 */
export async function syncTrialWidgetData(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  if (!(await isTrialActive())) return;

  const [mealPlanEntries, shoppingItems] = await Promise.all([listAllMealPlanEntries(), listShoppingItems()]);

  const mealPlanJSON = JSON.stringify({
    items: mealPlanEntries.map((entry) => ({
      date: entry.date,
      mealType: entry.mealType,
      recipe: { title: entry.recipe.title },
    })),
  });
  const shoppingListJSON = JSON.stringify({
    items: shoppingItems.map((item) => ({ name: item.name, checked: item.checked })),
  });

  const storage = new ExtensionStorage(WIDGET_APP_GROUP);
  storage.set('trialModeActive', 1);
  storage.set('trialMealPlanJSON', mealPlanJSON);
  storage.set('trialShoppingListJSON', shoppingListJSON);
}

export function clearTrialWidgetData(): void {
  if (Platform.OS !== 'ios') return;

  const storage = new ExtensionStorage(WIDGET_APP_GROUP);
  storage.remove('trialModeActive');
  storage.remove('trialMealPlanJSON');
  storage.remove('trialShoppingListJSON');
}
