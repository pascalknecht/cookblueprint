import { FadingView, Header, ScrollViewWithHeaders } from '@codeherence/react-native-header';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { PhotoPlaceholder } from '@/components/mise/photo-placeholder';
import { MiseSpinner } from '@/components/mise/spinner';
import { RECIPE_TAG_KEY } from '@/constants/recipe-tags';
import { BackIconName, MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useAddRecipeToShoppingList } from '@/hooks/use-shopping-list';
import { useRecipe, type Recipe } from '@/hooks/use-recipes';
import { toISODate } from '@/lib/date-utils';
import { useToast } from '@/store/toast';

export default function RecipeDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: recipe, isPending, isError } = useRecipe(id);
  const addToListMutation = useAddRecipeToShoppingList();
  const { showToast } = useToast();

  if (isError) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <Text style={styles.errorText}>{t('recipeDetail.notFound')}</Text>
        <Button label={t('recipeDetail.goBack')} onPress={() => router.back()} />
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
      onSuccess: () => showToast(t('recipeDetail.addedToast')),
      onError: (error) => showToast(error.message),
    });
  }

  return (
    <View style={styles.screen}>
      <ScrollViewWithHeaders
        absoluteHeader
        initialAbsoluteHeaderHeight={0}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: insets.bottom + 100 }}
        HeaderComponent={({ showNavBar }) => (
          <Header
            showNavBar={showNavBar}
            noBottomBorder
            headerLeft={
              <IconButton
                name={BackIconName}
                variant="translucent"
                size={38}
                onPress={() => router.back()}
              />
            }
            headerCenter={
              <Text style={styles.headerBarTitle} numberOfLines={1}>
                {recipe.title}
              </Text>
            }
            SurfaceComponent={({ showNavBar: navBar }) => (
              <FadingView opacity={navBar} style={[StyleSheet.absoluteFill, styles.headerBarSurface]} />
            )}
          />
        )}
        LargeHeaderComponent={({ scrollY }) => <RecipeHero recipe={recipe} scrollY={scrollY} />}>
        <View style={styles.content}>
          <View style={styles.statsRow}>
            <StatBox label={t('recipeDetail.time')} value={t('recipeDetail.timeValue', { count: recipe.time })} />
            <StatBox label={t('recipeDetail.serves')} value={String(recipe.servings)} />
            <StatBox label={t('recipeDetail.kcal')} value={String(recipe.kcal)} />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recipeDetail.ingredients')}</Text>
            <Text style={styles.sectionMeta}>
              {t('recipeDetail.itemsCount', { count: recipe.ingredients.length })}
            </Text>
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

          <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>{t('recipeDetail.method')}</Text>
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
      </ScrollViewWithHeaders>

      <LinearGradient
        colors={['rgba(251,246,239,0)', MiseColors.background]}
        locations={[0, 0.34]}
        style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          label={t('recipeDetail.addToList')}
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

const HERO_HEIGHT = 300;

function RecipeHero({ recipe, scrollY }: { recipe: Recipe; scrollY: SharedValue<number> }) {
  const { t } = useTranslation();
  const parallaxStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-HERO_HEIGHT, 0, HERO_HEIGHT],
      [0, 0, HERO_HEIGHT * 0.5],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(scrollY.value, [-HERO_HEIGHT, 0, HERO_HEIGHT], [2, 1, 1], Extrapolation.CLAMP);
    return { transform: [{ translateY }, { scale }] };
  });

  return (
    <View style={[styles.hero, { backgroundColor: recipe.color }]}>
      <Animated.View style={[StyleSheet.absoluteFill, parallaxStyle]}>
        <PhotoPlaceholder
          color={recipe.color}
          style={StyleSheet.absoluteFill}
          iconSize={48}
          source={recipe.imageUrl ? { uri: recipe.imageUrl } : undefined}
        />
        <LinearGradient
          colors={['rgba(20,10,30,0.35)', 'rgba(20,10,30,0)', 'rgba(20,10,30,0.55)']}
          locations={[0, 0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={styles.heroFooter}>
        <View style={styles.tagRow}>
          {recipe.tags.map((tag) => {
            const key = RECIPE_TAG_KEY[tag];
            return (
              <Text key={tag} style={styles.tag}>
                {key ? t(`recipeTags.${key}`) : tag}
              </Text>
            );
          })}
          <Text style={styles.tag}>{t(`recipeFrequency.${recipe.frequency}`)}</Text>
        </View>
        <Text style={styles.heroTitle}>{recipe.title}</Text>
      </View>
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
  headerBarTitle: { fontFamily: MiseFonts.bodyBold, fontSize: 15, color: '#fff' },
  headerBarSurface: { backgroundColor: MiseColors.near },
  hero: { height: HERO_HEIGHT, position: 'relative', overflow: 'hidden' },
  heroFooter: { position: 'absolute', left: 22, right: 22, bottom: 34 },
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
    paddingTop: 32,
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
