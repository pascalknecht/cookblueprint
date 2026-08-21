import { getShareExtensionKey } from 'expo-share-intent';

/**
 * Expo Router calls this before resolving the initial route (cold start) and
 * on every subsequent incoming Linking url (warm start). expo-share-intent's
 * native side hands off an incoming share as a deep link containing this
 * marker; redirecting to the same route the app is already on lets
 * useShareIntentContext() (mounted in the root layout) pick up the share via
 * its own url-change effect without a dedicated route existing for it.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
    return '/';
  }
  return path;
}
