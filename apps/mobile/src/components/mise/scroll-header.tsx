import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseColors, MiseFonts } from '@/constants/theme';

const COMPACT_HEADER_HEIGHT = 56;
// How much scroll distance the compact header takes to crossfade in/out.
const FADE_DISTANCE = 40;

// A page header that scrolls away with the rest of the page (it's just the
// first item in the scroll content), paired with a pinned compact bar that
// crossfades in once the big header is gone — the same way an iOS
// large-title nav bar collapses into a compact one, instead of the header
// staying pinned and reshaping in place.
export function useScrollHeader() {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [compactShown, setCompactShown] = useState(false);
  const scrollY = useSharedValue(0);
  const fadeInPoint = Math.max(headerHeight - FADE_DISTANCE, 0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  useAnimatedReaction(
    () => scrollY.value > fadeInPoint + FADE_DISTANCE / 2,
    (shown, previous) => {
      if (shown !== previous) runOnJS(setCompactShown)(shown);
    },
  );
  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [fadeInPoint, fadeInPoint + FADE_DISTANCE], [0, 1], 'clamp'),
  }));

  function onHeaderLayout(event: LayoutChangeEvent) {
    setHeaderHeight(event.nativeEvent.layout.height);
  }

  return { onScroll, onHeaderLayout, compactStyle, compactShown, scrollY };
}

type PageHeaderProps = {
  title: string;
  // A plain string renders as the default styled subtitle line; pass a
  // custom node (e.g. a household-picker trigger) to replace it entirely.
  subtitle?: ReactNode;
  action?: ReactNode;
  belowStyle?: ViewStyle;
  onLayout?: (event: LayoutChangeEvent) => void;
  children?: ReactNode;
};

export function PageHeader({ title, subtitle, action, belowStyle, onLayout, children }: PageHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View onLayout={onLayout} style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={[styles.topRow, !children && styles.topRowStandalone]}>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle == null ? null : typeof subtitle === 'string' ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : (
            subtitle
          )}
        </View>
        {action}
      </View>
      {children ? <View style={belowStyle}>{children}</View> : null}
    </View>
  );
}

type CompactHeaderProps = {
  title: string;
  action?: ReactNode;
  compactStyle: ReturnType<typeof useScrollHeader>['compactStyle'];
  compactShown: boolean;
  // Extra horizontal space to reserve around the title, for callers (like
  // the recipe detail page) whose corner buttons live in a separate
  // overlay on both sides rather than in `action` on just the right.
  titleInset?: number;
};

export function CompactHeader({ title, action, compactStyle, compactShown, titleInset = 0 }: CompactHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      pointerEvents={compactShown ? 'box-none' : 'none'}
      style={[styles.compactHeader, { height: insets.top + COMPACT_HEADER_HEIGHT, paddingTop: insets.top }, compactStyle]}>
      <Text style={[styles.compactTitle, { marginHorizontal: titleInset }]} numberOfLines={1}>
        {title}
      </Text>
      {action}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: MiseColors.near,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 20 },
  topRowStandalone: { paddingBottom: 0 },
  titleBlock: { flex: 1, minWidth: 0 },
  title: { color: '#FFF9F3', fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 34, lineHeight: 38 },
  subtitle: { color: '#D7B49D', fontFamily: MiseFonts.bodyMedium, fontSize: 12.5, marginTop: 2 },
  compactHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: MiseColors.near,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  compactTitle: { flex: 1, color: '#FFF9F3', fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 19 },
});
