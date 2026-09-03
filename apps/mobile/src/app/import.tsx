import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/mise/back-header';
import { Button } from '@/components/mise/button';
import { PhotoPlaceholder } from '@/components/mise/photo-placeholder';
import { MiseSpinner } from '@/components/mise/spinner';
import { TextField } from '@/components/mise/text-field';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useCreateRecipe, useImportRecipe } from '@/hooks/use-recipes';
import { useMountEffect } from '@/hooks/use-mount-effect';
import { useToast } from '@/store/toast';

type Stage = 'input' | 'parsing' | 'done';

function sourceHost(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl;
  }
}

export default function ImportScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const createRecipeMutation = useCreateRecipe();
  const importRecipeMutation = useImportRecipe();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ url?: string; autostart?: string }>();
  const { resetShareIntent } = useShareIntentContext();
  const [url, setUrl] = useState(params.url ?? '');
  const [stage, setStage] = useState<Stage>(params.autostart === '1' ? 'parsing' : 'input');
  const preview = importRecipeMutation.data;

  function startParsing(importUrl: string) {
    setStage('parsing');
    importRecipeMutation.mutate(importUrl, {
      onSuccess: () => setStage('done'),
      onError: (error) => {
        showToast(error.message);
        setStage('input');
      },
    });
  }

  useMountEffect(() => {
    if (params.autostart === '1' && params.url) {
      resetShareIntent();
      startParsing(params.url);
    }
  });

  function handleImport() {
    if (!url.trim()) return;
    startParsing(url.trim());
  }

  function handleSave() {
    if (!preview) return;
    createRecipeMutation.mutate(preview, {
      onSuccess: () => {
        showToast(t('importRecipe.savedToast'));
        router.replace('/recipes');
      },
      onError: (error) => showToast(error.message),
    });
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BackHeader title={t('importRecipe.title')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      {stage === 'input' ? (
        <View>
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
        </View>
      ) : null}

      {stage === 'done' && preview ? (
        <View>
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color={MiseColors.success} />
            <Text style={styles.successLabel}>{t('importRecipe.successLabel')}</Text>
          </View>
          <View style={styles.previewCard}>
            <PhotoPlaceholder
              color={preview.color}
              style={styles.previewPhoto}
              source={preview.imageUrl ? { uri: preview.imageUrl } : undefined}>
              <Text style={styles.previewSource}>{t('importRecipe.previewSource', { host: sourceHost(url) })}</Text>
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
            <Button
              label={t('importRecipe.saveToLibrary')}
              onPress={handleSave}
              loading={createRecipeMutation.isPending}
            />
          </View>
        </View>
      ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 26 },
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
  parsingTitle: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 25, color: MiseColors.ink, marginTop: 26, marginBottom: 6 },
  parsingSubtitle: {
    fontFamily: MiseFonts.body,
    fontSize: 14,
    color: MiseColors.muted,
    textAlign: 'center',
    maxWidth: 230,
    lineHeight: 20,
  },
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
  previewTitle: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 23, color: MiseColors.ink, marginBottom: 4 },
  previewMeta: { fontFamily: MiseFonts.body, fontSize: 13, color: MiseColors.muted, marginBottom: 12 },
  previewIngredients: { borderTopWidth: 1, borderTopColor: MiseColors.divider },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 15 },
  previewRowDivider: { borderBottomWidth: 1, borderBottomColor: MiseColors.divider },
  previewDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: MiseColors.amber },
  previewIngName: { flex: 1, fontFamily: MiseFonts.body, fontSize: 14, color: MiseColors.ink },
  previewIngQty: { fontFamily: MiseFonts.body, fontSize: 13, color: MiseColors.muted },
  doneActions: { marginTop: 16 },
});
