import { ExtensionStorage } from '@bacons/apple-targets';
import { Platform } from 'react-native';

import { refreshAndroidMealPlanWidget, refreshAndroidShoppingListWidget } from './android-widget-refresh';
import { syncLocalWidgetData } from './sync-local-widget-data';
import { MEAL_PLAN_WIDGET_NAME, SHOPPING_LIST_WIDGET_NAME } from './widget-names';

/**
 * Nudges the home-screen widgets to redraw right after the app changes data
 * they display, instead of waiting for the OS's own refresh schedule
 * (Android's `updatePeriodMillis`, iOS's WidgetKit refresh budget). Signed-in
 * widgets still fetch live from the API themselves; local-mode ones read
 * local-db (Android directly, iOS via the App Group snapshot refreshed here
 * — `syncLocalWidgetData` no-ops outside local mode, safe to call always).
 * Safe to call on every platform; each branch only calls into the native
 * module for its own OS.
 */
export async function refreshMealPlanWidget() {
  if (Platform.OS === 'android') {
    refreshAndroidMealPlanWidget();
  } else if (Platform.OS === 'ios') {
    await syncLocalWidgetData();
    ExtensionStorage.reloadWidget(MEAL_PLAN_WIDGET_NAME);
  }
}

export async function refreshShoppingListWidget() {
  if (Platform.OS === 'android') {
    refreshAndroidShoppingListWidget();
  } else if (Platform.OS === 'ios') {
    await syncLocalWidgetData();
    ExtensionStorage.reloadWidget(SHOPPING_LIST_WIDGET_NAME);
  }
}
