import { requestWidgetUpdate } from 'react-native-android-widget';

import { MEAL_PLAN_WIDGET_NAME, SHOPPING_LIST_WIDGET_NAME } from './widget-names';

export function refreshAndroidMealPlanWidget() {
  requestWidgetUpdate({
    widgetName: MEAL_PLAN_WIDGET_NAME,
    renderWidget: () => import('./android/meal-plan-widget').then((m) => m.renderMealPlanWidget()),
  });
}

export function refreshAndroidShoppingListWidget() {
  requestWidgetUpdate({
    widgetName: SHOPPING_LIST_WIDGET_NAME,
    renderWidget: () => import('./android/shopping-list-widget').then((m) => m.renderShoppingListWidget()),
  });
}
