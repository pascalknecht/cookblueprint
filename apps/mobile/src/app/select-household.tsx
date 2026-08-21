import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import { BottomSheetView, Sheet } from '@/components/mise/sheet';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { organization, useActiveOrganization, useListOrganizations } from '@/lib/auth-client';
import { useToast } from '@/store/toast';

export default function SelectHouseholdScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: organizations } = useListOrganizations();
  const { data: activeOrganization } = useActiveOrganization();

  const setActiveMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const { error } = await organization.setActive({ organizationId });
      if (error) throw new Error(error.message ?? t('selectHousehold.error'));
    },
    onSuccess: () => {
      // Every fetched query (recipes, meal plan, shopping list, members) is
      // scoped to the active household server-side, so the whole cache is
      // stale the moment it changes.
      queryClient.invalidateQueries();
      router.back();
    },
    onError: (error) => showToast(error.message),
  });

  return (
    <Sheet onDismiss={() => router.back()}>
      <BottomSheetView>
      <Text style={styles.title}>{t('selectHousehold.title')}</Text>
      {(organizations ?? []).map((org) => {
        const active = org.id === activeOrganization?.id;
        return (
          <Pressable
            key={org.id}
            testID={`household-option-${org.id}`}
            style={styles.row}
            disabled={setActiveMutation.isPending}
            onPress={() => setActiveMutation.mutate(org.id)}>
            <Text style={styles.rowLabel} numberOfLines={1}>
              {org.name}
            </Text>
            {active ? <Ionicons name="checkmark" size={18} color={MiseColors.brand} /> : null}
          </Pressable>
        );
      })}
      </BottomSheetView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 25, color: MiseColors.ink, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.lg,
    padding: 15,
    marginBottom: 10,
  },
  rowLabel: { flex: 1, minWidth: 0, fontFamily: MiseFonts.bodySemiBold, fontSize: 15, color: MiseColors.ink },
});
