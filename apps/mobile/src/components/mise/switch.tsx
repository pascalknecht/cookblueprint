import { Switch as RNSwitch } from 'react-native';

import { MiseColors } from '@/constants/theme';

type MiseSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

// Web fallback — @expo/ui's swift-ui/jetpack-compose backends are native-only.
export function MiseSwitch({ value, onValueChange }: MiseSwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: MiseColors.brand, false: '#E4DACB' }}
      thumbColor="#fff"
    />
  );
}
