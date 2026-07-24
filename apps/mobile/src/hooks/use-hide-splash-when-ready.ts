import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

/** Reusable custom hook syncing the native splash screen with async font loading. */
export function useHideSplashWhenReady(ready: boolean) {
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
}
