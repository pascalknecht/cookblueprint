import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotionFlag } from '@/lib/motion';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

// Path data vendored from lucide (https://lucide.dev, ISC) via the web app's
// motion/react icon components — translated to react-native-svg because
// font-based icon components (Ionicons/@expo/vector-icons) hide their native
// ref behind a class component, so Reanimated can't mutate their color
// directly on the UI thread; react-native-svg's Path/Circle/Rect are real
// host components, so stroke/fill/opacity/matrix CAN be animated directly.
export type TabIconName = 'restaurant' | 'calendar' | 'cart' | 'people';

// Accepts SharedValue<number> or DerivedValue<number> — only `.value` is
// ever read (inside worklets), so a structural read-only shape avoids the
// contravariance mismatch between the two reanimated types' `set` methods.
type Progress = { readonly value: number };

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedG = Animated.createAnimatedComponent(G);

type TabIconProps = {
  name: TabIconName;
  size: number;
  progress: Progress;
  focused: boolean;
  inactiveColor: string;
  activeColor: string;
};

export function TabIcon(props: TabIconProps) {
  if (props.name === 'restaurant') return <PotIcon {...props} />;
  if (props.name === 'calendar') return <CalendarIcon {...props} />;
  if (props.name === 'cart') return <CartIcon {...props} />;
  return <PeopleIcon {...props} />;
}

// Ported from a web CookingPotIcon (motion/react): lid rotates through a
// wobble keyframe sequence, pot body scales up and back, both eased over
// ~0.9s. There it replayed on hover/imperative trigger; here it's a pure
// reanimated worklet reaction to `focused` flipping false -> true, i.e. the
// exact moment this tab is *activated* by a tap — never on mount, and never
// when losing focus. Keeping the trigger in useAnimatedReaction (rather than
// a JS-side useEffect) means the whole thing runs on the UI thread.
const LID_STEP_MS = 900 / 7;
const POT_STEP_MS = 950 / 2;
const WIGGLE_EASING = Easing.inOut(Easing.ease);

function PotIcon({ size, progress, focused, inactiveColor, activeColor }: TabIconProps) {
  const potScale = useSharedValue(1);
  const lidRotation = useSharedValue(0);
  const reduced = useReducedMotionFlag();

  useAnimatedReaction(
    () => focused,
    (current, previous) => {
      if (!current || previous !== false) return;
      if (reduced) {
        potScale.value = 1;
        lidRotation.value = 0;
        return;
      }
      potScale.value = withSequence(
        withTiming(1.08, { duration: POT_STEP_MS, easing: WIGGLE_EASING }),
        withTiming(1, { duration: POT_STEP_MS, easing: WIGGLE_EASING }),
      );
      lidRotation.value = withSequence(
        withTiming(-14, { duration: LID_STEP_MS, easing: WIGGLE_EASING }),
        withTiming(14, { duration: LID_STEP_MS, easing: WIGGLE_EASING }),
        withTiming(-10, { duration: LID_STEP_MS, easing: WIGGLE_EASING }),
        withTiming(10, { duration: LID_STEP_MS, easing: WIGGLE_EASING }),
        withTiming(-6, { duration: LID_STEP_MS, easing: WIGGLE_EASING }),
        withTiming(6, { duration: LID_STEP_MS, easing: WIGGLE_EASING }),
        withTiming(0, { duration: LID_STEP_MS, easing: WIGGLE_EASING }),
      );
    },
  );

  const strokeProps = useAnimatedProps(() => ({
    stroke: interpolateColor(progress.value, [0, 1], [inactiveColor, activeColor]),
  }));
  // G's `matrix` prop — not `transform` (Reanimated 4 special-cases that
  // name and runs it through its own RN-style CSS transform parser, which
  // crashes on raw SVG transform-list syntax), and not the deprecated
  // `scale`/`rotation`/`origin` convenience props either: those only get
  // resolved into an actual native matrix by react-native-svg's own JS-side
  // render/extract step, which Reanimated's animatedProps bypasses entirely
  // — so they silently write bare numbers the native renderer doesn't act
  // on. `matrix` is the one prop applied natively as-is, so the pivot-scale
  // and pivot-rotate math is done by hand here (equivalent to
  // translate(origin) * transform * translate(-origin), column-major
  // [a, b, c, d, tx, ty]). react-native-svg's GProps type doesn't declare
  // `matrix` (only its imperative setNativeProps does), hence the `as never`
  // casts below on otherwise-correct runtime props.
  const potGroupProps = useAnimatedProps(() => {
    const s = potScale.value;
    // pivot (12, 16)
    return { matrix: [s, 0, 0, s, 12 * (1 - s), 16 * (1 - s)] };
  });
  const lidGroupProps = useAnimatedProps(() => {
    const rad = (lidRotation.value * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // pivot (18, 6)
    return {
      matrix: [cos, sin, -sin, cos, 18 - 18 * cos + 6 * sin, 6 - 18 * sin - 6 * cos],
    };
  });

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <AnimatedG animatedProps={potGroupProps as never}>
        <AnimatedPath
          d="M2 12h20"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={strokeProps}
        />
        <AnimatedPath
          d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={strokeProps}
        />
      </AnimatedG>
      <AnimatedG animatedProps={lidGroupProps as never}>
        <AnimatedPath
          d="m4 8 16-4"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={strokeProps}
        />
        <AnimatedPath
          d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={strokeProps}
        />
      </AnimatedG>
    </Svg>
  );
}

