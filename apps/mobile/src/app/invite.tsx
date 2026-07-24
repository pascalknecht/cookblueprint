import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/mise/button';
import { Sheet } from '@/components/mise/sheet';
import { MiseSwitch } from '@/components/mise/switch';
import { TextField } from '@/components/mise/text-field';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { organization } from '@/lib/auth-client';
import { useToast } from '@/store/toast';

export default function InviteScreen() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [canEdit, setCanEdit] = useState(true);

  const inviteMutation = useMutation({
    mutationFn: async (input: { email: string; role: 'admin' | 'member' }) => {
      const { data, error } = await organization.inviteMember(input);
      if (error) throw new Error(error.message ?? 'Could not send invite');
      return data;
    },
    onSuccess: () => {
      showToast('Invitation sent');
      router.back();
    },
    onError: (error) => showToast(error.message),
  });

  function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) return;
    inviteMutation.mutate({ email: trimmed, role: canEdit ? 'admin' : 'member' });
  }

  return (
    <Sheet onDismiss={() => router.back()}>
      <Text style={styles.title}>Invite to workspace</Text>
      <Text style={styles.subtitle}>
        They&apos;ll get access to shared recipes, the meal plan and the shopping list.
      </Text>

      <TextField
        value={email}
        onChangeText={setEmail}
        placeholder="name@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        icon={<Ionicons name="mail" size={16} color={MiseColors.mutedLight} />}
        containerStyle={styles.field}
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Can edit everything</Text>
        <MiseSwitch value={canEdit} onValueChange={setCanEdit} />
      </View>

      <Button label="Send invite" onPress={handleSend} loading={inviteMutation.isPending} />
      <Text style={styles.footer}>
        or share an <Text style={styles.footerLink}>invite link</Text>
      </Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: MiseFonts.display, fontSize: 25, color: MiseColors.ink, marginBottom: 4 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 14, lineHeight: 20, color: MiseColors.muted, marginBottom: 18 },
  field: { marginBottom: 12 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  toggleLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 14, color: MiseColors.ink },
  footer: { textAlign: 'center', marginTop: 14, color: MiseColors.muted, fontFamily: MiseFonts.body, fontSize: 13 },
  footerLink: { color: MiseColors.brand, fontFamily: MiseFonts.bodyBold },
});
