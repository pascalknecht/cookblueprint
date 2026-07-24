import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { TextField } from '@/components/mise/text-field';
import { BackIconName, MiseColors, MiseFonts } from '@/constants/theme';
import { signIn } from '@/lib/auth-client';
import { useToast } from '@/store/toast';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data, error } = await signIn.email(input);
      if (error) throw new Error(error.message ?? 'Could not log in');
      return data;
    },
    onSuccess: () => router.replace('/(tabs)/recipes'),
    onError: (error) => {
      if (error.message === 'Email not verified') {
        showToast('Check your email to verify your account — we just sent a new link.');
        return;
      }
      showToast(error.message);
    },
  });

  function handleLogin() {
    if (!email.trim() || !password) return;
    loginMutation.mutate({ email: email.trim(), password });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 24 }]}>
      <IconButton name={BackIconName} onPress={() => router.back()} style={styles.back} />

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to your kitchen.</Text>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={styles.field}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        containerStyle={styles.fieldTight}
      />
      <Text style={styles.forgot} onPress={() => router.push('/forgot-password')}>
        Forgot password?
      </Text>

      <Button label="Log In" onPress={handleLogin} loading={loginMutation.isPending} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>New here? </Text>
        <Text style={styles.footerLink} onPress={() => router.replace('/register')}>
          Create account
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22 },
  back: { marginBottom: 22 },
  title: { fontFamily: MiseFonts.display, fontSize: 34, lineHeight: 36, color: MiseColors.ink, marginBottom: 6 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 15, color: MiseColors.muted, marginBottom: 26 },
  field: { marginBottom: 16 },
  fieldTight: { marginBottom: 10 },
  forgot: {
    alignSelf: 'flex-end',
    color: MiseColors.brand,
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 13.5,
    marginBottom: 22,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 28 },
  footerText: { color: MiseColors.muted, fontFamily: MiseFonts.body, fontSize: 14 },
  footerLink: { color: MiseColors.brand, fontFamily: MiseFonts.bodyBold, fontSize: 14 },
});
