import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'gradient';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
  disabled,
  loading,
  compact,
}: ButtonProps) {
  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? MiseColors.ink : '#fff'} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              variant === 'secondary' ? styles.labelSecondary : styles.labelSolid,
            ]}>
            {label}
          </Text>
        </>
      )}
    </View>
  );

  const shape: ViewStyle = {
    height: compact ? 48 : 56,
    borderRadius: MiseRadius.lg,
    paddingHorizontal: compact ? 18 : 0,
  };

  if (variant === 'gradient') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={[{ opacity: disabled ? 0.5 : 1 }, style]}>
        <LinearGradient
          colors={[MiseColors.brandLight, MiseColors.brand]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[shape, styles.gradientShadow, styles.center]}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        shape,
        styles.center,
        variant === 'secondary' ? styles.secondary : styles.primary,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primary: { backgroundColor: MiseColors.near },
  secondary: {
    backgroundColor: MiseColors.card,
    borderWidth: 1.5,
    borderColor: MiseColors.border,
  },
  gradientShadow: {
    shadowColor: MiseColors.brandDark,
    shadowOpacity: 0.32,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  label: { fontFamily: MiseFonts.bodyBold, fontSize: 16 },
  labelSolid: { color: '#fff' },
  labelSecondary: { color: MiseColors.ink },
});
