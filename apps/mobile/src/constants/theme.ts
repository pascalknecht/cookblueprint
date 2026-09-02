import { Platform } from 'react-native';

export const MiseColors = {
  brand: '#C4553E',
  brandDark: '#9E3F2C',
  brandLight: '#D9714E',
  ink: '#221E1B',
  inkSoft: '#4A423B',
  muted: '#97887C',
  mutedLight: '#B3A99D',
  border: '#EAE1D4',
  borderSoft: '#F0E8DD',
  borderTint: '#F0DED4',
  borderFaint: '#EFE7DC',
  divider: '#F3EDE3',
  background: '#FBF6EF',
  backgroundDim: '#E9E2D8',
  card: '#FFFFFF',
  near: '#141118',
  tint: '#FBEDE7',
  tintStrong: '#FDEEE4',
  success: '#2FA46A',
  successBg: '#EAF7F0',
  successBorder: '#C9EAD8',
  gold: '#E8A33D',
  amber: '#D98324',
  clay: '#C77C3A',
  berry: '#B0447E',
} as const;

export const RecipeAccentColors = [
  MiseColors.gold,
  MiseColors.brand,
  MiseColors.berry,
  MiseColors.amber,
  MiseColors.success,
  MiseColors.clay,
] as const;

export const MiseFonts = {
  display: 'RethinkSans_700Bold',
  displayItalic: 'RethinkSans_700Bold_Italic',
  displayExtraBold: 'RethinkSans_800ExtraBold',
  // Tighter tracking on the bold display face — a heavy weight at these
  // sizes reads loose at default spacing, so headings pull in to compensate.
  displayTracking: -0.5,
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  bodyExtraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const MiseRadius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  pill: 999,
} as const;

export const BackIconName = Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back';
