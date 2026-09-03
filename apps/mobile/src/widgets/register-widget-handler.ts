// No Android widget task handler to register off Android — kept as an empty
// counterpart to register-widget-handler.android.ts so index.ts can import
// this platform-agnostically without ever pulling react-native-android-widget
// (and its dependents) into the iOS bundle graph.
export {};
