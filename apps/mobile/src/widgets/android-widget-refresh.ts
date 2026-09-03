// No-op off Android — see android-widget-refresh.android.ts. Kept as a
// platform-split pair so refresh-widgets.ts never pulls
// react-native-android-widget into the iOS bundle graph.
export function refreshAndroidMealPlanWidget() {}
export function refreshAndroidShoppingListWidget() {}
