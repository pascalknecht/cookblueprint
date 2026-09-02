import { Platform } from 'react-native';

import { authClient } from './auth-client';
import { isLocalModeActive } from './local-db/local-mode-state';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiErrorBody = { error?: string };

export class ApiError extends Error {}

export type ApiCallOptions = {
  /** Login reconciliation is the only path that may hit the API while local mode is still on. */
  allowInLocalMode?: boolean;
};

async function apiFetch<T>(path: string, init: RequestInit = {}, options?: ApiCallOptions): Promise<T> {
  if (!options?.allowInLocalMode && (await isLocalModeActive())) {
    throw new ApiError(`Local mode blocked request to ${path}`);
  }

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
  get: <T>(path: string, options?: ApiCallOptions) => apiFetch<T>(path, {}, options),
  post: <T>(path: string, body?: unknown, options?: ApiCallOptions) =>
    apiFetch<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }, options),
  put: <T>(path: string, body?: unknown, options?: ApiCallOptions) =>
    apiFetch<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }, options),
  patch: <T>(path: string, body?: unknown, options?: ApiCallOptions) =>
    apiFetch<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }, options),
  delete: <T>(path: string, options?: ApiCallOptions) => apiFetch<T>(path, { method: 'DELETE' }, options),
};
