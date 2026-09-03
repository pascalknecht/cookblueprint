import { router } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { LogoMark } from '@/components/mise/logo-mark';
import { PhotoPlaceholder } from '@/components/mise/photo-placeholder';
import { MiseColors, MiseFonts } from '@/constants/theme';
import { useAuthLookupPending } from '@/hooks/use-auth-lookup-pending';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useStartLocalMode, useLocalMode } from '@/hooks/use-local-mode';
import { useSession } from '@/lib/auth-client';
import { useToast } from '@/store/toast';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: isLocal, isPending: localPending } = useLocalMode();
  const { showToast } = useToast();
  const startLocalMode = useStartLocalMode();
  const isPending = useAuthLookupPending(sessionPending, localPending, isLocal);
  // Let use-share-intent-redirect.ts own navigation while a share is pending,
  // instead of racing its redirect to /import.
  const { hasShareIntent } = useShareIntentContext();

  useAuthRedirect({
    isPending: isPending || hasShareIntent,
    isAuthenticated: !!session || !!isLocal,
    redirectWhen: 'authenticated',
    to: '/recipes',
  });

  async function handleTryItOut() {
    try {
      await startLocalMode.mutateAsync();
    } catch {
      showToast(t('auth.tryItOutError'));
    }
  }

  if (isPending || session || isLocal) {
    return <View style={styles.screen} />;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <LogoMark size={30} />
        <Text style={styles.wordmark} numberOfLines={1}>
          CookBlueprint
        </Text>
      </View>

      <View style={styles.collage}>
        <PhotoPlaceholder
          color={MiseColors.gold}
          style={styles.collageTall}
          iconSize={40}
          source={require('@/assets/images/welcome/pasta.jpg')}
        />
        <View style={styles.collageColumn}>
          <PhotoPlaceholder
            color={MiseColors.brand}
            style={styles.collageSmall}
            iconSize={28}
            source={require('@/assets/images/welcome/tomatoes.jpg')}
          />
          <PhotoPlaceholder
            color={MiseColors.success}
            style={styles.collageSmall}
            iconSize={28}
            source={require('@/assets/images/welcome/herbs.jpg')}
          />
        </View>
      </View>

      <Text style={styles.title}>{t('auth.welcomeTitle')}</Text>
      <Text style={styles.subtitle}>{t('auth.welcomeSubtitle')}</Text>

      <View style={styles.ctas}>
        <Button testID="welcome-get-started-button" label={t('auth.getStarted')} onPress={() => router.push('/register')} />
        <Button
          testID="welcome-login-button"
          label={t('auth.haveAccount')}
          variant="secondary"
          onPress={() => router.push('/login')}
        />
        <Text
          accessibilityLabel="welcome-try-it-out"
          testID="welcome-try-it-out"
          style={styles.tryItOut}
          onPress={startLocalMode.isPending ? undefined : handleTryItOut}>
          {startLocalMode.isPending ? t('auth.tryItOutLoading') : t('auth.tryItOut')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20 },
  wordmark: { flexShrink: 1, fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 17, color: MiseColors.ink },
  collage: { flexDirection: 'row', gap: 10, height: 270, marginBottom: 26 },
  collageTall: { flex: 1.4, borderRadius: 20, overflow: 'hidden' },
  collageColumn: { flex: 1, gap: 10 },
  collageSmall: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  title: {
    fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking,
    fontSize: 37,
    lineHeight: 40,
    color: MiseColors.ink,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: MiseFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: MiseColors.muted,
    marginBottom: 26,
  },
  ctas: { marginTop: 'auto', gap: 12 },
  tryItOut: {
    textAlign: 'center',
    marginTop: 4,
    color: MiseColors.muted,
    fontFamily: MiseFonts.bodyBold,
    fontSize: 14,
  },
});
