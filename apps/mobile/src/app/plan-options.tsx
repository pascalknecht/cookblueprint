import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/mise/button';
import { Sheet } from '@/components/mise/sheet';
import { MiseSpinner } from '@/components/mise/spinner';
import { MiseSwitch } from '@/components/mise/switch';
import { ALL_MEAL_TYPES, type MealType } from '@/constants/meal-types';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useGenerateMealPlan } from '@/hooks/use-meal-plan';
import { useEnabledMealTypes, useUpdateEnabledMealTypes } from '@/hooks/use-organization-settings';
import { fromISODate, getCurrentWeekDates } from '@/lib/date-utils';
import { useToast } from '@/store/toast';

export default function PlanOptionsScreen() {
  const { t } = useTranslation();
  const { startDate: startDateParam, endDate: endDateParam } = useLocalSearchParams<{
    startDate?: string;
    endDate?: string;
  }>();
  const generateMutation = useGenerateMealPlan();
  const { showToast } = useToast();
  const [avoidRepeats, setAvoidRepeats] = useState(true);
  const planGenerating = generateMutation.isPending;

  const enabledMealTypes = useEnabledMealTypes();
  const updateEnabledMealTypesMutation = useUpdateEnabledMealTypes();

  function toggleMealType(type: MealType) {
    const isEnabled = enabledMealTypes.includes(type);
    if (isEnabled && enabledMealTypes.length === 1) {
      showToast(t('planOptions.keepOneMeal'));
      return;
    }
    const next = isEnabled ? enabledMealTypes.filter((t) => t !== type) : [...enabledMealTypes, type];
    updateEnabledMealTypesMutation.mutate(next, { onError: (error) => showToast(error.message) });
  }

  function handleGenerate() {
    const [startDate, endDate] =
      startDateParam && endDateParam
        ? [fromISODate(startDateParam), fromISODate(endDateParam)]
        : (() => {
            const weekDates = getCurrentWeekDates();
            return [weekDates[0], weekDates[weekDates.length - 1]];
          })();
    generateMutation.mutate(
      { startDate, endDate, avoidRepeats },
      {
        onSuccess: () => router.back(),
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <Sheet onDismiss={() => (!planGenerating ? router.back() : undefined)}>
      {planGenerating ? (
        <View style={styles.generating}>
          <MiseSpinner size={56} />
          <Text style={styles.generatingTitle}>{t('planOptions.generatingTitle')}</Text>
          <Text style={styles.generatingSubtitle}>{t('planOptions.generatingSubtitle')}</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>{t('planOptions.title')}</Text>
          <Text style={styles.subtitle}>{t('planOptions.subtitle')}</Text>

          <View style={styles.options}>
            <View style={styles.mealTypesCard}>
              <View style={styles.optionLabel}>
                <Text style={styles.optionEmoji}>🍽</Text>
                <Text style={styles.optionText}>{t('planOptions.mealsPerDay')}</Text>
              </View>
              <View style={styles.mealChips}>
                {ALL_MEAL_TYPES.map((type) => {
                  const active = enabledMealTypes.includes(type);
                  return (
                    <Pressable
                      key={type}
                      onPress={() => toggleMealType(type)}
                      style={[styles.mealChip, active && styles.mealChipActive]}>
                      <Text style={[styles.mealChipLabel, active && styles.mealChipLabelActive]}>
                        {t(`mealTypes.${type}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.option}>
              <View style={styles.optionLabel}>
                <Text style={styles.optionEmoji}>♻️</Text>
                <Text style={styles.optionText}>{t('planOptions.avoidRepeats')}</Text>
              </View>
              <MiseSwitch value={avoidRepeats} onValueChange={setAvoidRepeats} />
            </View>
          </View>

          <Button label={t('planOptions.generate')} variant="gradient" onPress={handleGenerate} />
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: MiseFonts.display, fontSize: 25, color: MiseColors.ink, marginBottom: 4 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 14, lineHeight: 20, color: MiseColors.muted, marginBottom: 18 },
  options: { gap: 11, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  mealTypesCard: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionLabel: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  optionEmoji: { fontSize: 17 },
  optionText: { fontFamily: MiseFonts.bodySemiBold, fontSize: 14.5, color: MiseColors.ink },
  mealChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  mealChip: {
    backgroundColor: MiseColors.background,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  mealChipActive: { backgroundColor: MiseColors.near, borderColor: MiseColors.near },
  mealChipLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 12.5, color: MiseColors.inkSoft },
  mealChipLabelActive: { color: '#fff' },
  generating: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  generatingTitle: { fontFamily: MiseFonts.display, fontSize: 22, color: MiseColors.ink, marginTop: 22, marginBottom: 6 },
  generatingSubtitle: { fontFamily: MiseFonts.body, fontSize: 14, color: MiseColors.muted },
});
