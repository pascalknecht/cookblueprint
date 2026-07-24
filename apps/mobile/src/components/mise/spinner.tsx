import { ActivityIndicator } from 'react-native';

import { MiseColors } from '@/constants/theme';

type MiseSpinnerProps = {
  size?: number;
};

// Web fallback — @expo/ui's swift-ui/jetpack-compose backends are native-only.
export function MiseSpinner({ size = 64 }: MiseSpinnerProps) {
  return <ActivityIndicator size={size > 40 ? 'large' : 'small'} color={MiseColors.brand} />;
}
