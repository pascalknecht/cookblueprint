import { Easing } from 'react-native-reanimated';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReducedMotionFlag } from '@/lib/motion';

const PRESS_SCALE = 0.97;
const PRESS_MS = 120;

// Shared press feedback for any pressable (Button, IconButton, week-nav …).
// Returns an animated scale style plus the onPressIn/onPressOut handlers to
// hand to a Pressable. A press-in, commit-on-press-out feedback loop: the
// scale drops the instant the finger lands rather than after the tap
// completes, which is the latency a user actually perceives on mobile. Kept
// under 150ms and transform-only (scale carries the label/icons with it, so
// it reads as physical rather than a layout reshuffle).
export function usePressFeedback() {
  const reduced = useReducedMotionFlag();
  const pressed = useSharedValue(false);

  const style = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(pressed.value ? PRESS_SCALE : 1, {
          duration: reduced ? 0 : PRESS_MS,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  return { isPressed: pressed, onPressIn: () => (pressed.value = true), onPressOut: () => (pressed.value = false), style };
}
