import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIconName, MiseColors, MiseFonts } from '@/constants/theme';
import { usePressFeedback } from '@/hooks/usePressFeedback';
import { useReducedMotionFlag } from '@/lib/motion';

const BACK_BUTTON_SIZE = 38;

type BackHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  testID?: string;
};

// The dark, rounded-bottom header band used on the tab screens (PageHeader in
// scroll-header.tsx), adapted for screens reached by pushing a route rather
// than by tab — a back button takes the place of the tab bar for returning.
// Back button and title share one row (rather than the button sitting on its
// own row above) to keep the band as short as a nav bar, not a second hero.
export function BackHeader({ title, subtitle, onBack, action, testID }: BackHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        <BackButton testID={testID} onPress={onBack ?? (() => router.back())} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {action}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// Bare on rest — just the arrow on the dark band — with a rounded tint that
// fades in on press only, so the tap has a visible surface to react against
// without the button looking like a filled pill the rest of the time.
function BackButton({ onPress, testID }: { onPress: () => void; testID?: string }) {
  const reduced = useReducedMotionFlag();
  const { isPressed, onPressIn, onPressOut, style: scaleStyle } = usePressFeedback();

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isPressed.value ? 'rgba(255,249,243,0.14)' : 'rgba(255,249,243,0)', {
      duration: reduced ? 0 : 150,
    }),
  }));

  return (
    <Pressable testID={testID} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} hitSlop={8}>
      <Animated.View style={[styles.backButton, backgroundStyle, scaleStyle]}>
        <Ionicons name={BackIconName} size={18} color="#FFF9F3" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: MiseColors.near,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backButton: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: BACK_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, color: '#FFF9F3', fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 21, lineHeight: 25 },
  subtitle: { color: '#D7B49D', fontFamily: MiseFonts.bodyMedium, fontSize: 12.5, marginTop: 6, marginLeft: 52 },
});
