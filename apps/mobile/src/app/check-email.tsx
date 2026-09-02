import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { MiseColors, MiseFonts } from '@/constants/theme';

export default function CheckEmailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      testID="register-check-email-screen"
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 24 },
      ]}>
      <Text style={[styles.title, styles.centerText]}>{t('auth.checkEmailTitle')}</Text>
      <Text style={[styles.subtitle, styles.centerText]}>{t('auth.checkEmailBody')}</Text>
      <Button label={t('auth.backToLogin')} onPress={() => router.replace('/login')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 26, justifyContent: 'center', alignItems: 'center', gap: 16 },
  centerText: { textAlign: 'center' },
  title: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 34, lineHeight: 36, color: MiseColors.ink },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 15, color: MiseColors.muted },
});
