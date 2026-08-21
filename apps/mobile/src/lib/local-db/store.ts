import Storage from 'expo-sqlite/kv-store';

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await Storage.getItem(key);
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
  await Promise.all(keys.map((key) => Storage.removeItem(key)));
}
