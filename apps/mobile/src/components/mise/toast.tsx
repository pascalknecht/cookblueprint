import { Platform, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseFonts } from '@/constants/theme';
import { useToast } from '@/store/toast';

export function Toast() {
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  if (!toast) return null;

  return (
    <Animated.Text
      entering={FadeInDown.springify().damping(16).stiffness(220)}
      exiting={FadeOutDown.duration(160)}
      pointerEvents="none"
      style={[
        Platform.OS === 'ios' ? styles.pill : styles.snackbar,
        Platform.OS === 'ios' ? { bottom: insets.bottom + 96 } : { bottom: insets.bottom + 20 },
      ]}>
      {toast}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 200,
    backgroundColor: 'rgba(30,26,36,0.94)',
    color: '#fff',
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 13.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  snackbar: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 200,
    backgroundColor: '#322E38',
    color: '#F4EEF6',
    fontFamily: MiseFonts.bodyMedium,
    fontSize: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 8,
  },
});
