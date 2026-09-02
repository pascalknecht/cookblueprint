import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useMountEffect } from '@/hooks/use-mount-effect';

const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/** Mount-time splash choreography from /animated-splash/README.txt. */
export function useSplashMotion(reduced: boolean) {
  const markOpacity = useSharedValue(0);
  const markY = useSharedValue(reduced ? 0 : 14);
  const markScale = useSharedValue(reduced ? 1 : 0.94);
  const copyOpacity = useSharedValue(0);
  const copyY = useSharedValue(reduced ? 0 : 8);
  const steamT = useSharedValue(0);
  const spinT = useSharedValue(0);
  const loadingOpacity = useSharedValue(0);

  useMountEffect(() => {
    if (reduced) {
      markOpacity.set(withTiming(1, { duration: 240, easing: EASE_OUT }));
      copyOpacity.set(withTiming(1, { duration: 240, easing: EASE_OUT }));
      loadingOpacity.set(withTiming(1, { duration: 240, easing: EASE_OUT }));
      spinT.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false));
      return;
    }

    markOpacity.set(withTiming(1, { duration: 620, easing: EASE_SHEET }));
    markY.set(withTiming(0, { duration: 620, easing: EASE_SHEET }));
    markScale.set(withTiming(1, { duration: 620, easing: EASE_SHEET }));
    copyOpacity.set(withDelay(280, withTiming(1, { duration: 670, easing: EASE_OUT })));
    copyY.set(withDelay(280, withTiming(0, { duration: 670, easing: EASE_OUT })));
    loadingOpacity.set(withDelay(600, withTiming(1, { duration: 280, easing: EASE_OUT })));
    steamT.set(
      withDelay(
        500,
        withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }), -1, false),
      ),
    );
    spinT.set(
      withDelay(600, withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false)),
    );
  });

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.get(),
    transform: [{ translateY: markY.get() }, { scale: markScale.get() }],
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: copyOpacity.get(),
    transform: [{ translateY: copyY.get() }],
  }));

  const steamStyle = useAnimatedStyle(() => {
    const t = steamT.get();
    return {
      opacity: interpolate(t, [0, 0.45, 1], [0, 0.9, 0]),
      transform: [{ translateY: interpolate(t, [0, 1], [6, -10]) }],
    };
  });

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinT.get() * 360}deg` }],
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.get(),
  }));

  return { markStyle, copyStyle, steamStyle, spinStyle, loadingStyle };
}
