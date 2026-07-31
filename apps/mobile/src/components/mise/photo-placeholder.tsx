import { Ionicons } from '@expo/vector-icons';
import { Image, ImageSource } from 'expo-image';
import { StyleProp, View, ViewStyle } from 'react-native';

type PhotoPlaceholderProps = {
  color: string;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  source?: ImageSource;
  children?: React.ReactNode;
};

export function PhotoPlaceholder({ color, style, iconSize = 28, source, children }: PhotoPlaceholderProps) {
  if (source) {
    return (
      <View style={[{ backgroundColor: color }, style]}>
        <Image source={source} style={{ flex: 1 }} contentFit="cover" transition={200} />
        {children}
      </View>
    );
  }

  return (
    <View style={[{ backgroundColor: color, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Ionicons name="restaurant" size={iconSize} color="rgba(255,255,255,0.4)" />
      {children}
    </View>
  );
}
