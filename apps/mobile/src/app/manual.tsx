import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { TextField } from '@/components/mise/text-field';
import { ALL_RECIPE_FREQUENCIES, DEFAULT_RECIPE_FREQUENCY, type RecipeFrequency } from '@/constants/recipe-frequency';
import { BackIconName, MiseColors, MiseFonts, MiseRadius, RecipeAccentColors } from '@/constants/theme';
import { useCreateRecipe } from '@/hooks/use-recipes';
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
        tags: [t('manualRecipe.defaultTag')],
        ingredients: ingredients.length ? ingredients : [{ n: t('manualRecipe.defaultIngredient'), q: '', cat: 'Pantry' }],
        steps: [t('manualRecipe.defaultStep')],
      },
      {
        onSuccess: () => {
          showToast(t('manualRecipe.addedToast'));
          router.replace('/(tabs)/recipes');
        },
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 40 }]}>
      <IconButton name={BackIconName} onPress={() => router.back()} style={styles.back} />
      <Text style={styles.title}>{t('manualRecipe.title')}</Text>

      <View style={styles.photoBox}>
        <Ionicons name="camera-outline" size={26} color={MiseColors.mutedLight} />
        <Text style={styles.photoLabel}>{t('manualRecipe.addPhoto')}</Text>
      </View>

      <TextField
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
        label={t('manualRecipe.ingredientsLabel')}
        value={ing}
        onChangeText={setIng}
        placeholder={t('manualRecipe.ingredientsPlaceholder')}
        multiline
        containerStyle={styles.field}
      />

      <Text style={styles.frequencyLabel}>{t('manualRecipe.frequencyQuestion')}</Text>
      <View style={styles.frequencyChips}>
        {ALL_RECIPE_FREQUENCIES.map((option) => {
          const active = option === frequency;
          return (
            <Pressable
              key={option}
              onPress={() => setFrequency(option)}
              style={[styles.frequencyChip, active && styles.frequencyChipActive]}>
              <Text style={[styles.frequencyChipLabel, active && styles.frequencyChipLabelActive]}>
                {t(`recipeFrequency.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button label={t('manualRecipe.saveRecipe')} onPress={handleSave} loading={createRecipeMutation.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22 },
  back: { marginBottom: 20 },
  title: { fontFamily: MiseFonts.display, fontSize: 30, color: MiseColors.ink, marginBottom: 22 },
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
