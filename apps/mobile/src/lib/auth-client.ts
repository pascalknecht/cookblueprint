import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import type { BetterAuthClientPlugin } from 'better-auth/client';
import { organizationClient } from 'better-auth/client/plugins';

import { isLocalModeActive, isLocalModeNetworkAllowed } from './local-db/local-mode-state';
import { secureStorage } from './secure-storage';

const rawExpoPlugin = expoClient({
  scheme: 'cookblueprint',
  storagePrefix: 'cookblueprint',
  storage: secureStorage,
});

// `expoClient`'s published `getActions` signature doesn't structurally
// satisfy `BetterAuthClientPlugin` (generic parameter defaults don't line
// up with the base interface), even though it's the documented, working
// integration at runtime. Only patching that one property — rather than
// casting the whole plugin to the generic base type — keeps the rest of
// `createAuthClient`'s plugin-tuple inference (session/org shapes) intact.
const expoAuthPlugin = {
  ...rawExpoPlugin,
  getActions: rawExpoPlugin.getActions as BetterAuthClientPlugin['getActions'],
};

async function localModeAwareFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Session probes and org reads are GET. Sign-in / sign-up are POST and must
  // still reach the server when a local-mode user creates or joins an account.
  // A GET during that conversion (session after POST) is allowed via the override.
  const method = (init?.method ?? 'GET').toUpperCase();
  if (method === 'GET' && !isLocalModeNetworkAllowed() && (await isLocalModeActive())) {
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return fetch(input, init);
}

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [expoAuthPlugin, organizationClient()],
  fetchOptions: {
    customFetchImpl: localModeAwareFetch,
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  useActiveOrganization,
  useListOrganizations,
  organization,
  requestPasswordReset,
  sendVerificationEmail,
} = authClient;
