import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useDerivedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { MiseColors } from '@/constants/theme';
import { useReducedMotionFlag } from '@/lib/motion';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const PULSE_MS = 700;

export function MiseTile({ pulsing }: { pulsing?: boolean }) {
  const reduced = useReducedMotionFlag();

  // A genuine breathing loop while work is in flight, not just a static
  // shadow bump, so the "importing" step reads as ongoing rather than stuck.
  // Reduced motion drops the scale/loop and keeps only the static shadow lift.
  const progress = useDerivedValue(() =>
    pulsing && !reduced
      ? withRepeat(withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.sin) }), -1, true)
      : withTiming(0, { duration: 150 }),
  );

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.06 }],
    shadowOpacity: 0.35 + progress.value * 0.25,
    shadowRadius: 8 + progress.value * 10,
  }));

  return (
    <AnimatedImage
      source={require('@/assets/images/icon.png')}
      style={[styles.tile, pulsing && reduced && styles.tilePulsingReduced, pulseStyle]}
    />
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 58,
    height: 58,
    borderRadius: 17,
    shadowColor: MiseColors.brandDark,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tilePulsingReduced: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
});
