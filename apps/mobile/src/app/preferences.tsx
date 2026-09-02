import { useMutation } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/mise/back-header';
import { MiseColors, MiseFonts } from '@/constants/theme';
import { useLocalMode } from '@/hooks/use-local-mode';
import { signOut } from '@/lib/auth-client';
import { setAppLocale, SUPPORTED_LOCALES, type AppLocale } from '@/lib/i18n';

export default function PreferencesScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: isLocal } = useLocalMode();

  const logoutMutation = useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => router.replace('/'),
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BackHeader title={t('preferences.title')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <Text style={styles.sectionTitle}>{t('preferences.language')}</Text>
        <View style={styles.languageRow}>
          {SUPPORTED_LOCALES.map((locale) => {
            const active = i18n.language === locale;
            return (
              <Pressable
                key={locale}
                onPress={() => setAppLocale(locale as AppLocale)}
                style={[styles.languageChip, active && styles.languageChipActive]}>
                <Text style={[styles.languageChipLabel, active && styles.languageChipLabelActive]}>
                  {locale === 'en' ? t('preferences.languageEnglish') : t('preferences.languageGerman')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLocal ? null : (
          <Text style={styles.logout} onPress={() => logoutMutation.mutate()}>
            {logoutMutation.isPending ? t('preferences.loggingOut') : t('preferences.logOut')}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 26 },
  sectionTitle: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 20, color: MiseColors.ink, marginBottom: 10 },
  languageRow: { flexDirection: 'row', gap: 8, marginBottom: 26 },
  languageChip: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  languageChipActive: { backgroundColor: MiseColors.near, borderColor: MiseColors.near },
  languageChipLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.inkSoft },
  languageChipLabelActive: { color: '#fff' },
  logout: {
    textAlign: 'center',
    color: MiseColors.muted,
    fontFamily: MiseFonts.bodyBold,
    fontSize: 14,
  },
});
