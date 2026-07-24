import { useEffect } from 'react';

/** The only sanctioned place for a raw `useEffect` — true mount-time external sync. */
export function useMountEffect(effect: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
