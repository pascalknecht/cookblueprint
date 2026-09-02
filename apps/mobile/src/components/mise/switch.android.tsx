import { Host, Switch } from '@expo/ui/jetpack-compose';
import { StyleSheet } from 'react-native';

import { MiseColors } from '@/constants/theme';

type MiseSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function MiseSwitch({ value, onValueChange }: MiseSwitchProps) {
  return (
    <Host matchContents seedColor={MiseColors.brand} style={styles.host}>
      <Switch value={value} onCheckedChange={onValueChange} />
    </Host>
  );
}

// Material 3 switch track. `matchContents` reports size after first layout;
// without a floor, a flex row gives the Host 0 width, the label eats the
// line, and the Compose switch paints off-screen — clipped and untappable.
const styles = StyleSheet.create({
  host: { minWidth: 52, minHeight: 32, flexShrink: 0 },
});
