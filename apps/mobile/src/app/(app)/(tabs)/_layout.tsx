import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MiseTabBar } from '@/components/mise/tab-bar';
import { useAuthLookupPending } from '@/hooks/use-auth-lookup-pending';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useSyncWidgetAuth } from '@/hooks/use-sync-widget-auth';
import { useSyncWidgetLocalData } from '@/hooks/use-sync-widget-local-data';
import { useLocalMode } from '@/hooks/use-local-mode';
import { useSession } from '@/lib/auth-client';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: isLocal, isPending: localPending } = useLocalMode();

  const isPending = useAuthLookupPending(sessionPending, localPending, isLocal);

  useAuthRedirect({
    isPending,
    isAuthenticated: !!session || !!isLocal,
    redirectWhen: 'unauthenticated',
    to: '/',
  });
  // No app-wide entitlement gate — free (non-entitled) accounts get full
  // access to the app itself. Premium is gated per-feature instead (see the
  // advanced auto-plan lock in plan-options.tsx).
  useSyncWidgetAuth(!!session);
  // Mirrors on-device data into the iOS widget's shared storage — Android's
  // widget reads local-db directly and needs no such syncing.
  useSyncWidgetLocalData(!!isLocal);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <MiseTabBar {...props} />}
        screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Tabs.Screen name="recipes" options={{ title: t('nav.recipes') }} />
        <Tabs.Screen name="plan" options={{ title: t('nav.plan') }} />
        <Tabs.Screen name="list" options={{ title: t('nav.shoppingList') }} />
        <Tabs.Screen name="settings" options={{ title: t('nav.settings') }} />
      </Tabs>
    </View>
  );
}
