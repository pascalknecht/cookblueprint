import { useReducedMotion, ReduceMotion, withSpring, withTiming, type WithTimingConfig } from 'react-native-reanimated';

// Central home for reduced-motion handling. Every spring/timing in the app goes
// through these wrappers so a user who asked the OS to minimize motion gets
// fewer, gentler animations (opacity + color state indication survive;
// translation, scale, wiggle and parallax drop) instead of the motion being
// stripped by a follow-up. See the animate-expo skill's reduced-motion rule.

/** True when the OS has requested minimized motion. */
export function useReducedMotionFlag(): boolean {
  return useReducedMotion();
}

/** withSpring that honours the system reduce-motion setting. */
export function reducedSpring<T extends number>(
  toValue: T,
  config?: { reduceMotion?: ReduceMotion } & Omit<Parameters<typeof withSpring>[1], 'reduceMotion'>,
) {
  return withSpring(toValue, { reduceMotion: ReduceMotion.System, ...config });
}

/** withTiming that honours the system reduce-motion setting. */
export function reducedTiming(
  toValue: number,
  config?: WithTimingConfig & { reduceMotion?: ReduceMotion },
) {
  return withTiming(toValue, { reduceMotion: ReduceMotion.System, ...config });
}

/**
 * CSS-transition style for a selection chip/pill's backgroundColor and
 * borderColor — so choosing a filter, tag, or option crossfades instead of
 * snapping. Spread onto an Animated.View (or an Animated.createAnimatedComponent
 * wrapped Pressable); the color change itself still comes from the normal
 * conditional style, this just tells Reanimated to animate the transition.
 */
export function colorTransition(reduced: boolean) {
  return {
    transitionProperty: ['backgroundColor', 'borderColor'] as const,
    transitionDuration: reduced ? 0 : 150,
    transitionTimingFunction: 'ease-out' as const,
  };
}
