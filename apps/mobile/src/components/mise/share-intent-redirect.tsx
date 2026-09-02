import { Redirect } from 'expo-router';

import { useShareIntentHref } from '@/hooks/use-share-intent-redirect';

/**
 * Sits inside `<ShareIntentProvider>`. Renders Expo Router's `<Redirect>`
 * when a share intent has a destination — `Redirect` waits for the navigator
 * to load (via `useFocusEffect`) before replacing, so this is safe in the
 * root layout on cold start.
 */
export function ShareIntentRedirect() {
  const href = useShareIntentHref();
  if (!href) return null;
  return <Redirect href={href} />;
}
