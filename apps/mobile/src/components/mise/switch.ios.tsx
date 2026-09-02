import { Host, Toggle } from '@expo/ui/swift-ui';
import { StyleSheet } from 'react-native';

import { MiseColors } from '@/constants/theme';

type MiseSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function MiseSwitch({ value, onValueChange }: MiseSwitchProps) {
  return (
    <Host matchContents seedColor={MiseColors.brand} style={styles.host}>
      <Toggle isOn={value} onIsOnChange={onValueChange} />
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { minWidth: 51, minHeight: 31, flexShrink: 0 },
});
