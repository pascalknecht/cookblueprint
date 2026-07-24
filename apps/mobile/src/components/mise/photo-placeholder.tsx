import { Ionicons } from '@expo/vector-icons';
import { StyleProp, View, ViewStyle } from 'react-native';

type PhotoPlaceholderProps = {
  color: string;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  children?: React.ReactNode;
};

export function PhotoPlaceholder({ color, style, iconSize = 28, children }: PhotoPlaceholderProps) {
  return (
    <View style={[{ backgroundColor: color, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Ionicons name="restaurant" size={iconSize} color="rgba(255,255,255,0.4)" />
      {children}
    </View>
  );
}
