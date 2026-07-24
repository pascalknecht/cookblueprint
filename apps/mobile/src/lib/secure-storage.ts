import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// expo-secure-store has no web implementation; better-auth's Expo client
// plugin doesn't touch storage on web at all (it uses real browser cookies
// there), but it still requires a storage object matching this shape.
export const secureStorage = {
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    SecureStore.setItem(key, value);
  },
  getItem: (key: string): string | null => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItem(key);
  },
};
