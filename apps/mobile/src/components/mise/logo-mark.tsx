import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { MiseColors, MiseFonts } from '@/constants/theme';

type LogoMarkProps = {
  size?: number;
  flat?: boolean;
};

export function LogoMark({ size = 30, flat = false }: LogoMarkProps) {
  const inner = (
    <Text style={{ fontFamily: MiseFonts.display, fontWeight: '500', fontSize: size * 0.7, color: '#fff' }}>M</Text>
  );

  if (flat) {
    return (
      <View
        style={[
          styles.box,
          { width: size, height: size, borderRadius: size * 0.3, backgroundColor: MiseColors.brand },
        ]}>
        {inner}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[MiseColors.brandLight, MiseColors.brand]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.box, styles.shadow, { width: size, height: size, borderRadius: size * 0.3 }]}>
      {inner}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: MiseColors.brandDark,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
