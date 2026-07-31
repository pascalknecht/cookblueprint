import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { MiseColors, MiseFonts } from '@/constants/theme';

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ icon, title, subtitle, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.host, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={MiseColors.brand} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    marginHorizontal: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: MiseColors.border,
    borderRadius: 24,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: MiseColors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: MiseFonts.display,
    fontSize: 21,
    color: MiseColors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: MiseFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: MiseColors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  action: { marginTop: 20, alignSelf: 'stretch' },
});
