import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { PhotoPlaceholder } from '@/components/mise/photo-placeholder';
import { MiseSpinner } from '@/components/mise/spinner';
import { TextField } from '@/components/mise/text-field';
import { BackIconName, MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useCreateRecipe, type RecipeInput } from '@/hooks/use-recipes';
import { useMountEffect } from '@/hooks/use-mount-effect';
import { useToast } from '@/store/toast';

type Stage = 'input' | 'parsing' | 'done';

function importedRecipePreview(): RecipeInput {
  return {
    title: 'One-Pan Lemon Herb Chicken',
    color: '#D98324',
    frequency: 'weekly',
    time: 35,
    servings: 4,
    kcal: '530',
    tags: ['Dinner', 'Imported'],
    ingredients: [
      { n: 'Chicken breast', q: '4', cat: 'Meat & Fish' },
      { n: 'Baby potatoes', q: '500 g', cat: 'Produce' },
      { n: 'Lemon', q: '2', cat: 'Produce' },
      { n: 'Rosemary', q: '3 sprigs', cat: 'Produce' },
      { n: 'Garlic', q: '4 cloves', cat: 'Produce' },
      { n: 'Olive oil', q: '3 tbsp', cat: 'Pantry' },
    ],
    steps: [
      'Toss potatoes with oil and half the lemon.',
      'Nestle chicken among the potatoes.',
      'Add garlic, rosemary and lemon slices.',
      'Roast 35 min at 200°C until golden.',
    ],
  };
}

