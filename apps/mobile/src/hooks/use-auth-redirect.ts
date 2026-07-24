import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

/**
 * Reusable custom hook wrapping the one raw `useEffect` needed to sync the
 * router with async session state as it resolves over the component's lifetime.
 */
export function useAuthRedirect(options: {
  isPending: boolean;
  isAuthenticated: boolean;
  redirectWhen: 'authenticated' | 'unauthenticated';
  to: Href;
}) {
  const { isPending, isAuthenticated, redirectWhen, to } = options;

  useEffect(() => {
    if (isPending) return;
    const shouldRedirect = redirectWhen === 'authenticated' ? isAuthenticated : !isAuthenticated;
    if (shouldRedirect) router.replace(to);
  }, [isPending, isAuthenticated, redirectWhen, to]);
}
