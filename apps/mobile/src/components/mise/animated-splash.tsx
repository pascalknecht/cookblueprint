import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MARK_PT,
  SPLASH_CREAM,
  SPLASH_GROUND,
  SPLASH_MUTED,
  SPINNER_PT,
  SplashMark,
  SplashSpinnerArc,
  SplashSpinnerTrack,
  SplashSteam,
} from '@/components/mise/splash-artwork';
import { MiseFonts } from '@/constants/theme';
import { useMountEffect } from '@/hooks/use-mount-effect';
import { useSplashMotion } from '@/hooks/use-splash-motion';
import { useReducedMotionFlag } from '@/lib/motion';

function hideNativeSplash() {
  SplashScreen.hide();
}

export function AnimatedSplash({ fontsReady }: { fontsReady: boolean }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionFlag();
  const motion = useSplashMotion(reduced);

  useMountEffect(() => {
    hideNativeSplash();
  });

  return (
    <Animated.View
      accessibilityViewIsModal
      collapsable={false}
      exiting={FadeOut.duration(240)}
      onLayout={hideNativeSplash}
      pointerEvents="auto"
      style={styles.screen}
      testID="animated-splash">
      <StatusBar style="light" />
      <View style={styles.brand}>
        <View style={styles.markStage}>
          {reduced ? null : (
            <Animated.View style={[styles.steam, motion.steamStyle]}>
              <SplashSteam />
            </Animated.View>
          )}
          <Animated.View style={motion.markStyle}>
            <SplashMark reduced={reduced} />
          </Animated.View>
        </View>
        <Animated.Text
          accessibilityRole="header"
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.wordmark, fontsReady ? styles.wordmarkFont : styles.wordmarkFallback, motion.copyStyle]}>
          {t('splash.wordmark')}
        </Animated.Text>
        <Animated.Text
          style={[styles.tagline, fontsReady ? styles.taglineFont : styles.taglineFallback, motion.copyStyle]}>
          {t('splash.tagline')}
        </Animated.Text>
      </View>
      <Animated.View
        accessibilityLabel={t('splash.loading')}
        accessibilityRole="progressbar"
        style={[styles.loading, motion.loadingStyle, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.spinner}>
          <SplashSpinnerTrack />
          <Animated.View style={[styles.spinnerArc, motion.spinStyle]}>
            <SplashSpinnerArc />
          </Animated.View>
        </View>
        <Animated.Text
          accessible={false}
          style={[styles.loadingLabel, fontsReady ? styles.loadingFont : styles.loadingFallback]}>
          {t('splash.loading')}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 300,
    backgroundColor: SPLASH_GROUND,
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 72,
    paddingHorizontal: 24,
  },
  markStage: {
    width: MARK_PT,
    paddingTop: 30,
    marginBottom: 18,
    alignItems: 'center',
  },
  steam: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  wordmark: {
    fontSize: 29,
    letterSpacing: -0.87,
    color: SPLASH_CREAM,
    textAlign: 'center',
  },
  wordmarkFallback: { fontWeight: '800' },
  wordmarkFont: { fontFamily: MiseFonts.displayExtraBold },
  tagline: {
    marginTop: 8,
    fontSize: 11,
    letterSpacing: 1.8,
    color: SPLASH_MUTED,
    textAlign: 'center',
  },
  taglineFallback: { fontWeight: '500' },
  taglineFont: { fontFamily: MiseFonts.bodyMedium },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
  },
  spinner: {
    width: SPINNER_PT,
    height: SPINNER_PT,
  },
  spinnerArc: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  loadingLabel: {
    fontSize: 13,
    color: SPLASH_MUTED,
  },
  loadingFallback: { fontWeight: '500' },
  loadingFont: { fontFamily: MiseFonts.bodyMedium },
});
