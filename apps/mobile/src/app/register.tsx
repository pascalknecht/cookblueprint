import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { TextField } from '@/components/mise/text-field';
import { BackIconName, MiseColors, MiseFonts } from '@/constants/theme';
import { signUp } from '@/lib/auth-client';
import { useToast } from '@/store/toast';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (input: { name: string; email: string; password: string }) => {
      const { data, error } = await signUp.email(input);
      if (error) throw new Error(error.message ?? 'Could not create account');
      return data;
    },
    onSuccess: () => setSubmitted(true),
    onError: (error) => showToast(error.message),
  });

  function handleRegister() {
    const trimmedName = name.trim();
    if (!trimmedName || !email.trim() || !password) return;
    registerMutation.mutate({ name: trimmedName, email: email.trim(), password });
  }

  if (submitted) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          styles.confirmContent,
          { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 24 },
        ]}>
        <Text style={[styles.title, styles.centerText]}>Check your email</Text>
        <Text style={[styles.subtitle, styles.centerText]}>
          We sent a verification link to your email. Click it to confirm your account, then log in.
        </Text>
        <Button label="Back to login" onPress={() => router.replace('/login')} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 24 }]}>
      <IconButton name={BackIconName} onPress={() => router.back()} style={styles.back} />

      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Start saving recipes in seconds.</Text>

      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Alex Morgan"
        containerStyle={styles.field}
      />
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
        placeholder="Create a password"
        secureTextEntry
        containerStyle={styles.fieldLast}
      />

      <Button label="Create account" onPress={handleRegister} loading={registerMutation.isPending} />
      <Text style={styles.legal}>By continuing you agree to our Terms &amp; Privacy Policy.</Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Have an account? </Text>
        <Text style={styles.footerLink} onPress={() => router.replace('/login')}>
          Log In
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22 },
  confirmContent: { justifyContent: 'center', alignItems: 'center', gap: 16 },
  centerText: { textAlign: 'center' },
  back: { marginBottom: 22 },
  title: { fontFamily: MiseFonts.display, fontSize: 34, lineHeight: 36, color: MiseColors.ink, marginBottom: 6 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 15, color: MiseColors.muted, marginBottom: 26 },
  field: { marginBottom: 16 },
  fieldLast: { marginBottom: 22 },
  legal: {
    textAlign: 'center',
    color: MiseColors.mutedLight,
    fontFamily: MiseFonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 20 },
  footerText: { color: MiseColors.muted, fontFamily: MiseFonts.body, fontSize: 14 },
  footerLink: { color: MiseColors.brand, fontFamily: MiseFonts.bodyBold, fontSize: 14 },
});
