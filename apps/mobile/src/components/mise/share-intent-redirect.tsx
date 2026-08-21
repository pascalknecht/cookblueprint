import { useShareIntentRedirect } from '@/hooks/use-share-intent-redirect';

/** Renders nothing — just needs to sit inside `<ShareIntentProvider>` to consume its context. */
export function ShareIntentRedirect() {
  useShareIntentRedirect();
  return null;
}
