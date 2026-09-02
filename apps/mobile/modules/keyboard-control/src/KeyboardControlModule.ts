import { NativeModule, requireNativeModule } from 'expo';

declare class KeyboardControlModule extends NativeModule<{}> {
  /**
   * Forces the soft keyboard to show for the given native view (pass the
   * numeric tag from `findNodeHandle(ref)`), bypassing the `isInTouchMode`
   * gate that can silently block `TextInput.focus()` from showing it (e.g.
   * right after a Back key event, or for a TextInput hosted inside a native
   * modal sheet).
   */
  forceShowKeyboardForView(viewTag: number): Promise<void>;
}

export default requireNativeModule<KeyboardControlModule>('KeyboardControl');
