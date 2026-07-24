import { Host, ProgressView } from '@expo/ui/swift-ui';

import { MiseColors } from '@/constants/theme';

type MiseSpinnerProps = {
  size?: number;
};

export function MiseSpinner({ size = 64 }: MiseSpinnerProps) {
  return (
    <Host style={{ width: size, height: size }} seedColor={MiseColors.brand}>
      <ProgressView />
    </Host>
  );
}
