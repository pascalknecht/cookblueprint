import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MiseTabBar } from '@/components/mise/tab-bar';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useSyncWidgetAuth } from '@/hooks/use-sync-widget-auth';
import { useSyncWidgetTrialData } from '@/hooks/use-sync-widget-trial-data';
import { useTrialMode } from '@/hooks/use-trial-mode';
import { useSession } from '@/lib/auth-client';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: isTrial, isPending: trialPending } = useTrialMode();

  useAuthRedirect({
    isPending: sessionPending || trialPending,
    isAuthenticated: !!session || !!isTrial,
    redirectWhen: 'unauthenticated',
    to: '/',
  });
  useSyncWidgetAuth(!!session);
  // Mirrors local trial data into the iOS widget's shared storage — Android's
  // widget reads local-db directly and needs no such syncing.
  useSyncWidgetTrialData(!!isTrial);

  return (
    <View style={{ flex: 1 }}>
      <Tabs tabBar={(props) => <MiseTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="recipes" options={{ title: t('nav.recipes') }} />
        <Tabs.Screen name="plan" options={{ title: t('nav.plan') }} />
        <Tabs.Screen name="list" options={{ title: t('nav.shoppingList') }} />
        <Tabs.Screen name="settings" options={{ title: t('nav.settings') }} />
      </Tabs>
    </View>
  );
}
