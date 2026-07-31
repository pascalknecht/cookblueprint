import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/mise/sheet';
import { type MealType } from '@/constants/meal-types';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useDeleteMealAssignment } from '@/hooks/use-meal-plan';
import { useToast } from '@/store/toast';

export default function EditMealScreen() {
  const { t } = useTranslation();
  const { date, meal, entryId, title, color } = useLocalSearchParams<{
    date: string;
    meal: MealType;
    entryId: string;
    title: string;
    color: string;
  }>();
  const deleteMutation = useDeleteMealAssignment();
  const { showToast } = useToast();

  function handleSwitch() {
    router.replace({ pathname: '/pick-recipe', params: { date, meal } });
  }

  function handleRemove() {
    deleteMutation.mutate(entryId, {
      onSuccess: () => {
        showToast(t('editMeal.removedToast'));
        router.back();
      },
      onError: (error) => showToast(error.message),
    });
  }

  return (
    <Sheet onDismiss={() => router.back()}>
      <View style={styles.header}>
        <View style={[styles.swatch, { backgroundColor: color }]} />
        <View style={styles.headerBody}>
          <Text style={styles.meal}>{t(`mealTypes.${meal}`)}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      <Pressable style={styles.action} onPress={handleSwitch}>
        <Ionicons name="swap-horizontal-outline" size={20} color={MiseColors.ink} />
        <Text style={styles.actionLabel}>{t('editMeal.switchRecipe')}</Text>
      </Pressable>

      <Pressable style={styles.action} onPress={handleRemove} disabled={deleteMutation.isPending}>
        <Ionicons name="trash-outline" size={20} color={MiseColors.brand} />
        <Text style={[styles.actionLabel, styles.destructiveLabel]}>{t('editMeal.removeFromPlan')}</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 18 },
  swatch: { width: 44, height: 44, borderRadius: 12 },
  headerBody: { flex: 1, minWidth: 0 },
  meal: {
    fontFamily: MiseFonts.bodyBold,
    fontSize: 10,
    color: MiseColors.mutedLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: { fontFamily: MiseFonts.display, fontSize: 20, color: MiseColors.ink },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    padding: 14,
    marginBottom: 10,
  },
  actionLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 15, color: MiseColors.ink },
  destructiveLabel: { color: MiseColors.brand },
});
