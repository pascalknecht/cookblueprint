import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { MEAL_PLAN_WIDGET_NAME, SHOPPING_LIST_WIDGET_NAME } from '@/widgets/widget-names';

import { renderMealPlanWidget } from './meal-plan-widget';
import { renderShoppingListWidget } from './shopping-list-widget';

/**
 * Runs as a Headless JS task (same JS bundle as the app, possibly a fresh
 * instance if the app process was killed) whenever Android needs the widget
 * redrawn — on add, on its own `updatePeriodMillis` schedule, or on resize.
 * Both widgets fetch straight from the API using the app's existing
 * auth-client/api-client, since this handler shares the app's module graph.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetAction === 'WIDGET_DELETED') return;

  switch (props.widgetInfo.widgetName) {
    case MEAL_PLAN_WIDGET_NAME:
      props.renderWidget(await renderMealPlanWidget());
      break;
    case SHOPPING_LIST_WIDGET_NAME:
      props.renderWidget(await renderShoppingListWidget());
      break;
  }
}
