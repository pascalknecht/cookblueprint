import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { BottomSheetView, Sheet } from '@/components/mise/sheet';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useAssignMeal, type MealType } from '@/hooks/use-meal-plan';
import { useEnabledMealTypes } from '@/hooks/use-organization-settings';
import { usePressFeedback } from '@/hooks/usePressFeedback';
import { getCurrentWeekDates, isSameDate, toISODate, weekdayShort, dayOfMonth } from '@/lib/date-utils';
import { useReducedMotionFlag, colorTransition } from '@/lib/motion';
import { useToast } from '@/store/toast';

export default function AddToPlanScreen() {
  const { t, i18n } = useTranslation();
  const { recipeId, title } = useLocalSearchParams<{ recipeId: string; title?: string }>();
  const { showToast } = useToast();
  const assignMealMutation = useAssignMeal();
  const enabledMealTypes = useEnabledMealTypes();

  const weekDates = getCurrentWeekDates();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(() => weekDates.find((d) => isSameDate(d, today)) ?? weekDates[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(enabledMealTypes[0]);
  const reduced = useReducedMotionFlag();
  const confirmPress = usePressFeedback();

  function handleConfirm() {
    assignMealMutation.mutate(
      { date: selectedDate, mealType: selectedMeal, recipeId },
      {
        onSuccess: () => {
          showToast(t('addToPlan.addedToast'));
          router.back();
        },
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <Sheet onDismiss={() => router.back()}>
      <BottomSheetView>
        <Text style={styles.title}>{t('addToPlan.title')}</Text>
        {title ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {title}
          </Text>
        ) : null}

        <Text style={styles.sectionLabel}>{t('addToPlan.day')}</Text>
        <View style={styles.dayRow}>
          {weekDates.map((date) => {
            const active = isSameDate(date, selectedDate);
            return (
              <AnimatedPressable
                key={toISODate(date)}
                onPress={() => setSelectedDate(date)}
                style={[styles.dayChip, active && styles.dayChipActive, colorTransition(reduced)]}>
                <Text style={[styles.dayChipWeekday, active && styles.dayChipTextActive]}>
                  {weekdayShort(date, i18n.language)}
                </Text>
                <Text style={[styles.dayChipDate, active && styles.dayChipTextActive]}>{dayOfMonth(date)}</Text>
              </AnimatedPressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{t('addToPlan.meal')}</Text>
        <View style={styles.pillRow}>
          {enabledMealTypes.map((meal) => {
            const active = meal === selectedMeal;
            return (
              <AnimatedPressable
                key={meal}
                onPress={() => setSelectedMeal(meal)}
                style={[styles.pill, active && styles.pillActive, colorTransition(reduced)]}>
                <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{t(`mealTypes.${meal}`)}</Text>
              </AnimatedPressable>
            );
          })}
        </View>

        <AnimatedPressable
          onPress={handleConfirm}
          onPressIn={confirmPress.onPressIn}
          onPressOut={confirmPress.onPressOut}
          disabled={assignMealMutation.isPending}
          style={[
            styles.confirmButton,
            assignMealMutation.isPending && styles.confirmButtonDisabled,
            confirmPress.style,
          ]}>
          <Text style={styles.confirmButtonLabel}>{t('addToPlan.confirm')}</Text>
        </AnimatedPressable>
      </BottomSheetView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 25, color: MiseColors.ink, marginBottom: 4 },
  subtitle: { fontFamily: MiseFonts.bodyMedium, fontSize: 13, color: MiseColors.muted, marginBottom: 18 },
  sectionLabel: {
    fontFamily: MiseFonts.bodyExtraBold,
    fontSize: 10,
    letterSpacing: 1,
    color: MiseColors.mutedLight,
    marginBottom: 9,
  },
  dayRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: MiseRadius.md,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
    gap: 2,
  },
  dayChipActive: { backgroundColor: MiseColors.brand, borderColor: MiseColors.brand },
  dayChipWeekday: { fontFamily: MiseFonts.bodySemiBold, fontSize: 10.5, color: MiseColors.mutedLight },
  dayChipDate: { fontFamily: MiseFonts.bodyBold, fontSize: 15, color: MiseColors.ink },
  dayChipTextActive: { color: '#fff' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
  },
  pillActive: { backgroundColor: MiseColors.brand, borderColor: MiseColors.brand },
  pillLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.inkSoft },
  pillLabelActive: { color: '#fff' },
  confirmButton: {
    height: 56,
    borderRadius: MiseRadius.lg,
    backgroundColor: MiseColors.near,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: { opacity: 0.6 },
  confirmButtonLabel: { fontFamily: MiseFonts.bodyBold, fontSize: 16, color: '#fff' },
});
