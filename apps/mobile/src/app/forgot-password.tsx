import { useMutation } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/mise/back-header';
import { Button } from '@/components/mise/button';
import { TextField } from '@/components/mise/text-field';
import { MiseColors } from '@/constants/theme';
import { requestPasswordReset } from '@/lib/auth-client';
import { useToast } from '@/store/toast';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const requestResetMutation = useMutation({
    mutationFn: async (input: { email: string }) => {
      const { error } = await requestPasswordReset({
        email: input.email,
        redirectTo: `${process.env.EXPO_PUBLIC_WEB_APP_URL}/reset-password`,
      });
      if (error) throw new Error(error.message ?? t('common.errorResetPassword'));
    },
    onSuccess: () => {
      showToast(t('auth.resetLinkToast'));
      router.back();
    },
    onError: (error) => showToast(error.message),
  });

  function handleSend() {
    if (!email.trim()) return;
    requestResetMutation.mutate({ email: email.trim() });
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BackHeader title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <TextField
          label={t('auth.emailLabel')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.field}
        />

        <Button label={t('auth.sendResetLink')} onPress={handleSend} loading={requestResetMutation.isPending} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 26 },
  field: { marginBottom: 22 },
});
