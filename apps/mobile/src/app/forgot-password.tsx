import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { TextField } from '@/components/mise/text-field';
import { BackIconName, MiseColors, MiseFonts } from '@/constants/theme';
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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 24 }]}>
      <IconButton name={BackIconName} onPress={() => router.back()} style={styles.back} />

      <Text style={styles.title}>{t('auth.forgotTitle')}</Text>
      <Text style={styles.subtitle}>{t('auth.forgotSubtitle')}</Text>

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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22 },
  back: { marginBottom: 22 },
  title: { fontFamily: MiseFonts.display, fontSize: 34, lineHeight: 36, color: MiseColors.ink, marginBottom: 6 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 15, color: MiseColors.muted, marginBottom: 26 },
  field: { marginBottom: 22 },
});
