import { Host, Switch } from '@expo/ui/jetpack-compose';

import { MiseColors } from '@/constants/theme';

type MiseSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function MiseSwitch({ value, onValueChange }: MiseSwitchProps) {
  return (
    <Host matchContents seedColor={MiseColors.brand}>
      <Switch value={value} onCheckedChange={onValueChange} />
    </Host>
  );
}
