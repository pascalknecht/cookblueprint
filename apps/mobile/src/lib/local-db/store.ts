import Storage from 'expo-sqlite/kv-store';

import { legacyKeyFor } from './keys';

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  let raw = await Storage.getItem(key);
  if (raw === null) {
    const legacy = legacyKeyFor(key);
    if (legacy) raw = await Storage.getItem(legacy);
  }
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  await Storage.setItem(key, JSON.stringify(value));
}

export async function removeKeys(keys: readonly string[]): Promise<void> {
  const extra = keys.flatMap((key) => {
    const legacy = legacyKeyFor(key);
    return legacy ? [legacy] : [];
  });
  await Promise.all([...keys, ...extra].map((key) => Storage.removeItem(key)));
}
