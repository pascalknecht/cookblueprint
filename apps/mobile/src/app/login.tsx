import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Purchases from 'react-native-purchases';

import { BackHeader } from '@/components/mise/back-header';
import { Button } from '@/components/mise/button';
import { TextField } from '@/components/mise/text-field';
import { MiseColors, MiseFonts } from '@/constants/theme';
import { useEndLocalMode, useLocalMode } from '@/hooks/use-local-mode';
import { signIn } from '@/lib/auth-client';
import { runWithLocalModeNetwork } from '@/lib/local-db/local-mode-state';
import { reconcileLocalData } from '@/lib/reconcile-local-data';
import { useToast } from '@/store/toast';
import { refreshMealPlanWidget, refreshShoppingListWidget } from '@/widgets/refresh-widgets';

export default function LoginScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: isLocal } = useLocalMode();
  const endLocalMode = useEndLocalMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      // Keep auth GETs unblocked until local mode is actually off, otherwise
      // the session refetch after sign-in would be stubbed and drop the cookie.
      return runWithLocalModeNetwork(async () => {
        const { data, error } = await signIn.email(input);
        if (error) throw new Error(error.message ?? t('common.errorLogin'));

        // Attach purchases to this account (rather than the device's
        // anonymous RevenueCat ID) so the entitlement gate in (tabs)/_layout
        // sees the right customer, even on a fresh device.
        if (data?.user.id) await Purchases.logIn(data.user.id);

        // Push any on-device data into the account we just signed into, then
        // drop back to normal server-backed mode — reuses the same REST
        // endpoints the app calls when online, no extra backend work needed.
        if (isLocal) {
          const summary = await reconcileLocalData();
          await endLocalMode.mutateAsync();
          queryClient.clear();
          // Flip the widgets over to the real account immediately rather than
          // waiting for the next mutation to nudge them.
          refreshMealPlanWidget();
          refreshShoppingListWidget();
          if (summary.imported) {
            showToast(summary.hadErrors ? t('auth.localImportedPartial') : t('auth.localImported'));
          }
        }

        return data;
      });
    },
    onSuccess: () => router.replace('/recipes'),
    onError: (error) => {
      if (error.message === 'Email not verified') {
        showToast(t('auth.verifyEmailToast'));
        return;
      }
      showToast(error.message);
    },
  });

  function handleLogin() {
    if (!email.trim() || !password) return;
    loginMutation.mutate({ email: email.trim(), password });
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BackHeader title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <TextField
          testID="login-email-input"
          label={t('auth.emailLabel')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.field}
        />
        <TextField
          testID="login-password-input"
          label={t('auth.passwordLabel')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry
          containerStyle={styles.fieldTight}
        />
        <Text style={styles.forgot} onPress={() => router.push('/forgot-password')}>
          {t('auth.forgotPassword')}
        </Text>

        <Button
          testID="login-submit-button"
          label={t('auth.logIn')}
          onPress={handleLogin}
          loading={loginMutation.isPending}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.newHere')}</Text>
          <Text style={styles.footerLink} onPress={() => router.replace('/register')}>
            {t('auth.createAccount')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 26 },
  field: { marginBottom: 16 },
  fieldTight: { marginBottom: 10 },
  forgot: {
    alignSelf: 'flex-end',
    color: MiseColors.brand,
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 13.5,
    marginBottom: 22,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 28 },
  footerText: { color: MiseColors.muted, fontFamily: MiseFonts.body, fontSize: 14 },
  footerLink: { color: MiseColors.brand, fontFamily: MiseFonts.bodyBold, fontSize: 14 },
});
