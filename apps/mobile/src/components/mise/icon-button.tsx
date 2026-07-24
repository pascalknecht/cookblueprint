import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { MiseColors } from '@/constants/theme';

type IconButtonVariant = 'surface' | 'translucent' | 'gradient' | 'tint';

type IconButtonProps = {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: number;
  iconSize?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  name,
  onPress,
  variant = 'surface',
  size = 44,
  iconSize,
  color,
  style,
}: IconButtonProps) {
  const radius = size * 0.32;
  const resolvedIconSize = iconSize ?? size * 0.42;

  if (variant === 'gradient') {
    return (
      <Pressable onPress={onPress} style={style}>
        <LinearGradient
          colors={[MiseColors.brandLight, MiseColors.brand]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[styles.center, styles.shadow, { width: size, height: size, borderRadius: radius }]}>
          <Ionicons name={name} size={resolvedIconSize} color={color ?? '#fff'} />
        </LinearGradient>
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
      onPress={onPress}
      style={[
        styles.center,
        { width: size, height: size, borderRadius: variant === 'translucent' ? size / 2 : radius },
        variantStyle,
        style,
      ]}>
      <Ionicons name={name} size={resolvedIconSize} color={color ?? defaultColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  shadow: {
    shadowColor: MiseColors.brandDark,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
