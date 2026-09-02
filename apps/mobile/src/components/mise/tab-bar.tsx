import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseColors, MiseFonts } from '@/constants/theme';

import { TAB_BAR_HEIGHT, getTabBarBottomGap } from './tab-bar-metrics';
import { TabIcon, type TabIconName } from './tab-icon';

export { TAB_BAR_HEIGHT, getTabBarBottomGap, getTabBarScrollPadding } from './tab-bar-metrics';

const TAB_ICONS: Record<string, TabIconName> = {
  recipes: 'restaurant',
  plan: 'calendar',
  list: 'cart',
  settings: 'people',
};

// The indicator slides and resizes to match the focused tab's bounds. x and
// width used to animate as two independent springs, which drift out of sync
// on multi-tab jumps — the rect balloons wider than any single tab mid-
// transition before catching up. Driving both from one 0->1 progress value
// (interpolating start bounds -> target bounds every frame) keeps it a
// rigid body: it can only ever be exactly one tab's width, sliding.
const INDICATOR_DURATION_MS = 280;
const INDICATOR_EASING = Easing.out(Easing.cubic);
// Much snappier than the indicator's slide on purpose — the icon/label should
// react to the tap immediately, not wait on the indicator's motion.
const FOCUS_SPRING = { damping: 20, stiffness: 500, mass: 0.3 };
const ICON_INACTIVE_COLOR = '#9A8F82';

// The bar's inner edge (where the indicator sits) is inset from the outer edge by BAR_INSET
// on every side, so the indicator's corner radius must shrink by that same amount to stay
// concentric with the bar's own corners — the nested-rounded-corners rule: inner radius =
// outer radius - the padding/gap between the two shapes.
const BAR_RADIUS = 26;
const BAR_INSET = 10;
const INDICATOR_RADIUS = BAR_RADIUS - BAR_INSET;

export function MiseTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomGap = getTabBarBottomGap(insets.bottom);
  const tabLayouts = useSharedValue<Record<number, { x: number; width: number; height: number }>>({});
  const startX = useSharedValue(0);
  const startWidth = useSharedValue(0);
  const targetX = useSharedValue(0);
  const targetWidth = useSharedValue(0);
  const indicatorProgress = useSharedValue(1);
  const initialized = useSharedValue(false);

  useAnimatedReaction(
    () => tabLayouts.value[state.index],
    (layout) => {
      if (!layout) return;
      if (!initialized.value) {
        startX.value = layout.x;
        startWidth.value = layout.width;
        targetX.value = layout.x;
        targetWidth.value = layout.width;
        initialized.value = true;
        return;
      }
      // Re-triggering mid-flight (rapid taps) starts the new leg from wherever
      // the rect currently sits, rather than jump-cutting to the old target.
      startX.value = startX.value + (targetX.value - startX.value) * indicatorProgress.value;
      startWidth.value = startWidth.value + (targetWidth.value - startWidth.value) * indicatorProgress.value;
      targetX.value = layout.x;
      targetWidth.value = layout.width;
      indicatorProgress.value = 0;
      indicatorProgress.value = withTiming(1, { duration: INDICATOR_DURATION_MS, easing: INDICATOR_EASING });
    },
  );

  const indicatorStyle = useAnimatedStyle(() => {
    const p = indicatorProgress.value;
    return {
      width: startWidth.value + (targetWidth.value - startWidth.value) * p,
      transform: [{ translateX: startX.value + (targetX.value - startX.value) * p }],
    };
  });

  function renderTab(route: (typeof state.routes)[number]) {
    const index = state.routes.indexOf(route);
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const icon = TAB_ICONS[route.name] ?? TAB_ICONS.recipes;
    const label =
      typeof options.title === 'string' ? options.title : route.name.charAt(0).toUpperCase() + route.name.slice(1);

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    const onLayout = (event: LayoutChangeEvent) => {
      const { x, width, height } = event.nativeEvent.layout;
      tabLayouts.modify((value) => {
        'worklet';
        value[index] = { x, width, height };
        return value;
      });
    };

    return (
      <TabButton
        key={route.key}
        testID={`tab-${route.name}`}
        focused={focused}
        icon={icon}
        label={label}
        onPress={onPress}
        onLayout={onLayout}
      />
    );
  }

  return (
    <View style={[styles.host, { bottom: bottomGap }]}>
      <View style={styles.barRow}>
        <View style={styles.pill}>
          <Animated.View style={[styles.indicator, indicatorStyle]} pointerEvents="none" />
          {state.routes.map(renderTab)}
        </View>
      </View>
    </View>
  );
}

function TabButton({
  testID,
  focused,
  icon,
  label,
  onPress,
  onLayout,
}: {
  testID: string;
  focused: boolean;
  icon: TabIconName;
  label: string;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}) {
  const progress = useDerivedValue(() => withSpring(focused ? 1 : 0, FOCUS_SPRING));

  const colorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [ICON_INACTIVE_COLOR, MiseColors.brandLight]),
  }));

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={styles.tab}>
      <View style={styles.iconStack}>
        <TabIcon
          name={icon}
          size={20}
          progress={progress}
          focused={focused}
          inactiveColor={ICON_INACTIVE_COLOR}
          activeColor={MiseColors.brandLight}
        />
      </View>
      <Animated.Text style={[styles.tabLabel, colorStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 18,
    right: 18,
    alignItems: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TAB_BAR_HEIGHT,
    backgroundColor: MiseColors.near,
    borderRadius: BAR_RADIUS,
    paddingHorizontal: BAR_INSET,
    paddingVertical: BAR_INSET,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: INDICATOR_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: INDICATOR_RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 3,
  },
  iconStack: { width: 20, height: 20 },
  tabLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 10.5, color: ICON_INACTIVE_COLOR },
});
