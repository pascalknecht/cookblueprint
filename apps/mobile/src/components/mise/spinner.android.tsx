import { CircularProgressIndicator, Host } from '@expo/ui/jetpack-compose';

import { MiseColors } from '@/constants/theme';

type MiseSpinnerProps = {
  size?: number;
};

export function MiseSpinner({ size = 64 }: MiseSpinnerProps) {
  return (
    <Host style={{ width: size, height: size }}>
      <CircularProgressIndicator progress={null} color={MiseColors.brand} strokeWidth={5} />
    </Host>
  );
}
