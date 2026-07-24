import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseColors } from '@/constants/theme';

type SheetProps = {
  children: ReactNode;
  onDismiss: () => void;
  topInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Sheet({ children, onDismiss, topInset, contentStyle }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.host}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      <View
        style={[
          styles.card,
          { paddingBottom: insets.bottom + 20 },
          topInset ? { marginTop: topInset } : null,
          contentStyle,
        ]}>
        <View style={styles.handle} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20,12,30,0.42)',
  },
  card: {
    backgroundColor: MiseColors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  handle: {
    width: 38,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#DDD3C6',
    alignSelf: 'center',
    marginBottom: 16,
  },
});
