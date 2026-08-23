import {
  RethinkSans_700Bold,
  RethinkSans_700Bold_Italic,
} from '@expo-google-fonts/rethink-sans';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ShareIntentProvider } from 'expo-share-intent';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HtmlFetcherWebView } from '@/components/mise/html-fetcher-webview';
import { ShareIntentRedirect } from '@/components/mise/share-intent-redirect';
import { Toast } from '@/components/mise/toast';
import { MiseColors } from '@/constants/theme';
import { useHideSplashWhenReady } from '@/hooks/use-hide-splash-when-ready';
import i18n from '@/lib/i18n';
import { HtmlFetcherProvider } from '@/store/html-fetcher';
import { ToastProvider } from '@/store/toast';

SplashScreen.preventAutoHideAsync();

const modalScreenOptions = {
  // BottomSheetModal (@gorhom/bottom-sheet) drives its own present/dismiss
  // animation, so the route itself must not also animate — that would double it up.
  presentation: 'transparentModal' as const,
  animation: 'none' as const,
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    RethinkSans_700Bold,
    RethinkSans_700Bold_Italic,
  });

  useHideSplashWhenReady(fontsLoaded);

  if (!fontsLoaded) return null;

  return (
    <ShareIntentProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <ShareIntentRedirect />
            <SafeAreaProvider>
              <ToastProvider>
                <HtmlFetcherProvider>
                  <BottomSheetModalProvider>
                    <View style={{ flex: 1, backgroundColor: MiseColors.background }}>
                      <StatusBar style="dark" />
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="login" />
                        <Stack.Screen name="register" />
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
                        <Stack.Screen name="plan-options" options={modalScreenOptions} />
                        <Stack.Screen name="invite" options={modalScreenOptions} />
                        <Stack.Screen name="add-shopping-item" options={modalScreenOptions} />
                        <Stack.Screen name="shopping-category-settings" options={modalScreenOptions} />
                        <Stack.Screen name="select-household" options={modalScreenOptions} />
                        <Stack.Screen name="edit-account" options={{ animation: 'slide_from_right' }} />
                      </Stack>
                      <Toast />
                      <HtmlFetcherWebView />
                    </View>
                  </BottomSheetModalProvider>
                </HtmlFetcherProvider>
              </ToastProvider>
            </SafeAreaProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </GestureHandlerRootView>
    </ShareIntentProvider>
  );
}
