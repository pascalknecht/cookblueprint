import { useGlobalSearchParams, usePathname, type Href } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';

import { useAuthLookupPending } from '@/hooks/use-auth-lookup-pending';
import { useLocalMode } from '@/hooks/use-local-mode';
import { useSession } from '@/lib/auth-client';

/**
 * Href to send a just-arrived share to, or `null` if there's nothing to do.
 *
 * Signed-out, non-local users go to `/login` — importing requires an account.
 * Returns null once that destination is already showing so `<Redirect>` can
 * unmount; otherwise the root layout's re-renders would replace on every
 * paint (`Redirect` re-subscribes its focus effect each render).
 *
 * Deliberately doesn't call `resetShareIntent()` here: the native module
 * already clears its own copy once read, and leaving `hasShareIntent` true
 * lets index.tsx skip its auth-redirect to recipes on cold start. Import
 * consumes the JS copy after it mounts so leaving `/import` doesn't bounce
 * back.
 */
export function useShareIntentHref(): Href | null {
  const { hasShareIntent, shareIntent } = useShareIntentContext();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: isLocal, isPending: localPending } = useLocalMode();
  const authPending = useAuthLookupPending(sessionPending, localPending, isLocal);
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ url?: string | string[] }>();

  if (!hasShareIntent || authPending) return null;
  const url = shareIntent.webUrl ?? shareIntent.text;
  if (!url) return null;

  if (session || isLocal) {
    const currentUrl = Array.isArray(params.url) ? params.url[0] : params.url;
    if (pathname === '/import' && currentUrl === url) return null;
    return { pathname: '/import', params: { url, autostart: '1' } };
  }

  if (pathname === '/login') return null;
  return '/login';
}
