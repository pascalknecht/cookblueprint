import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { BackHeader } from '@/components/mise/back-header';
import { Button } from '@/components/mise/button';
import { PhotoPlaceholder } from '@/components/mise/photo-placeholder';
import { MiseSpinner } from '@/components/mise/spinner';
import { TextField } from '@/components/mise/text-field';
import { ALL_RECIPE_FREQUENCIES, type RecipeFrequency } from '@/constants/recipe-frequency';
import { RECIPE_MEAL_TYPES, type RecipeMealType } from '@/constants/recipe-meal-types';
import {
  SHOPPING_CATEGORIES,
  SHOPPING_CATEGORY_COLOR,
  SHOPPING_CATEGORY_ICON,
  type ShoppingCategory,
} from '@/constants/shopping-categories';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useRecipe, useUpdateRecipe, useUploadRecipeImage, type Ingredient, type Recipe } from '@/hooks/use-recipes';
import { useReducedMotionFlag, colorTransition } from '@/lib/motion';
import { useToast } from '@/store/toast';

function categoryOf(cat: string): ShoppingCategory {
  return (cat as ShoppingCategory) in SHOPPING_CATEGORY_COLOR ? (cat as ShoppingCategory) : 'Pantry';
}

function nextCategory(cat: ShoppingCategory): ShoppingCategory {
  const index = SHOPPING_CATEGORIES.indexOf(cat);
  return SHOPPING_CATEGORIES[(index + 1) % SHOPPING_CATEGORIES.length];
}

type IngredientRow = Ingredient & { key: string };
type StepRow = { key: string; text: string };

export default function EditRecipeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipe, isPending, isError } = useRecipe(id);

  if (isPending) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <MiseSpinner size={40} />
      </View>
    );
  }

  if (isError || !recipe) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <Text style={styles.errorText}>{t('recipeDetail.notFound')}</Text>
        <Button label={t('recipeDetail.goBack')} onPress={() => router.back()} />
      </View>
    );
  }

  return <EditRecipeForm recipe={recipe} insetsBottom={insets.bottom} />;
}

