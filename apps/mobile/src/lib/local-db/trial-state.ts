import { TRIAL_DATA_KEYS, TRIAL_KEYS } from './keys';
import { getJSON, removeKeys, setJSON } from './store';

export function isTrialActive(): Promise<boolean> {
  return getJSON<boolean>(TRIAL_KEYS.active, false);
}

export function setTrialActive(active: boolean): Promise<void> {
  return setJSON(TRIAL_KEYS.active, active);
}

/** Wipes all locally-stored trial data and flags — called once reconciliation finishes. */
export async function clearTrialData(): Promise<void> {
  await removeKeys([...TRIAL_DATA_KEYS, TRIAL_KEYS.active]);
}
