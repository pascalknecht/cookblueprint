import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

import { MiseColors, MiseFonts } from '@/constants/theme';

export function MiseTile({ pulsing }: { pulsing?: boolean }) {
  return (
    <LinearGradient
      colors={[MiseColors.brandLight, MiseColors.brand]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.tile, pulsing && styles.tilePulsing]}>
      <Text style={styles.mark}>M</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 58,
    height: 58,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MiseColors.brandDark,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tilePulsing: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  mark: {
    fontFamily: MiseFonts.display,
    fontWeight: '500',
    fontSize: 30,
    color: '#fff',
  },
});