function EditRecipeForm({
  recipe,
  insetsBottom,
}: {
  recipe: Recipe;
  insetsBottom: number;
}) {
  const { t } = useTranslation();
  const updateRecipeMutation = useUpdateRecipe();
  const uploadImageMutation = useUploadRecipeImage();
  const { showToast } = useToast();
  const reduced = useReducedMotionFlag();
  const nextKey = useRef(0);

  const [imageUrl, setImageUrl] = useState(recipe.imageUrl ?? null);
  const [title, setTitle] = useState(recipe.title);
  const [time, setTime] = useState(String(recipe.time));
  const [servings, setServings] = useState(String(recipe.servings));
  const [kcal, setKcal] = useState(recipe.kcal);
  const [mealTypes, setMealTypes] = useState<RecipeMealType[]>(recipe.mealTypes);
  const [frequency, setFrequency] = useState<RecipeFrequency>(recipe.frequency);
  const [ingredients, setIngredients] = useState<IngredientRow[]>(() =>
    recipe.ingredients.map((ing, index) => ({ key: `init-${index}`, ...ing })),
  );
  const [steps, setSteps] = useState<StepRow[]>(() =>
    recipe.steps.map((text, index) => ({ key: `init-${index}`, text })),
  );

  function updateIngredient(key: string, patch: Partial<Ingredient>) {
    setIngredients((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeIngredient(key: string) {
    setIngredients((rows) => rows.filter((row) => row.key !== key));
  }

  function addIngredient() {
    setIngredients((rows) => [...rows, { key: `new-${nextKey.current++}`, n: '', q: '', cat: 'Pantry' }]);
  }

  function updateStep(key: string, text: string) {
    setSteps((rows) => rows.map((row) => (row.key === key ? { ...row, text } : row)));
  }

  function removeStep(key: string) {
    setSteps((rows) => rows.filter((row) => row.key !== key));
  }

  function addStep() {
    setSteps((rows) => [...rows, { key: `new-${nextKey.current++}`, text: '' }]);
  }

  function toggleMealType(mealType: RecipeMealType) {
    setMealTypes((current) =>
      current.includes(mealType) ? current.filter((m) => m !== mealType) : [...current, mealType],
    );
  }

  function applyImageResult(result: ImagePicker.ImagePickerResult) {
    if (result.canceled) return;

    const asset = result.assets[0];
    uploadImageMutation.mutate(
      { uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType },
      {
        onSuccess: (url) => setImageUrl(url),
        onError: (error) => showToast(error.message),
      },
    );
  }

  async function handleChooseFromLibrary() {
    // launchImageLibraryAsync handles permissions itself — on Android 13+ it
    // uses the system Photo Picker, which needs no runtime permission at all,
    // so pre-checking requestMediaLibraryPermissionsAsync would wrongly deny
    // access on OSes that never needed it in the first place.
    try {
      applyImageResult(
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        }),
      );
    } catch {
      showToast(t('editRecipe.photoPermissionDenied'));
    }
  }

  async function handleTakePhoto() {
    try {
      applyImageResult(
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        }),
      );
    } catch {
      showToast(t('editRecipe.cameraPermissionDenied'));
    }
  }

  function handlePickImage() {
    Alert.alert(t('editRecipe.photoSourceTitle'), undefined, [
      { text: t('editRecipe.photoSourceCancel'), style: 'cancel' },
      { text: t('editRecipe.photoSourceChooseLibrary'), onPress: handleChooseFromLibrary },
      { text: t('editRecipe.photoSourceTakePhoto'), onPress: handleTakePhoto },
    ]);
  }

  function handleSave() {
    if (!title.trim()) return;

    updateRecipeMutation.mutate(
      {
        id: recipe.id,
        input: {
          title: title.trim(),
          color: recipe.color,
          imageUrl,
          frequency,
          time: Number(time) || 0,
          servings: Number(servings) || 1,
          kcal: kcal.trim() || recipe.kcal,
          mealTypes,
          ingredients: ingredients
            .filter((row) => row.n.trim())
            .map((row) => ({ n: row.n.trim(), q: row.q.trim(), cat: row.cat })),
          steps: steps.map((row) => row.text.trim()).filter(Boolean),
        },
      },
      {
        onSuccess: () => {
          showToast(t('editRecipe.savedToast'));
          router.back();
        },
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BackHeader title={t('editRecipe.title')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insetsBottom + 40 }]}>
      <Pressable onPress={handlePickImage} disabled={uploadImageMutation.isPending} style={styles.photoField}>
        <PhotoPlaceholder color={recipe.color} style={styles.photo} source={imageUrl ? { uri: imageUrl } : undefined}>
          {uploadImageMutation.isPending ? (
            <View style={[StyleSheet.absoluteFill, styles.photoOverlay]}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <View style={styles.photoEditBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
              <Text style={styles.photoEditLabel}>{t('editRecipe.changePhoto')}</Text>
            </View>
          )}
        </PhotoPlaceholder>
      </Pressable>

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
        label={t('editRecipe.kcalLabel')}
        value={kcal}
        onChangeText={setKcal}
        placeholder={t('editRecipe.kcalPlaceholder')}
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

      <Text style={styles.sectionLabel}>{t('editRecipe.ingredientsLabel')}</Text>
      <View style={styles.ingredientRows}>
        {ingredients.map((row) => {
          const cat = categoryOf(row.cat);
          return (
            <View key={row.key} style={styles.ingredientRow}>
              <AnimatedPressable
                onPress={() => updateIngredient(row.key, { cat: nextCategory(cat) })}
                style={[
                  styles.categoryPill,
                  { backgroundColor: `${SHOPPING_CATEGORY_COLOR[cat]}22` },
                  colorTransition(reduced),
                ]}>
                <Ionicons name={SHOPPING_CATEGORY_ICON[cat]} size={16} color={SHOPPING_CATEGORY_COLOR[cat]} />
              </AnimatedPressable>
              <TextField
                value={row.n}
                onChangeText={(value) => updateIngredient(row.key, { n: value })}
                placeholder={t('editRecipe.ingredientNamePlaceholder')}
                containerStyle={styles.ingredientName}
              />
              <TextField
                value={row.q}
                onChangeText={(value) => updateIngredient(row.key, { q: value })}
                placeholder={t('editRecipe.ingredientQtyPlaceholder')}
                containerStyle={styles.ingredientQty}
              />
              <Pressable onPress={() => removeIngredient(row.key)} style={styles.removeButton} hitSlop={8}>
                <Ionicons name="close" size={16} color={MiseColors.mutedLight} />
              </Pressable>
            </View>
          );
        })}
      </View>
      <Pressable onPress={addIngredient} style={styles.addRow}>
        <Ionicons name="add" size={16} color={MiseColors.brand} />
        <Text style={styles.addRowLabel}>{t('editRecipe.addIngredient')}</Text>
      </Pressable>

      <Text style={[styles.sectionLabel, { marginTop: 22 }]}>{t('editRecipe.stepsLabel')}</Text>
      <View style={styles.stepRows}>
        {steps.map((row, index) => (
          <View key={row.key} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberLabel}>{index + 1}</Text>
            </View>
            <TextField
              value={row.text}
              onChangeText={(value) => updateStep(row.key, value)}
              placeholder={t('editRecipe.stepPlaceholder')}
              multiline
              containerStyle={styles.stepField}
            />
            <Pressable onPress={() => removeStep(row.key)} style={[styles.removeButton, styles.removeButtonStep]} hitSlop={8}>
              <Ionicons name="close" size={16} color={MiseColors.mutedLight} />
            </Pressable>
          </View>
        ))}
      </View>
      <Pressable onPress={addStep} style={styles.addRow}>
        <Ionicons name="add" size={16} color={MiseColors.brand} />
        <Text style={styles.addRowLabel}>{t('editRecipe.addStep')}</Text>
      </Pressable>

      <Button
        label={t('editRecipe.save')}
        onPress={handleSave}
        loading={updateRecipeMutation.isPending}
        disabled={!title.trim()}
        style={styles.save}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  loading: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontFamily: MiseFonts.body, fontSize: 15, color: MiseColors.muted },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 26 },
  photoField: { marginBottom: 18, borderRadius: MiseRadius.lg, overflow: 'hidden' },
  photo: { height: 160, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 10 },
  photoOverlay: {
    backgroundColor: 'rgba(20,17,24,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20,17,24,0.62)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  photoEditLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 12.5, color: '#fff' },
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
  sectionLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.inkSoft, marginBottom: 8 },
  ingredientRows: { gap: 8, marginBottom: 10 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryPill: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ingredientName: { flex: 2 },
  ingredientQty: { flex: 1 },
  removeButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  removeButtonStep: { marginTop: 12 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  addRowLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13.5, color: MiseColors.brand },
  stepRows: { gap: 10, marginBottom: 10 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: MiseColors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  stepNumberLabel: { color: MiseColors.brand, fontFamily: MiseFonts.bodyBold, fontSize: 13 },
  stepField: { flex: 1 },
  save: { marginTop: 26 },
});