// Ported from a web CalendarDaysIcon (motion/react): the 6 date dots flicker
// down to 0.3 opacity and back, staggered 100ms apart left-to-right/top-to-
// bottom, over ~0.4s each (~0.9s total including stagger) — same
// activation-edge trigger as PotIcon. Six explicit shared values/sequences
// rather than a loop or `.map()` over them: a `.map()` callback invoked
// *inside* a worklet doesn't reliably get workletized by Reanimated's Babel
// plugin (confirmed earlier — it compiles but throws "Tried to
// synchronously call a Remote Function" at runtime), so this file avoids
// that pattern entirely inside any useAnimatedReaction/useAnimatedProps body.
const DOT_STAGGER_MS = 100;
const DOT_STEP_MS = 200;
const DOT_EASING = Easing.inOut(Easing.ease);

function CalendarIcon({ size, progress, focused, inactiveColor, activeColor }: TabIconProps) {
  const reduced = useReducedMotionFlag();
  const dot0 = useSharedValue(1);
  const dot1 = useSharedValue(1);
  const dot2 = useSharedValue(1);
  const dot3 = useSharedValue(1);
  const dot4 = useSharedValue(1);
  const dot5 = useSharedValue(1);

  useAnimatedReaction(
    () => focused,
    (current, previous) => {
      if (!current || previous !== false) return;
      if (reduced) {
        for (const d of [dot0, dot1, dot2, dot3, dot4, dot5]) d.value = 1;
        return;
      }
      dot0.value = withDelay(
        0 * DOT_STAGGER_MS,
        withSequence(
          withTiming(0.3, { duration: DOT_STEP_MS, easing: DOT_EASING }),
          withTiming(1, { duration: DOT_STEP_MS, easing: DOT_EASING }),
        ),
      );
      dot1.value = withDelay(
        1 * DOT_STAGGER_MS,
        withSequence(
          withTiming(0.3, { duration: DOT_STEP_MS, easing: DOT_EASING }),
          withTiming(1, { duration: DOT_STEP_MS, easing: DOT_EASING }),
        ),
      );
      dot2.value = withDelay(
        2 * DOT_STAGGER_MS,
        withSequence(
          withTiming(0.3, { duration: DOT_STEP_MS, easing: DOT_EASING }),
          withTiming(1, { duration: DOT_STEP_MS, easing: DOT_EASING }),
        ),
      );
      dot3.value = withDelay(
        3 * DOT_STAGGER_MS,
        withSequence(
          withTiming(0.3, { duration: DOT_STEP_MS, easing: DOT_EASING }),
          withTiming(1, { duration: DOT_STEP_MS, easing: DOT_EASING }),
        ),
      );
      dot4.value = withDelay(
        4 * DOT_STAGGER_MS,
        withSequence(
          withTiming(0.3, { duration: DOT_STEP_MS, easing: DOT_EASING }),
          withTiming(1, { duration: DOT_STEP_MS, easing: DOT_EASING }),
        ),
      );
      dot5.value = withDelay(
        5 * DOT_STAGGER_MS,
        withSequence(
          withTiming(0.3, { duration: DOT_STEP_MS, easing: DOT_EASING }),
          withTiming(1, { duration: DOT_STEP_MS, easing: DOT_EASING }),
        ),
      );
    },
  );

  const strokeProps = useAnimatedProps(() => ({
    stroke: interpolateColor(progress.value, [0, 1], [inactiveColor, activeColor]),
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <AnimatedRect
        x={3}
        y={4}
        width={18}
        height={18}
        rx={2}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={strokeProps}
      />
      <AnimatedPath
        d="M8 2v4"
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={strokeProps}
      />
      <AnimatedPath
        d="M16 2v4"
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={strokeProps}
      />
      <AnimatedPath
        d="M3 10h18"
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={strokeProps}
      />
      <CalendarDot cx={8} cy={14} progress={progress} opacity={dot0} inactiveColor={inactiveColor} activeColor={activeColor} />
      <CalendarDot cx={12} cy={14} progress={progress} opacity={dot1} inactiveColor={inactiveColor} activeColor={activeColor} />
      <CalendarDot cx={16} cy={14} progress={progress} opacity={dot2} inactiveColor={inactiveColor} activeColor={activeColor} />
      <CalendarDot cx={8} cy={18} progress={progress} opacity={dot3} inactiveColor={inactiveColor} activeColor={activeColor} />
      <CalendarDot cx={12} cy={18} progress={progress} opacity={dot4} inactiveColor={inactiveColor} activeColor={activeColor} />
      <CalendarDot cx={16} cy={18} progress={progress} opacity={dot5} inactiveColor={inactiveColor} activeColor={activeColor} />
    </Svg>
  );
}

function CalendarDot({
  cx,
  cy,
  progress,
  opacity,
  inactiveColor,
  activeColor,
}: {
  cx: number;
  cy: number;
  progress: Progress;
  opacity: Progress;
  inactiveColor: string;
  activeColor: string;
}) {
  const dotProps = useAnimatedProps(() => ({
    fill: interpolateColor(progress.value, [0, 1], [inactiveColor, activeColor]),
    opacity: opacity.value,
  }));
  return <AnimatedCircle cx={cx} cy={cy} r={1} animatedProps={dotProps} />;
}

// Ported from a web CartIcon (motion/react): scales up to 1.1 while
// hopping up and back down twice (y: [0,-5,0] repeated once, 100ms delay).
// The source relies on hover-leave to reset scale back to 1; there's no
// equivalent "deactivate" moment here, so — same call as PotIcon's own
// [1, 1.08, 1] adaptation — the scale leg is mirrored into a full 1 -> 1.1
// -> 1 round trip rather than left sitting at 1.1 forever. Both scale and
// the y-hop apply to the same single path, so they're combined into one
// pivot-scale-plus-offset matrix (pivot = viewBox center (12, 12), matching
// the CSS default transform-origin the web version relied on implicitly).
const CART_SCALE_STEP_MS = 300;
const CART_Y_STEP_MS = 200;
const CART_Y_DELAY_MS = 100;

// react-native-svg clips to the viewBox like a real SVG viewport, and unlike
// web SVG it does not honor `overflow: visible` to opt out (confirmed
// against https://github.com/software-mansion/react-native-svg/issues/1082)
// — the peak of the scale+hop pushes the cart's top edge past y=0, which was
// getting cropped. The accepted workaround: pad the viewBox itself, then
// grow the rendered Svg by the same proportion and center it via a negative
// offset, so the icon at rest still looks identical to the other tabs' fixed
// `size`x`size` icons — only the (normally invisible) margin changes.
const CART_VIEWBOX_PAD = 6;
const CART_VIEWBOX_BASE = 24;
const CART_VIEWBOX_PADDED = CART_VIEWBOX_BASE + CART_VIEWBOX_PAD * 2;

function CartIcon({ size, progress, focused, inactiveColor, activeColor }: TabIconProps) {
  const reduced = useReducedMotionFlag();
  const cartScale = useSharedValue(1);
  const cartY = useSharedValue(0);
  const renderedSize = (size * CART_VIEWBOX_PADDED) / CART_VIEWBOX_BASE;
  const offset = -(renderedSize - size) / 2;

  useAnimatedReaction(
    () => focused,
    (current, previous) => {
      if (!current || previous !== false) return;
      if (reduced) {
        cartScale.value = 1;
        cartY.value = 0;
        return;
      }
      cartScale.value = withSequence(
        withTiming(1.1, { duration: CART_SCALE_STEP_MS, easing: WIGGLE_EASING }),
        withTiming(1, { duration: CART_SCALE_STEP_MS, easing: WIGGLE_EASING }),
      );
      cartY.value = withDelay(
        CART_Y_DELAY_MS,
        withSequence(
          withTiming(-5, { duration: CART_Y_STEP_MS, easing: WIGGLE_EASING }),
          withTiming(0, { duration: CART_Y_STEP_MS, easing: WIGGLE_EASING }),
          withTiming(-5, { duration: CART_Y_STEP_MS, easing: WIGGLE_EASING }),
          withTiming(0, { duration: CART_Y_STEP_MS, easing: WIGGLE_EASING }),
        ),
      );
    },
  );

  const strokeProps = useAnimatedProps(() => ({
    stroke: interpolateColor(progress.value, [0, 1], [inactiveColor, activeColor]),
  }));
  const cartGroupProps = useAnimatedProps(() => {
    const s = cartScale.value;
    // pivot (12, 12); y-hop folded into the translate term alongside the pivot offset
    return { matrix: [s, 0, 0, s, 12 * (1 - s), 12 * (1 - s) + cartY.value] };
  });

  return (
    <Svg
      width={renderedSize}
      height={renderedSize}
      viewBox={`${-CART_VIEWBOX_PAD} ${-CART_VIEWBOX_PAD} ${CART_VIEWBOX_PADDED} ${CART_VIEWBOX_PADDED}`}
      style={{ position: 'absolute', top: offset, left: offset }}>
      <AnimatedG animatedProps={cartGroupProps as never}>
        <AnimatedPath
          d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={strokeProps}
        />
      </AnimatedG>
    </Svg>
  );
}

// Originally ported the web UsersRoundIcon's snap-to-invisible-then-spring
// reveal, but the instant opacity/position jump before the spring caught
// read as a glitch rather than a flourish. Replaced with the same
// pivot-scale "pop" already proven on PotIcon/CartIcon: front person (arc +
// head) bounces first, back person's path bounces a beat later — a little
// two-person greeting, with no discontinuous jump anywhere in the sequence.
const PERSON_STEP_MS = 220;
const PERSON_STAGGER_MS = 120;

function PeopleIcon({ size, progress, focused, inactiveColor, activeColor }: TabIconProps) {
  const frontScale = useSharedValue(1);
  const backScale = useSharedValue(1);
  const reduced = useReducedMotionFlag();

  useAnimatedReaction(
    () => focused,
    (current, previous) => {
      if (!current || previous !== false) return;
      if (reduced) {
        frontScale.value = 1;
        backScale.value = 1;
        return;
      }
      frontScale.value = withSequence(
        withTiming(1.15, { duration: PERSON_STEP_MS, easing: WIGGLE_EASING }),
        withTiming(1, { duration: PERSON_STEP_MS, easing: WIGGLE_EASING }),
      );
      backScale.value = withDelay(
        PERSON_STAGGER_MS,
        withSequence(
          withTiming(1.15, { duration: PERSON_STEP_MS, easing: WIGGLE_EASING }),
          withTiming(1, { duration: PERSON_STEP_MS, easing: WIGGLE_EASING }),
        ),
      );
    },
  );

  const strokeProps = useAnimatedProps(() => ({
    stroke: interpolateColor(progress.value, [0, 1], [inactiveColor, activeColor]),
  }));
  const frontGroupProps = useAnimatedProps(() => {
    const s = frontScale.value;
    // pivot (10, 12) — center of the front figure's arc + head bounding box
    return { matrix: [s, 0, 0, s, 10 * (1 - s), 12 * (1 - s)] };
  });
  const backGroupProps = useAnimatedProps(() => {
    const s = backScale.value;
    // pivot (19, 12) — center of the back person's own path
    return { matrix: [s, 0, 0, s, 19 * (1 - s), 12 * (1 - s)] };
  });

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <AnimatedG animatedProps={frontGroupProps as never}>
        <AnimatedPath
          d="M18 21a8 8 0 0 0-16 0"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={strokeProps}
        />
        <AnimatedCircle
          cx={10}
          cy={8}
          r={5}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={strokeProps}
        />
      </AnimatedG>
      <AnimatedG animatedProps={backGroupProps as never}>
        <AnimatedPath
          d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={strokeProps}
        />
      </AnimatedG>
    </Svg>
  );
}
