import { ExtensionStorage } from '@bacons/apple-targets';
import { Platform } from 'react-native';

import { isLocalModeActive } from '@/lib/local-db/local-mode-state';
import { listAllMealPlanEntries } from '@/lib/local-db/meal-plan';
import { listShoppingItems } from '@/lib/local-db/shopping-items';

import { WIDGET_APP_GROUP } from './widget-names';

/**
 * The iOS widget extension is a separate process with no access to
 * expo-sqlite, so local-mode data has to be pushed into the same shared App
 * Group storage `useSyncWidgetAuth` already uses for the session cookie —
 * just JSON shaped to match what SharedData.swift/Models.swift decode.
 * Mirrors apps/nextjs's /api/meal-plans and /api/shopping-items response
 * shapes (only the fields the Swift widgets actually render).
 */
export async function syncLocalWidgetData(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  if (!(await isLocalModeActive())) return;

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
  storage.set('localModeActive', 1);
  storage.set('localMealPlanJSON', mealPlanJSON);
  storage.set('localShoppingListJSON', shoppingListJSON);
}

export function clearLocalWidgetData(): void {
  if (Platform.OS !== 'ios') return;

  const storage = new ExtensionStorage(WIDGET_APP_GROUP);
  storage.remove('localModeActive');
  storage.remove('localMealPlanJSON');
  storage.remove('localShoppingListJSON');
  storage.remove('trialModeActive');
  storage.remove('trialMealPlanJSON');
  storage.remove('trialShoppingListJSON');
}
