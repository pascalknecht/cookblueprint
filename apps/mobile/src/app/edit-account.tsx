import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/mise/back-header';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useDeleteAccount } from '@/hooks/use-account';
import { signOut } from '@/lib/auth-client';
import { useToast } from '@/store/toast';

export default function EditAccountScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const deleteAccountMutation = useDeleteAccount();

  function handleDeleteAccount() {
    Alert.alert(t('editAccount.deleteAccountConfirmTitle'), t('editAccount.deleteAccountConfirmBody'), [
      { text: t('editAccount.deleteAccountConfirmCancel'), style: 'cancel' },
      {
        text: t('editAccount.deleteAccountConfirmDelete'),
        style: 'destructive',
        onPress: () => {
          deleteAccountMutation.mutate(undefined, {
            onSuccess: async () => {
              await signOut();
              router.replace('/');
            },
            onError: () => showToast(t('editAccount.deleteAccountError')),
          });
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BackHeader title={t('editAccount.title')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <Text style={styles.sectionTitle}>{t('editAccount.dangerZone')}</Text>
        <Pressable
          testID="delete-account-button"
          style={styles.dangerCard}
          onPress={handleDeleteAccount}
          disabled={deleteAccountMutation.isPending}>
          <Text style={styles.dangerLabel}>
            {deleteAccountMutation.isPending ? t('editAccount.deletingAccount') : t('editAccount.deleteAccount')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 26 },
  sectionTitle: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 20, color: MiseColors.ink, marginBottom: 10 },
  dangerCard: {
    backgroundColor: MiseColors.tint,
    borderWidth: 1,
    borderColor: MiseColors.borderTint,
    borderRadius: MiseRadius.lg,
    padding: 15,
    alignItems: 'center',
  },
  dangerLabel: { fontFamily: MiseFonts.bodyBold, fontSize: 14.5, color: MiseColors.brand },
});
