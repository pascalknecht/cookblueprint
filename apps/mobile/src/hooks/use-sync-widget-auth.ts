import { ExtensionStorage } from '@bacons/apple-targets';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { WIDGET_APP_GROUP } from '@/widgets/widget-names';

/**
 * Mirrors the session cookie and API URL into the iOS widget's shared App
 * Group storage, since the WidgetKit extension runs in a separate process
 * with no access to expo-secure-store — it fetches the meal plan/shopping
 * list itself and needs this to authenticate. Reusable hook wrapping the one
 * raw `useEffect` needed to sync as auth state changes over the component's
 * lifetime (mirrors `useAuthRedirect`'s pattern). No-op on Android and web.
 */
export function useSyncWidgetAuth(isAuthenticated: boolean) {
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const storage = new ExtensionStorage(WIDGET_APP_GROUP);
    if (isAuthenticated) {
      storage.set('apiURL', process.env.EXPO_PUBLIC_API_URL ?? '');
      storage.set('sessionCookie', authClient.getCookie() ?? '');
    } else {
      storage.remove('sessionCookie');
    }
    ExtensionStorage.reloadWidget();
  }, [isAuthenticated]);
}
