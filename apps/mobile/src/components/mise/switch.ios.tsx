import { Host, Toggle } from '@expo/ui/swift-ui';

import { MiseColors } from '@/constants/theme';

type MiseSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function MiseSwitch({ value, onValueChange }: MiseSwitchProps) {
  return (
    <Host matchContents seedColor={MiseColors.brand}>
      <Toggle isOn={value} onIsOnChange={onValueChange} />
    </Host>
  );
}
