import { useState } from 'react';

import { useMountEffect } from '@/hooks/use-mount-effect';

// Session talks to the API and can hang for a long time when the backend is
// unreachable. Local mode is sqlite — once we know it, that's enough to
// enter the app. Signed-out users only wait this long for a session before
// the welcome screen is shown.
const SESSION_WAIT_MS = 4000;

export function useAuthLookupPending(
  sessionPending: boolean,
  localPending: boolean,
  isLocal: boolean | undefined,
): boolean {
  const [sessionWaitExpired, setSessionWaitExpired] = useState(false);

  useMountEffect(() => {
    const id = setTimeout(() => setSessionWaitExpired(true), SESSION_WAIT_MS);
    return () => clearTimeout(id);
  });

  if (localPending) return true;
  if (isLocal) return false;
  return sessionPending && !sessionWaitExpired;
}
