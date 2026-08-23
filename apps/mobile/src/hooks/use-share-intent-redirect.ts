import { router } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useEffect } from 'react';

import { useTrialMode } from '@/hooks/use-trial-mode';
import { useSession } from '@/lib/auth-client';

/**
 * Sends the app to the import screen with the shared URL whenever a share
 * intent arrives — from Chrome's (or any app's) share sheet on Android, or
 * the Share Extension on iOS. `app/+native-intent.ts` keeps Expo Router from
 * 404ing on the native hand-off deep link; this reacts once
 * expo-share-intent has actually resolved it into `shareIntent`.
 *
 * Signed-out, non-trial users get sent to `/login` instead — importing
 * requires an account.
 *
 * Deliberately doesn't call `resetShareIntent()`: the native module already
 * clears its own copy once read, so a second share still comes through fine,
 * and leaving `hasShareIntent` true lets index.tsx's own auth-redirect check
 * it directly instead of racing this one on cold start.
 */
export function useShareIntentRedirect() {
  const { hasShareIntent, shareIntent } = useShareIntentContext();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: isTrial, isPending: trialPending } = useTrialMode();

  useEffect(() => {
    if (!hasShareIntent || sessionPending || trialPending) return;
    const url = shareIntent.webUrl ?? shareIntent.text;
    if (!url) return;
    router.push(session || isTrial ? { pathname: '/import', params: { url, autostart: '1' } } : '/login');
  }, [hasShareIntent, shareIntent, session, sessionPending, isTrial, trialPending]);
}
