// KeyboardControlModule only exists on Android (see expo-module.config.json)
// — this workaround targets an Android-specific RN/Compose interop gap, so
// there is nothing to bypass here. iOS's TextInput.focus() shows the
// keyboard reliably on its own.
export default {
  async forceShowKeyboardForView(): Promise<void> {},
};
