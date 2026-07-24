import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseTile } from '@/components/mise/mise-tile';
import { MiseColors, MiseFonts } from '@/constants/theme';

const DEMO_URL = 'https://cooking.example.com/best-lemon-herb-chicken';

const STEPS = [
  {
    title: '1 · Find a recipe',
    body: 'You spotted a recipe on any website or app — here, "The Best Lemon Herb Chicken".',
  },
  {
    title: '2 · Tap Share',
    body: 'In that app, tap the system Share button to open this menu of destinations.',
  },
  {
    title: '3 · Choose Mise',
    body: "Pick Mise and we'll pull in the ingredients, steps and photo automatically.",
  },
];

export default function ShareSheetScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  function dismiss() {
    router.back();
  }

  function next() {
    if (step >= 2) {
      router.replace({ pathname: '/import', params: { url: DEMO_URL, autostart: '1' } });
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <View style={styles.host}>
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />

      <View style={styles.coachmark}>
        <View style={styles.coachmarkHeader}>
          <Text style={styles.coachmarkEyebrow}>TUTORIAL · HOW IMPORTING WORKS</Text>
          <Text style={styles.skip} onPress={dismiss}>
            Skip
          </Text>
        </View>
        <Text style={styles.coachmarkTitle}>{STEPS[step].title}</Text>
        <Text style={styles.coachmarkBody}>{STEPS[step].body}</Text>
        <View style={styles.coachmarkFooter}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.coachmarkButtons}>
            {step > 0 ? (
              <Pressable onPress={back} style={styles.backButton}>
                <Text style={styles.backButtonLabel}>Back</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={next} style={styles.nextButton}>
              <Text style={styles.nextButtonLabel}>{step === 2 ? 'Import it →' : 'Next'}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.shareCard, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />
        <View style={[styles.sourceRow, step === 0 && styles.highlight]}>
          <View style={styles.sourceThumb} />
          <View style={styles.sourceBody}>
            <Text style={styles.sourceTitle} numberOfLines={1}>
              The Best Lemon Herb Chicken
            </Text>
            <Text style={styles.sourceUrl}>cooking.example.com</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={[styles.shareToWrap, step === 1 && styles.highlight]}>
          <Text style={styles.shareToLabel}>SHARE TO</Text>
          <View style={styles.appsRow}>
            <Pressable onPress={next} style={styles.appSlot}>
              <MiseTile pulsing={step === 2} />
              <Text style={styles.appLabel}>Mise</Text>
            </Pressable>
            <View style={styles.appSlot}>
              <View style={[styles.appIcon, { backgroundColor: '#25D366' }]} />
              <Text style={styles.appLabelDim}>Messages</Text>
            </View>
            <View style={styles.appSlot}>
              <View style={[styles.appIcon, { backgroundColor: '#1877F2' }]} />
              <Text style={styles.appLabelDim}>Mail</Text>
            </View>
            <View style={styles.appSlot}>
              <View style={[styles.appIcon, { backgroundColor: '#8A817A' }]} />
              <Text style={styles.appLabelDim}>Notes</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, backgroundColor: 'rgba(20,12,30,0.42)', justifyContent: 'flex-end' },
  coachmark: {
    marginHorizontal: 14,
    marginBottom: 10,
    backgroundColor: MiseColors.ink,
    borderRadius: 18,
    padding: 18,
    paddingTop: 17,
    paddingBottom: 15,
  },
  coachmarkHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  coachmarkEyebrow: { color: MiseColors.gold, fontFamily: MiseFonts.bodyExtraBold, fontSize: 11, letterSpacing: 0.6 },
  skip: { color: 'rgba(255,255,255,0.55)', fontFamily: MiseFonts.bodySemiBold, fontSize: 13 },
  coachmarkTitle: { color: '#fff', fontFamily: MiseFonts.bodyExtraBold, fontSize: 16, marginBottom: 5 },
  coachmarkBody: { color: 'rgba(255,255,255,0.78)', fontFamily: MiseFonts.body, fontSize: 13.5, lineHeight: 20, marginBottom: 15 },
  coachmarkFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 99, backgroundColor: '#DDD3C6' },
  dotActive: { width: 18, backgroundColor: MiseColors.brand },
  coachmarkButtons: { flexDirection: 'row', gap: 9 },
  backButton: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonLabel: { color: '#fff', fontFamily: MiseFonts.bodyBold, fontSize: 13.5 },
  nextButton: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 11,
    backgroundColor: MiseColors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonLabel: { color: '#fff', fontFamily: MiseFonts.bodyBold, fontSize: 13.5 },
  shareCard: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(248,246,244,0.98)' : '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  handle: {
    width: 38,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(150,140,130,0.4)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  highlight: { borderRadius: 12, shadowColor: MiseColors.brand, shadowOpacity: 0.5, shadowRadius: 0, borderWidth: 1.5, borderColor: MiseColors.brand },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, marginBottom: 6 },
  sourceThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: MiseColors.brand },
  sourceBody: { flex: 1, minWidth: 0 },
  sourceTitle: { fontFamily: MiseFonts.bodyBold, fontSize: 13.5, color: MiseColors.ink },
  sourceUrl: { fontFamily: MiseFonts.body, fontSize: 12, color: MiseColors.muted },
  divider: { borderBottomWidth: 1, borderBottomColor: 'rgba(120,110,100,0.14)', marginBottom: 14 },
  shareToWrap: { padding: 6, borderRadius: 10 },
  shareToLabel: {
    fontFamily: MiseFonts.bodyBold,
    fontSize: 11,
    color: MiseColors.muted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  appsRow: { flexDirection: 'row', gap: 16 },
  appSlot: { alignItems: 'center', gap: 7 },
  appIcon: { width: 58, height: 58, borderRadius: 17, opacity: 0.5 },
  appLabel: { fontFamily: MiseFonts.bodyBold, fontSize: 11, color: MiseColors.ink },
  appLabelDim: { fontFamily: MiseFonts.body, fontSize: 11, color: MiseColors.muted, opacity: 0.5 },
});
