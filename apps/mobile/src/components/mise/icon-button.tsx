import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { MiseColors } from '@/constants/theme';

import { usePressFeedback } from '@/hooks/usePressFeedback';

type IconButtonVariant = 'surface' | 'translucent' | 'gradient' | 'tint';

type IconButtonProps = {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: number;
  iconSize?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

export function IconButton({
  name,
  onPress,
  variant = 'surface',
  size = 44,
  iconSize,
  color,
  style,
  testID,
  accessibilityLabel,
}: IconButtonProps) {
  const radius = size * 0.32;
  const resolvedIconSize = iconSize ?? size * 0.42;
  const { onPressIn, onPressOut, style: pressStyle } = usePressFeedback();

  if (variant === 'gradient') {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel ?? testID}
        testID={testID}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={style}>
        <Animated.View style={[styles.scaleWrap, { borderRadius: radius }, pressStyle]}>
          <LinearGradient
            colors={[MiseColors.brandLight, MiseColors.brand]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={[styles.center, styles.shadow, { width: size, height: size, borderRadius: radius }]}>
            <Ionicons name={name} size={resolvedIconSize} color={color ?? '#fff'} />
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  const variantStyle: ViewStyle =
    variant === 'translucent'
      ? { backgroundColor: 'rgba(255,255,255,0.92)' }
      : variant === 'tint'
        ? { backgroundColor: MiseColors.tint, borderWidth: 1.5, borderColor: MiseColors.borderTint }
        : { backgroundColor: MiseColors.card, borderWidth: 1, borderColor: MiseColors.border };

  const defaultColor = variant === 'tint' ? MiseColors.brand : MiseColors.ink;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? testID}
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.center,
        { width: size, height: size, borderRadius: variant === 'translucent' ? size / 2 : radius },
        variantStyle,
        variant === 'translucent' && styles.translucentShadow,
        style,
      ]}>
      <Animated.View
        style={[
          styles.scaleWrap,
          { borderRadius: variant === 'translucent' ? size / 2 : radius },
          pressStyle,
        ]}>
        <Ionicons name={name} size={resolvedIconSize} color={color ?? defaultColor} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  scaleWrap: { overflow: 'hidden' },
  shadow: {
    shadowColor: MiseColors.brandDark,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  translucentShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});
