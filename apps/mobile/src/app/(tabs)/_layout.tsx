import { Ionicons } from '@expo/vector-icons';
import { Tabs, router, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseTabBar, TAB_BAR_HEIGHT } from '@/components/mise/tab-bar';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useSession } from '@/lib/auth-client';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { data: session, isPending } = useSession();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const onListTab = pathname.startsWith('/list');

  useAuthRedirect({
    isPending,
    isAuthenticated: !!session,
    redirectWhen: 'unauthenticated',
    to: '/',
  });

  // Keep in sync with MiseTabBar's own bottom-gap logic so the add-item bar clears the pill consistently.
  const tabBarHeight = TAB_BAR_HEIGHT + Math.max(insets.bottom, 16);

  return (
    <View style={{ flex: 1 }}>
      <Tabs tabBar={(props) => <MiseTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="recipes" options={{ title: t('nav.recipes') }} />
        <Tabs.Screen name="plan" options={{ title: t('nav.plan') }} />
        <Tabs.Screen name="list" options={{ title: t('nav.shoppingList') }} />
        <Tabs.Screen name="household" options={{ title: t('nav.household') }} />
      </Tabs>
      {onListTab ? (
        <Pressable
          style={[styles.addItemBar, { bottom: tabBarHeight + 12 }]}
          onPress={() => router.push('/add-shopping-item')}>
          <Ionicons name="search" size={16} color={MiseColors.mutedLight} />
          <TextInput
            placeholder={t('nav.addItemPlaceholder')}
            placeholderTextColor={MiseColors.mutedLight}
            style={styles.addItemInput}
            showSoftInputOnFocus={false}
            onFocus={() => router.push('/add-shopping-item')}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  addItemBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: MiseRadius.md,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    shadowColor: '#5A3C14',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addItemInput: { flex: 1, fontFamily: MiseFonts.body, fontSize: 14.5, color: MiseColors.ink },
});
