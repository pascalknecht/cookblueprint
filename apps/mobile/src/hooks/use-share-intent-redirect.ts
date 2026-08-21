import { router } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useEffect } from 'react';

/**
 * Sends the app to the import screen with the shared URL whenever a share
 * intent arrives — from Chrome's (or any app's) share sheet on Android, or
 * the Share Extension on iOS. `app/+native-intent.ts` keeps Expo Router from
 * 404ing on the native hand-off deep link; this reacts once
 * expo-share-intent has actually resolved it into `shareIntent`.
 */
export function useShareIntentRedirect() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (!hasShareIntent) return;
    const url = shareIntent.webUrl ?? shareIntent.text;
    resetShareIntent();
    if (url) {
      router.push({ pathname: '/import', params: { url, autostart: '1' } });
    }
  }, [hasShareIntent, shareIntent, resetShareIntent]);
}
