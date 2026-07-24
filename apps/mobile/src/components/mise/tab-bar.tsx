import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseColors, MiseFonts } from '@/constants/theme';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  recipes: { active: 'restaurant', inactive: 'restaurant-outline' },
  plan: { active: 'calendar', inactive: 'calendar-outline' },
  list: { active: 'cart', inactive: 'cart-outline' },
  team: { active: 'people', inactive: 'people-outline' },
};

export function MiseTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === 'ios';

  const Container = isIOS ? BlurView : View;
  const containerProps = isIOS ? { intensity: 60, tint: 'light' as const } : {};

  return (
    <Container
      {...containerProps}
      style={[
        styles.bar,
        isIOS ? styles.barIOS : styles.barAndroid,
        { paddingBottom: insets.bottom, height: 58 + insets.bottom },
      ]}>
      {isIOS ? <View style={[StyleSheet.absoluteFill, styles.iosTint]} /> : null}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const icons = TAB_ICONS[route.name] ?? TAB_ICONS.recipes;
        const color = focused ? MiseColors.brand : '#A79C90';
        const label =
          typeof options.title === 'string' ? options.title : route.name.charAt(0).toUpperCase() + route.name.slice(1);

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <View
              style={[
                styles.iconWrap,
                { width: isIOS ? 34 : 56, height: isIOS ? 26 : 32 },
                !isIOS && focused ? styles.iconWrapActiveAndroid : null,
              ]}>
              <Ionicons name={focused ? icons.active : icons.inactive} size={18} color={color} />
            </View>
            <Text style={[styles.label, { color, fontFamily: focused ? MiseFonts.bodyBold : MiseFonts.bodySemiBold }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </Container>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 14,
  },
  barIOS: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  iosTint: {
    backgroundColor: 'rgba(251,246,239,0.72)',
  },
  barAndroid: {
    backgroundColor: MiseColors.card,
    borderTopWidth: 1,
    borderTopColor: MiseColors.borderFaint,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: { alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  iconWrapActiveAndroid: { backgroundColor: MiseColors.tintStrong },
  label: { fontSize: 10.5 },
});
