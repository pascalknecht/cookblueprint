import {
  RethinkSans_700Bold,
  RethinkSans_700Bold_Italic,
  RethinkSans_800ExtraBold,
} from '@expo-google-fonts/rethink-sans';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationBar } from '@zoontek/react-native-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ShareIntentProvider } from 'expo-share-intent';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplash } from '@/components/mise/animated-splash';
import { HtmlFetcherWebView } from '@/components/mise/html-fetcher-webview';
import { NeedleWebView } from '@/components/mise/needle-webview';
import { ShareIntentRedirect } from '@/components/mise/share-intent-redirect';
import { Toast } from '@/components/mise/toast';
import { SPLASH_GROUND } from '@/components/mise/splash-artwork';
import { useSplashVisible } from '@/hooks/use-splash-visible';
import i18n from '@/lib/i18n';
import '@/lib/purchases';
import { HtmlFetcherProvider } from '@/store/html-fetcher';
import { NeedleProvider, useNeedle } from '@/store/needle';
import { ToastProvider } from '@/store/toast';

SplashScreen.preventAutoHideAsync();
try {
  SplashScreen.setOptions({ duration: 0, fade: false });
} catch {
  // Expo Go has no native splash options.
}

const modalScreenOptions = {
  // TrueSheet (@lodev09/react-native-true-sheet) drives its own present/
  // dismiss animation, so the route itself must not also animate — that
  // would double it up.
  presentation: 'transparentModal' as const,
  animation: 'none' as const,
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    RethinkSans_700Bold,
    RethinkSans_700Bold_Italic,
    RethinkSans_800ExtraBold,
  });
  const fontsReady = fontsLoaded || !!fontError;

  return (
    <ShareIntentProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <ShareIntentRedirect />
            <SafeAreaProvider>
              <ToastProvider>
                <HtmlFetcherProvider>
                  <NeedleProvider>
                    <View style={{ flex: 1, backgroundColor: SPLASH_GROUND }}>
                      <StatusBar style="dark" />
                      <NavigationBar barStyle="light-content" />
                      <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="index" />
                      <Stack.Screen name="login" />
                      <Stack.Screen name="register" />
                      <Stack.Screen
                        name="paywall"
                        options={{ animation: 'slide_from_right', gestureEnabled: false }}
                      />
                      <Stack.Screen name="check-email" />
                      <Stack.Screen name="forgot-password" />
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="recipe/[id]" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="import" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="manual" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="edit-recipe" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="preferences" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="household" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="add-recipe-sheet" options={modalScreenOptions} />
                      <Stack.Screen name="share-sheet" options={modalScreenOptions} />
                      <Stack.Screen name="pick-recipe" options={modalScreenOptions} />
                      <Stack.Screen name="add-to-plan" options={modalScreenOptions} />
                      <Stack.Screen name="edit-meal" options={modalScreenOptions} />
                      <Stack.Screen name="recipe-options" options={modalScreenOptions} />
                      <Stack.Screen name="plan-options" options={modalScreenOptions} />
                      <Stack.Screen name="invite" options={modalScreenOptions} />
                      <Stack.Screen name="add-shopping-item" options={modalScreenOptions} />
                      <Stack.Screen name="shopping-category-settings" options={modalScreenOptions} />
                      <Stack.Screen name="select-household" options={modalScreenOptions} />
                      <Stack.Screen name="edit-account" options={{ animation: 'slide_from_right' }} />
                      </Stack>
                      <Toast />
                      <HtmlFetcherWebView />
                      <MaybeNeedleWebView />
                      <SplashOverlay fontsReady={fontsReady} />
                    </View>
                  </NeedleProvider>
                </HtmlFetcherProvider>
              </ToastProvider>
            </SafeAreaProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </GestureHandlerRootView>
    </ShareIntentProvider>
  );
}

function SplashOverlay({ fontsReady }: { fontsReady: boolean }) {
  const visible = useSplashVisible(fontsReady);
  if (!visible) return null;
  return <AnimatedSplash fontsReady={fontsReady} />;
}

// Mounting the hidden Needle WebView unconditionally (even delayed past the
// splash) corrupts Fabric's layout on Android — the root Stack measures as a
// square instead of filling the screen. Mirror HtmlFetcherWebView's already-
// safe pattern instead: stay unmounted until something actually needs it
// (the first extractIngredients call flips NeedleProvider's `mounted` flag).
function MaybeNeedleWebView() {
  const { mounted } = useNeedle();
  if (!mounted) return null;
  return <NeedleWebView />;
}
