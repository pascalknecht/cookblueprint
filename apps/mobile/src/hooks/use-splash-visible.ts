import { useState } from 'react';

import { useAuthLookupPending } from '@/hooks/use-auth-lookup-pending';
import { useLocalMode } from '@/hooks/use-local-mode';
import { useMountEffect } from '@/hooks/use-mount-effect';
import { useSession } from '@/lib/auth-client';
import { useReducedMotionFlag } from '@/lib/motion';

// Wordmark entrance finishes at 950ms — hold at least that long so the
// sequence isn't cut off when local mode resolves in a few milliseconds.
const ENTRANCE_MS = 1000;
const REDUCED_HOLD_MS = 240;

/** True while the animated splash overlay should stay mounted. */
export function useSplashVisible(fontsReady: boolean) {
  const reduced = useReducedMotionFlag();
  const { isPending: sessionPending } = useSession();
  const { data: isLocal, isPending: localPending } = useLocalMode();
  const authPending = useAuthLookupPending(sessionPending, localPending, isLocal);
  const [holdDone, setHoldDone] = useState(false);

  useMountEffect(() => {
    const id = setTimeout(() => setHoldDone(true), reduced ? REDUCED_HOLD_MS : ENTRANCE_MS);
    return () => clearTimeout(id);
  });

  return !fontsReady || authPending || !holdDone;
}
