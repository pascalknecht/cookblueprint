import { Tabs, router } from 'expo-router';
import { Platform, View } from 'react-native';

import { IconButton } from '@/components/mise/icon-button';
import { MiseTabBar } from '@/components/mise/tab-bar';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useSession } from '@/lib/auth-client';

export default function TabsLayout() {
  const { data: session, isPending } = useSession();

  useAuthRedirect({
    isPending,
    isAuthenticated: !!session,
    redirectWhen: 'unauthenticated',
    to: '/',
  });

  return (
    <View style={{ flex: 1 }}>
      <Tabs tabBar={(props) => <MiseTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="recipes" options={{ title: 'Recipes' }} />
        <Tabs.Screen name="plan" options={{ title: 'Plan' }} />
        <Tabs.Screen name="list" options={{ title: 'List' }} />
        <Tabs.Screen name="team" options={{ title: 'Team' }} />
      </Tabs>
      {Platform.OS !== 'ios' ? (
        <IconButton
          name="add"
          variant="gradient"
          size={58}
          iconSize={28}
          onPress={() => router.push('/add-recipe-sheet')}
          style={{ position: 'absolute', right: 18, bottom: 74 }}
        />
      ) : null}
    </View>
  );
}
