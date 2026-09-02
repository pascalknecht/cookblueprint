package expo.modules.keyboardcontrol

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.ViewTreeObserver
import android.view.inputmethod.InputMethodManager
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// How long to wait for the sheet's dialog window to actually receive Android
// window focus before giving up and trying showSoftInput anyway.
private const val WINDOW_FOCUS_TIMEOUT_MS = 2000L

class KeyboardControlModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("KeyboardControl")

    // RN's TextInput.focus() only shows the soft keyboard when the view's
    // window believes it is in touch mode (see ReactEditText.kt,
    // requestFocusProgrammatically -> isInTouchMode guard). That flag can be
    // false for a view hosted inside a separate native surface (e.g. a
    // Compose ModalBottomSheet), or after a hardware/software Back key event
    // resets it, even though the view has genuinely gained focus.
    //
    // Taking the target `View` as a typed parameter (instead of guessing at
    // "whatever's currently focused" via the Activity) lets Expo's own
    // ViewTypeConverter resolve it straight from its React view tag through
    // the UI manager's own view registry — which works regardless of which
    // window/surface actually hosts it — and `view.context` then gives us
    // an InputMethodManager scoped to that exact window, not just the main
    // Activity's. That resolution asserts it's running on the main thread,
    // so this has to be an AsyncFunction pinned to Queues.MAIN — a plain
    // Function runs on the JS thread by default and the assertion fails.
    //
    // Measured on device: right after the sheet opens, the view already
    // reports isFocused/hasFocus=true, but hasWindowFocus=false — its dialog
    // window (Material3's ModalBottomSheet renders in its own Window, see
    // github.com/expo/expo/pull/49215) hasn't yet been granted actual Android
    // window focus by WindowManager, and showSoftInput correctly refuses to
    // show a keyboard for an unfocused window. A real tap made a moment later
    // works fine, so this reads as a race, not a permanent block — wait for
    // the window focus grant instead of guessing at a fixed delay.
    AsyncFunction("forceShowKeyboardForView") { view: View ->
      fun show(reason: String) {
        val imm = view.context.getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
        val result = imm?.showSoftInput(view, InputMethodManager.SHOW_FORCED)
        Log.d("KeyboardControl", "showSoftInput ($reason): hasWindowFocus=${view.hasWindowFocus()} result=$result")
      }

      if (view.hasWindowFocus()) {
        show("already focused")
        return@AsyncFunction
      }

      val handler = Handler(Looper.getMainLooper())
      var settled = false
      lateinit var listener: ViewTreeObserver.OnWindowFocusChangeListener

      fun cleanup() {
        if (view.viewTreeObserver.isAlive) view.viewTreeObserver.removeOnWindowFocusChangeListener(listener)
      }

      listener = ViewTreeObserver.OnWindowFocusChangeListener { hasFocus ->
        if (hasFocus && !settled) {
          settled = true
          cleanup()
          show("window focus gained")
        }
      }
      view.viewTreeObserver.addOnWindowFocusChangeListener(listener)

      handler.postDelayed({
        if (!settled) {
          settled = true
          cleanup()
          show("timed out after ${WINDOW_FOCUS_TIMEOUT_MS}ms")
        }
      }, WINDOW_FOCUS_TIMEOUT_MS)
    }.runOnQueue(Queues.MAIN)
  }
}
