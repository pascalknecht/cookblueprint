import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

type LogoMarkProps = {
  size?: number;
};

export function LogoMark({ size = 30 }: LogoMarkProps) {
  return (
    <Image
      source={require('@/assets/images/icon.png')}
      style={[styles.box, { width: size, height: size, borderRadius: size * 0.3 }]}
    />
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
});
