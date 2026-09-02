import { LOCAL_DATA_KEYS, LOCAL_KEYS } from './keys';
import { getJSON, removeKeys, setJSON } from './store';

let cached: boolean | null = null;
let networkOverrideCount = 0;

/** Synchronous snapshot after the first sqlite read (or a start/end write). */
export function peekLocalMode(): boolean | null {
  return cached;
}

/** True while login/register is in flight — auth GETs must reach the server then. */
export function isLocalModeNetworkAllowed(): boolean {
  return networkOverrideCount > 0;
}

/** Lets auth session reads through for the duration of `fn` (sign-in / sign-up). */
export async function runWithLocalModeNetwork<T>(fn: () => Promise<T>): Promise<T> {
  networkOverrideCount += 1;
  try {
    return await fn();
  } finally {
    networkOverrideCount -= 1;
  }
}

/** Whether the app is running in on-device local mode (no server account). */
export async function isLocalModeActive(): Promise<boolean> {
  if (cached !== null) return cached;
  cached = await getJSON<boolean>(LOCAL_KEYS.active, false);
  return cached;
}

export async function setLocalModeActive(active: boolean): Promise<void> {
  cached = active;
  await setJSON(LOCAL_KEYS.active, active);
}

/** Wipes all locally-stored data and flags — called once reconciliation finishes. */
export async function clearLocalData(): Promise<void> {
  cached = false;
  await removeKeys([...LOCAL_DATA_KEYS, LOCAL_KEYS.active]);
}
