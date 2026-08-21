import { type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseColors, MiseFonts } from '@/constants/theme';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <StatusBar style="light" />
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
      {children ? <View style={styles.controls}>{children}</View> : null}
    </View>
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
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  titleBlock: { flex: 1, minWidth: 0 },
  title: { color: '#FFF9F3', fontFamily: MiseFonts.display, fontSize: 34, lineHeight: 38 },
  subtitle: { color: '#D7B49D', fontFamily: MiseFonts.bodyMedium, fontSize: 12.5, marginTop: 2 },
  controls: { marginTop: 16 },
});
