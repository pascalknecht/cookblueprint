import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { LogoMark } from '@/components/mise/logo-mark';
import { MiseSpinner } from '@/components/mise/spinner';
import { PhotoPlaceholder } from '@/components/mise/photo-placeholder';
import { MiseColors, MiseFonts } from '@/constants/theme';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { useSession } from '@/lib/auth-client';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: session, isPending } = useSession();

  useAuthRedirect({
    isPending,
    isAuthenticated: !!session,
    redirectWhen: 'authenticated',
    to: '/(tabs)/recipes',
  });

  if (isPending || session) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <MiseSpinner size={48} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <LogoMark size={30} flat />
        <Text style={styles.wordmark}>Mise</Text>
      </View>

      <View style={styles.collage}>
        <PhotoPlaceholder color={MiseColors.gold} style={styles.collageTall} iconSize={40} />
        <View style={styles.collageColumn}>
          <PhotoPlaceholder color={MiseColors.brand} style={styles.collageSmall} iconSize={28} />
          <PhotoPlaceholder color={MiseColors.success} style={styles.collageSmall} iconSize={28} />
        </View>
      </View>

      <Text style={styles.title}>Cook, plan &{'\n'}shop — together.</Text>
      <Text style={styles.subtitle}>
        Save recipes from anywhere, build your week, and never forget an ingredient.
      </Text>

      <View style={styles.ctas}>
        <Button label="Get started — it's free" onPress={() => router.push('/register')} />
        <Button label="I already have an account" variant="secondary" onPress={() => router.push('/login')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  loading: { alignItems: 'center', justifyContent: 'center' },
  content: { flexGrow: 1, paddingHorizontal: 22 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20 },
  wordmark: { fontFamily: MiseFonts.display, fontSize: 24, color: MiseColors.ink },
  collage: { flexDirection: 'row', gap: 10, height: 270, marginBottom: 26 },
  collageTall: { flex: 1.4, borderRadius: 20, overflow: 'hidden' },
  collageColumn: { flex: 1, gap: 10 },
  collageSmall: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  title: {
    fontFamily: MiseFonts.display,
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
});
