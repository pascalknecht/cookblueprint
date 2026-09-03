import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { BackHeader } from '@/components/mise/back-header';
import { Button } from '@/components/mise/button';
import { TextField } from '@/components/mise/text-field';
import { ALL_RECIPE_FREQUENCIES, DEFAULT_RECIPE_FREQUENCY, type RecipeFrequency } from '@/constants/recipe-frequency';
import { RECIPE_MEAL_TYPES, type RecipeMealType } from '@/constants/recipe-meal-types';
import { MiseColors, MiseFonts, MiseRadius, RecipeAccentColors } from '@/constants/theme';
import { useCreateRecipe } from '@/hooks/use-recipes';
import { useReducedMotionFlag, colorTransition } from '@/lib/motion';
import { useToast } from '@/store/toast';

export default function ManualScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const createRecipeMutation = useCreateRecipe();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [servings, setServings] = useState('');
  const [ing, setIng] = useState('');
  const [frequency, setFrequency] = useState<RecipeFrequency>(DEFAULT_RECIPE_FREQUENCY);
  const [mealTypes, setMealTypes] = useState<RecipeMealType[]>([]);
  const reduced = useReducedMotionFlag();

  function toggleMealType(mealType: RecipeMealType) {
    setMealTypes((current) =>
      current.includes(mealType) ? current.filter((m) => m !== mealType) : [...current, mealType],
    );
  }

  function handleSave() {
    const ingredients = ing
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((n) => ({ n, q: '', cat: 'Pantry' }));

    createRecipeMutation.mutate(
      {
        title: title || t('manualRecipe.defaultTitle'),
        color: RecipeAccentColors[5],
        frequency,
        time: Number(time) || 20,
        servings: Number(servings) || 2,
        kcal: '—',
        mealTypes,
        ingredients: ingredients.length ? ingredients : [{ n: t('manualRecipe.defaultIngredient'), q: '', cat: 'Pantry' }],
        steps: [t('manualRecipe.defaultStep')],
      },
      {
        onSuccess: () => {
          showToast(t('manualRecipe.addedToast'));
          router.replace('/recipes');
        },
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BackHeader title={t('manualRecipe.title')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.photoBox}>
        <Ionicons name="camera-outline" size={26} color={MiseColors.mutedLight} />
        <Text style={styles.photoLabel}>{t('manualRecipe.addPhoto')}</Text>
      </View>

      <TextField
        testID="manual-title-input"
        label={t('manualRecipe.titleLabel')}
        value={title}
        onChangeText={setTitle}
        placeholder={t('manualRecipe.titlePlaceholder')}
        containerStyle={styles.field}
      />

      <View style={styles.row}>
        <TextField
          label={t('manualRecipe.timeLabel')}
          value={time}
          onChangeText={setTime}
          placeholder={t('manualRecipe.timePlaceholder')}
          keyboardType="number-pad"
          containerStyle={styles.rowField}
        />
        <TextField
          label={t('manualRecipe.servesLabel')}
          value={servings}
          onChangeText={setServings}
          placeholder={t('manualRecipe.servesPlaceholder')}
          keyboardType="number-pad"
          containerStyle={styles.rowField}
        />
      </View>

      <TextField
        testID="manual-ingredients-input"
        label={t('manualRecipe.ingredientsLabel')}
        value={ing}
        onChangeText={setIng}
        placeholder={t('manualRecipe.ingredientsPlaceholder')}
        multiline
        containerStyle={styles.field}
      />

      <Text style={styles.frequencyLabel}>{t('manualRecipe.mealTypesQuestion')}</Text>
      <View style={styles.frequencyChips}>
        {RECIPE_MEAL_TYPES.map((option) => {
          const active = mealTypes.includes(option);
          return (
            <AnimatedPressable
              key={option}
              onPress={() => toggleMealType(option)}
              style={[styles.frequencyChip, active && styles.frequencyChipActive, colorTransition(reduced)]}>
              <Text style={[styles.frequencyChipLabel, active && styles.frequencyChipLabelActive]}>
                {t(`recipeMealTypes.${option}`)}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      <Text style={styles.frequencyLabel}>{t('manualRecipe.frequencyQuestion')}</Text>
      <View style={styles.frequencyChips}>
        {ALL_RECIPE_FREQUENCIES.map((option) => {
          const active = option === frequency;
          return (
            <AnimatedPressable
              key={option}
              onPress={() => setFrequency(option)}
              style={[styles.frequencyChip, active && styles.frequencyChipActive, colorTransition(reduced)]}>
              <Text style={[styles.frequencyChipLabel, active && styles.frequencyChipLabelActive]}>
                {t(`recipeFrequency.${option}`)}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      <Button
        testID="manual-save-button"
        label={t('manualRecipe.saveRecipe')}
        onPress={handleSave}
        loading={createRecipeMutation.isPending}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 26 },
  photoBox: {
    height: 130,
    borderWidth: 1.5,
    borderColor: '#D8CDBE',
    borderStyle: 'dashed',
    borderRadius: MiseRadius.lg,
    backgroundColor: MiseColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 18,
  },
  photoLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.mutedLight },
  field: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  rowField: { flex: 1 },
  frequencyLabel: {
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 13,
    color: MiseColors.inkSoft,
    marginBottom: 8,
  },
  frequencyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  frequencyChip: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  frequencyChipActive: { backgroundColor: MiseColors.near, borderColor: MiseColors.near },
  frequencyChipLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.inkSoft },
  frequencyChipLabelActive: { color: '#fff' },
});
