import { registerWebModule, NativeModule } from 'expo';

// KeyboardControlModule is not available on the web platform — the browser
// shows/hides its own on-screen keyboard based on focus, no gate to bypass.
class KeyboardControlModule extends NativeModule<{}> {
  async forceShowKeyboardForView(): Promise<void> {}
}

export default registerWebModule(KeyboardControlModule, 'KeyboardControlModule');
