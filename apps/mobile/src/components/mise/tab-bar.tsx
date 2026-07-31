import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseColors } from '@/constants/theme';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  recipes: { active: 'restaurant', inactive: 'restaurant-outline' },
  plan: { active: 'calendar', inactive: 'calendar-outline' },
  list: { active: 'cart', inactive: 'cart-outline' },
  household: { active: 'people', inactive: 'people-outline' },
};

const BUTTON_SIZE = 60;
export const TAB_BAR_HEIGHT = 64;

export function MiseTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomGap = Math.max(insets.bottom, 16);
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2, 4);

  function renderTab(route: (typeof state.routes)[number]) {
    const index = state.routes.indexOf(route);
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const icons = TAB_ICONS[route.name] ?? TAB_ICONS.recipes;
    const label =
      typeof options.title === 'string' ? options.title : route.name.charAt(0).toUpperCase() + route.name.slice(1);

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <TabButton
        key={route.key}
        focused={focused}
        icon={focused ? icons.active : icons.inactive}
        label={label}
        onPress={onPress}
      />
    );
  }

  return (
    <View style={[styles.host, { bottom: bottomGap }]}>
      <View style={styles.barRow}>
        <View style={styles.pill}>{leftRoutes.map(renderTab)}</View>
        <View style={styles.notch} />
        <View style={styles.pill}>{rightRoutes.map(renderTab)}</View>
      </View>
      <Pressable style={styles.centerButton} onPress={() => router.push('/quick-add-sheet')}>
        <LinearGradient
          colors={[MiseColors.brandLight, MiseColors.brand]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.centerButtonInner}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function TabButton({
  focused,
  icon,
  label,
  onPress,
}: {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: withSpring(focused ? 1 : 0, { damping: 14, stiffness: 260, mass: 0.6 }),
    transform: [{ scale: withSpring(focused ? 1 : 0.5, { damping: 10, stiffness: 220, mass: 0.6 }) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={styles.tab}>
      <Animated.View style={[styles.tabActive, backgroundStyle]} />
      <Ionicons name={icon} size={20} color={focused ? MiseColors.brandLight : '#9A8F82'} />
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
    height: TAB_BAR_HEIGHT,
    width: '100%',
    backgroundColor: MiseColors.near,
    borderRadius: 999,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  pill: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18 },
  notch: { width: BUTTON_SIZE + 12 },
  tab: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  tabActive: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  centerButton: {
    position: 'absolute',
    top: -(BUTTON_SIZE / 2 - TAB_BAR_HEIGHT / 2),
    alignSelf: 'center',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
  },
  centerButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MiseColors.brandDark,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
