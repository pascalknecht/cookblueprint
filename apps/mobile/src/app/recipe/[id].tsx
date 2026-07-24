import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { PhotoPlaceholder } from '@/components/mise/photo-placeholder';
import { MiseSpinner } from '@/components/mise/spinner';
import { BackIconName, MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useAddRecipeToShoppingList } from '@/hooks/use-shopping-list';
import { useRecipe } from '@/hooks/use-recipes';
import { toISODate } from '@/lib/date-utils';
import { useToast } from '@/store/toast';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: recipe, isPending, isError } = useRecipe(id);
  const addToListMutation = useAddRecipeToShoppingList();
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);

  if (isError) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <Text style={styles.errorText}>This recipe couldn&apos;t be found.</Text>
        <Button label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  if (isPending) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <MiseSpinner size={40} />
      </View>
    );
  }

  function handleAddToList() {
    addToListMutation.mutate(id, {
      onSuccess: () => showToast('Added to shopping list'),
      onError: (error) => showToast(error.message),
    });
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={[styles.hero, { backgroundColor: recipe.color }]}>
          <PhotoPlaceholder color={recipe.color} style={StyleSheet.absoluteFill} iconSize={48} />
          <LinearGradient
            colors={['rgba(20,10,30,0.35)', 'rgba(20,10,30,0)', 'rgba(20,10,30,0.55)']}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFill}
          />
          <IconButton
            name={BackIconName}
            variant="translucent"
            onPress={() => router.back()}
            style={[styles.heroButton, { top: insets.top + 14, left: 18 }]}
          />
          <IconButton
            name={saved ? 'heart' : 'heart-outline'}
            variant="translucent"
            color={saved ? MiseColors.brand : MiseColors.ink}
            onPress={() => setSaved((v) => !v)}
            style={[styles.heroButton, { top: insets.top + 14, right: 18 }]}
          />
          <View style={styles.heroFooter}>
            <View style={styles.tagRow}>
              {recipe.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
            <Text style={styles.heroTitle}>{recipe.title}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <StatBox label="TIME" value={`${recipe.time} min`} />
            <StatBox label="SERVES" value={String(recipe.servings)} />
            <StatBox label="KCAL" value={String(recipe.kcal)} />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Text style={styles.sectionMeta}>{recipe.ingredients.length} items</Text>
          </View>
          <View style={styles.ingredientsCard}>
            {recipe.ingredients.map((ing, index) => (
              <View
                key={ing.n}
                style={[styles.ingredientRow, index < recipe.ingredients.length - 1 && styles.ingredientRowDivider]}>
                <View style={[styles.dot, { backgroundColor: recipe.color }]} />
                <Text style={styles.ingredientName}>{ing.n}</Text>
                <Text style={styles.ingredientQty}>{ing.q}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Method</Text>
          <View style={styles.steps}>
            {recipe.steps.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberLabel}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <LinearGradient
        colors={['rgba(251,246,239,0)', MiseColors.background]}
        locations={[0, 0.34]}
        style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          label="＋ Add to shopping list"
          onPress={handleAddToList}
          loading={addToListMutation.isPending}
          style={{ flex: 1 }}
        />
        <IconButton
          name="calendar"
          variant="tint"
          size={54}
          onPress={() =>
            router.push({ pathname: '/pick-recipe', params: { date: toISODate(new Date()), meal: 'dinner' } })
          }
        />
      </LinearGradient>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  loading: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontFamily: MiseFonts.body, fontSize: 15, color: MiseColors.muted },
  hero: { height: 300, position: 'relative' },
  heroButton: { position: 'absolute' },
  heroFooter: { position: 'absolute', left: 22, right: 22, bottom: 16 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: MiseColors.ink,
    fontFamily: MiseFonts.bodyBold,
    fontSize: 11,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  heroTitle: { fontFamily: MiseFonts.display, fontSize: 32, color: '#fff', lineHeight: 34 },
  content: {
    backgroundColor: MiseColors.background,
    borderTopLeftRadius: MiseRadius.xxl,
    borderTopRightRadius: MiseRadius.xxl,
    marginTop: -16,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statBox: {
    flex: 1,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 11, color: MiseColors.muted },
  statValue: { fontFamily: MiseFonts.bodyBold, fontSize: 16, color: MiseColors.ink, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontFamily: MiseFonts.display, fontSize: 23, color: MiseColors.ink },
  sectionMeta: { color: MiseColors.muted, fontFamily: MiseFonts.body, fontSize: 13 },
  ingredientsCard: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.lg,
    overflow: 'hidden',
    marginBottom: 22,
  },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15 },
  ingredientRowDivider: { borderBottomWidth: 1, borderBottomColor: MiseColors.divider },
  dot: { width: 7, height: 7, borderRadius: 4 },
  ingredientName: { flex: 1, fontFamily: MiseFonts.body, fontSize: 14.5, color: MiseColors.ink },
  ingredientQty: { fontFamily: MiseFonts.body, fontSize: 13.5, color: MiseColors.muted },
  steps: { gap: 14 },
  stepRow: { flexDirection: 'row', gap: 13 },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: MiseColors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberLabel: { color: MiseColors.brand, fontFamily: MiseFonts.bodyBold, fontSize: 13 },
  stepText: { flex: 1, fontFamily: MiseFonts.body, fontSize: 14.5, color: MiseColors.inkSoft, lineHeight: 21, paddingTop: 2 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
});
