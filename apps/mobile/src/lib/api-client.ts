import { Platform } from 'react-native';

import { authClient } from './auth-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiErrorBody = { error?: string };

export class ApiError extends Error {}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');

  // Mirrors exactly what better-auth's own Expo client plugin does for its
  // auth calls: native fetch doesn't share a browser's cookie jar, so the
  // session cookie is attached manually from the client's own storage. On
  // web, the browser already sends it via `credentials: 'include'`.
  if (Platform.OS === 'web') {
    init.credentials = 'include';
  } else {
    const cookie = authClient.getCookie();
    if (cookie) headers.set('Cookie', cookie);
    init.credentials = 'omit';
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    const body: ApiErrorBody = await response.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Request to ${path} failed with status ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
