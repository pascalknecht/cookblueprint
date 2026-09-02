import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useMountEffect } from '@/hooks/use-mount-effect';

// Paths from /animated-splash/layers. Mark is 146pt; spinner is 24pt.

export const SPLASH_GROUND = '#241C16';
export const SPLASH_RUST = '#C4562F';
export const SPLASH_CREAM = '#F6EFE8';
export const SPLASH_TRACK = '#3E332C';
export const SPLASH_MUTED = '#C4A78C';

export const MARK_PT = 146;
export const SPINNER_PT = 24;
const CHECK_LEN = 10.4;

const AnimatedPath = Animated.createAnimatedComponent(Path);

type ReducedProps = { reduced: boolean };

export function SplashMark({ reduced }: ReducedProps) {
  return (
    <Svg width={MARK_PT} height={MARK_PT} viewBox="-1 -1 50 50" accessible={false}>
      <Rect x={20.5} y={5.4} width={7} height={3.6} rx={1.8} fill={SPLASH_RUST} />
      <Rect x={23} y={8.4} width={2} height={2.6} fill={SPLASH_RUST} />
      <Path d="M11 19c0-5.2 5.8-8.7 13-8.7S37 13.8 37 19z" fill={SPLASH_RUST} />
      <Rect x={9} y={19} width={30} height={3.6} rx={1.8} fill={SPLASH_CREAM} />
      <Rect x={3.5} y={24} width={7.5} height={3.6} rx={1.8} fill={SPLASH_RUST} />
      <Rect x={37} y={24} width={7.5} height={3.6} rx={1.8} fill={SPLASH_RUST} />
      <Path d="M11 22.6h26V36a6.5 6.5 0 0 1-6.5 6.5h-13A6.5 6.5 0 0 1 11 36z" fill={SPLASH_CREAM} />
      <Rect x={28.5} y={28.6} width={18} height={18.9} rx={4.4} fill={SPLASH_GROUND} />
      <Rect x={33.5} y={29.9} width={2.4} height={4.6} rx={1.2} fill={SPLASH_RUST} />
      <Rect x={39.1} y={29.9} width={2.4} height={4.6} rx={1.2} fill={SPLASH_RUST} />
      <Rect x={30} y={32.5} width={15} height={13.5} rx={3.4} fill={SPLASH_RUST} />
      <Rect x={31.7} y={34.2} width={11.6} height={10.1} rx={2.4} fill={SPLASH_CREAM} />
      <CheckStroke reduced={reduced} />
    </Svg>
  );
}

function CheckStroke({ reduced }: ReducedProps) {
  const offset = useSharedValue(reduced ? 0 : CHECK_LEN);

  useMountEffect(() => {
    if (reduced) return;
    offset.set(
      withDelay(620, withTiming(0, { duration: 260, easing: Easing.bezier(0.23, 1, 0.32, 1) })),
    );
  });

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.get(),
  }));

  return (
    <AnimatedPath
      d="m34.4 39.4 2.2 2.2 4.3-4.9"
      fill="none"
      stroke={SPLASH_RUST}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={CHECK_LEN}
      animatedProps={animatedProps}
    />
  );
}

export function SplashSteam() {
  return (
    <Svg width={39} height={51} viewBox="0 0 26 34" accessible={false}>
      <Path
        d="M6 30c0-6 4-7 4-13M13 26c0-6 4-7 4-13M20 30c0-6 4-7 4-13"
        fill="none"
        stroke={SPLASH_RUST}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SplashSpinnerTrack() {
  return (
    <Svg width={SPINNER_PT} height={SPINNER_PT} viewBox="0 0 24 24" accessible={false}>
      <Circle cx={12} cy={12} r={9} fill="none" stroke={SPLASH_TRACK} strokeWidth={3} />
    </Svg>
  );
}

export function SplashSpinnerArc() {
  return (
    <Svg width={SPINNER_PT} height={SPINNER_PT} viewBox="0 0 24 24" accessible={false}>
      <Path
        d="M12 3a9 9 0 0 1 9 9"
        fill="none"
        stroke={SPLASH_RUST}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}
