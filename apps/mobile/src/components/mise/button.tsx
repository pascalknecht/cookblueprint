import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';

import { usePressFeedback } from '@/hooks/usePressFeedback';

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
  testID?: string;
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
  testID,
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
  const { onPressIn, onPressOut, style: pressStyle } = usePressFeedback();

  if (variant === 'gradient') {
    return (
      <Pressable
        accessibilityLabel={testID}
        testID={testID}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        style={[{ opacity: disabled ? 0.5 : 1 }, style]}>
        {/* Android composites this whole subtree as one semi-transparent
            layer once the Pressable above is faded for disabled — the
            elevation shadow gets composited (and thus visible) right along
            with it, showing through as a pale smudge on the gradient. Only
            cast it while enabled, when it's actually meant to be seen. */}
        <Animated.View style={[styles.scaleWrap, !disabled && styles.gradientShadow, pressStyle]}>
          <LinearGradient
            colors={[MiseColors.brandLight, MiseColors.brand]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={[shape, styles.center, styles.scaleInner]}>
            {content}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityLabel={testID}
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      style={[
        shape,
        styles.center,
        variant === 'secondary' ? styles.secondary : styles.primary,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}>
      <Animated.View style={[styles.scaleWrap, pressStyle]}>
        <View style={[shape, styles.center, styles.scaleInner]}>{content}</View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  scaleWrap: { borderRadius: MiseRadius.lg, overflow: 'hidden' },
  scaleInner: { borderRadius: MiseRadius.lg },
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