export default function ImportScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const createRecipeMutation = useCreateRecipe();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ url?: string; autostart?: string }>();
  const [url, setUrl] = useState(params.url ?? '');
  const [stage, setStage] = useState<Stage>(params.autostart === '1' ? 'parsing' : 'input');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const preview = useMemo(() => importedRecipePreview(), []);

  function startParsing() {
    setStage('parsing');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStage('done'), 2400);
  }

  useMountEffect(() => {
    if (params.autostart === '1') startParsing();
    return () => clearTimeout(timer.current);
  });

  function handleImport() {
    if (!url.trim()) return;
    startParsing();
  }

  function handleSave() {
    createRecipeMutation.mutate(preview, {
      onSuccess: () => {
        showToast(t('importRecipe.savedToast'));
        router.replace('/(tabs)/recipes');
      },
      onError: (error) => showToast(error.message),
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 40 }]}>
      <IconButton name={BackIconName} onPress={() => router.back()} style={styles.back} />

      {stage === 'input' ? (
        <View>
          <Text style={styles.title}>{t('importRecipe.title')}</Text>
          <Text style={styles.subtitle}>{t('importRecipe.subtitle')}</Text>
          <TextField
            value={url}
            onChangeText={setUrl}
            placeholder={t('importRecipe.urlPlaceholder')}
            autoCapitalize="none"
            icon={<Ionicons name="link" size={16} color={MiseColors.mutedLight} />}
            containerStyle={styles.field}
          />
          <Button label={t('importRecipe.importButton')} onPress={handleImport} />

          <View style={styles.tip}>
            <Text style={styles.tipTitle}>{t('importRecipe.tipTitle')}</Text>
            <Text style={styles.tipBody}>
              {t('importRecipe.tipBodyPrefix')}
              <Text style={{ fontFamily: MiseFonts.bodyBold }}>{t('importRecipe.tipBodyBold')}</Text>
              {t('importRecipe.tipBodySuffix')}
            </Text>
            <Button
              label={t('importRecipe.tryShareSheet')}
              variant="secondary"
              compact
              onPress={() => router.push('/share-sheet')}
              style={styles.tipButton}
            />
          </View>
        </View>
      ) : null}

      {stage === 'parsing' ? (
        <View style={styles.parsing}>
          <MiseSpinner size={64} />
          <Text style={styles.parsingTitle}>{t('importRecipe.parsingTitle')}</Text>
          <Text style={styles.parsingSubtitle}>{t('importRecipe.parsingSubtitle')}</Text>
          <View style={styles.checklist}>
            <ChecklistItem label={t('importRecipe.checklistTitle')} done />
            <ChecklistItem label={t('importRecipe.checklistIngredients')} done />
            <ChecklistItem label={t('importRecipe.checklistSteps')} done={false} />
          </View>
        </View>
      ) : null}

      {stage === 'done' ? (
        <View>
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color={MiseColors.success} />
            <Text style={styles.successLabel}>{t('importRecipe.successLabel')}</Text>
          </View>
          <View style={styles.previewCard}>
            <PhotoPlaceholder color={MiseColors.amber} style={styles.previewPhoto}>
              <Text style={styles.previewSource}>{t('importRecipe.previewSource')}</Text>
            </PhotoPlaceholder>
            <View style={styles.previewBody}>
              <Text style={styles.previewTitle}>{preview.title}</Text>
              <Text style={styles.previewMeta}>
                {t('importRecipe.previewMeta', { time: preview.time, servings: preview.servings, kcal: preview.kcal })}
              </Text>
            </View>
            <View style={styles.previewIngredients}>
              {preview.ingredients.map((ing, index) => (
                <View
                  key={ing.n}
                  style={[styles.previewRow, index < preview.ingredients.length - 1 && styles.previewRowDivider]}>
                  <View style={styles.previewDot} />
                  <Text style={styles.previewIngName}>{ing.n}</Text>
                  <Text style={styles.previewIngQty}>{ing.q}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.doneActions}>
            <Button label={t('importRecipe.redo')} variant="secondary" compact onPress={() => setStage('input')} />
            <Button
              label={t('importRecipe.saveToLibrary')}
              onPress={handleSave}
              loading={createRecipeMutation.isPending}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.checklistItem}>
      <Ionicons name={done ? 'checkmark' : 'ellipse-outline'} size={14} color={done ? MiseColors.success : MiseColors.muted} />
      <Text style={[styles.checklistLabel, { color: done ? MiseColors.success : MiseColors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22 },
  back: { marginBottom: 20 },
  title: { fontFamily: MiseFonts.display, fontSize: 30, color: MiseColors.ink, marginBottom: 6 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 14.5, lineHeight: 21, color: MiseColors.muted, marginBottom: 22 },
  field: { marginBottom: 14 },
  tip: {
    marginTop: 26,
    backgroundColor: MiseColors.tint,
    borderWidth: 1,
    borderColor: MiseColors.borderTint,
    borderRadius: MiseRadius.lg,
    padding: 16,
    paddingBottom: 14,
  },
  tipTitle: { fontFamily: MiseFonts.bodyBold, fontSize: 13, color: MiseColors.brand, marginBottom: 8 },
  tipBody: { fontFamily: MiseFonts.body, fontSize: 13.5, color: '#5B4E60', lineHeight: 20 },
  tipButton: { marginTop: 12, alignSelf: 'flex-start' },
  parsing: { alignItems: 'center', paddingTop: 60 },
  parsingTitle: { fontFamily: MiseFonts.display, fontSize: 25, color: MiseColors.ink, marginTop: 26, marginBottom: 6 },
  parsingSubtitle: {
    fontFamily: MiseFonts.body,
    fontSize: 14,
    color: MiseColors.muted,
    textAlign: 'center',
    maxWidth: 230,
    lineHeight: 20,
  },
  checklist: { marginTop: 30, width: '100%', maxWidth: 280, gap: 10 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checklistLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13.5 },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: MiseColors.successBg,
    borderWidth: 1,
    borderColor: MiseColors.successBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
  },
  successLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13.5, color: '#1F7A50' },
  previewCard: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.xl,
    overflow: 'hidden',
  },
  previewPhoto: { height: 150, justifyContent: 'flex-end', alignItems: 'flex-start' },
  previewSource: {
    backgroundColor: 'rgba(20,17,24,0.7)',
    color: '#fff',
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 11,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    margin: 8,
    overflow: 'hidden',
  },
  previewBody: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  previewTitle: { fontFamily: MiseFonts.display, fontSize: 23, color: MiseColors.ink, marginBottom: 4 },
  previewMeta: { fontFamily: MiseFonts.body, fontSize: 13, color: MiseColors.muted, marginBottom: 12 },
  previewIngredients: { borderTopWidth: 1, borderTopColor: MiseColors.divider },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 15 },
  previewRowDivider: { borderBottomWidth: 1, borderBottomColor: MiseColors.divider },
  previewDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: MiseColors.amber },
  previewIngName: { flex: 1, fontFamily: MiseFonts.body, fontSize: 14, color: MiseColors.ink },
  previewIngQty: { fontFamily: MiseFonts.body, fontSize: 13, color: MiseColors.muted },
  doneActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
