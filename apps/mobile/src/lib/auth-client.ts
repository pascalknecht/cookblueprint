import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import type { BetterAuthClientPlugin } from 'better-auth/client';
import { organizationClient } from 'better-auth/client/plugins';

import { secureStorage } from './secure-storage';

const rawExpoPlugin = expoClient({
  scheme: 'mise',
  storagePrefix: 'mise',
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

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [expoAuthPlugin, organizationClient()],
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
