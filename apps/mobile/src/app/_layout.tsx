import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '@/components/mise/toast';
import { MiseColors } from '@/constants/theme';
import { useHideSplashWhenReady } from '@/hooks/use-hide-splash-when-ready';
import { ToastProvider } from '@/store/toast';

SplashScreen.preventAutoHideAsync();

const modalScreenOptions = {
  presentation: 'transparentModal' as const,
  animation: 'slide_from_bottom' as const,
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
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });

  useHideSplashWhenReady(fontsLoaded);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ToastProvider>
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
                <Stack.Screen name="add-recipe-sheet" options={modalScreenOptions} />
                <Stack.Screen name="share-sheet" options={modalScreenOptions} />
                <Stack.Screen name="pick-recipe" options={modalScreenOptions} />
                <Stack.Screen name="plan-options" options={modalScreenOptions} />
                <Stack.Screen name="invite" options={modalScreenOptions} />
              </Stack>
              <Toast />
            </View>
          </ToastProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
