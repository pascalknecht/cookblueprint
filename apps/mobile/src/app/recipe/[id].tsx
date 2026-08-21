import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { PhotoPlaceholder } from '@/components/mise/photo-placeholder';
import { CompactHeader, useScrollHeader } from '@/components/mise/scroll-header';
import { MiseSpinner } from '@/components/mise/spinner';
import { BackIconName, MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useAddRecipeToShoppingList } from '@/hooks/use-shopping-list';
import { useRecipe, useRecipes } from '@/hooks/use-recipes';
import { useReducedMotionFlag } from '@/lib/motion';
import { useToast } from '@/store/toast';

const SWIPE_RESISTANCE = 0.25;
const HERO_HEIGHT = 300;
// Pulls the content sheet up so its rounded top corners tuck behind the
// photo's rounded bottom corners, instead of sitting flush below it.
const CONTENT_OVERLAP = 24;
// How much slower the photo scrolls than the content, in [0, 1] — 1 means
// no parallax (it scrolls at the same speed), 0 means it stays pinned.
const PARALLAX_FACTOR = 0.5;

export default function RecipeDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const queryClient = useQueryClient();
  const { data: recipe, isPending, isError } = useRecipe(id);
  const { data: recipeList } = useRecipes();
  const addToListMutation = useAddRecipeToShoppingList();
  const { showToast } = useToast();

  // The photo scrolls away with the rest of the page (it's just the first
  // item in the scroll content), paired with a pinned compact bar that
  // crossfades in once it's gone, the same pattern used on the other tabs —
  // rather than a separately pinned photo that shrinks in place, whose
  // shrink distance previously didn't match its scroll distance and let
  // the content sheet silently scroll all the way over it.
  const { onScroll, onHeaderLayout, compactStyle, compactShown, scrollY } = useScrollHeader();
  const heroHeight = insets.top + HERO_HEIGHT;

  // The photo already sits in normal scroll flow, so it moves up by scrollY
  // like anything else. Counteracting part of that (translating it back
  // down by scrollY*(1-factor)) slows its net speed to scrollY*factor —
  // the classic parallax lag — and pulling past the top (scrollY<0) scales
  // it up for a pull-to-zoom effect, matching how react-native-parallax-flow
  // does it.
  const reduced = useReducedMotionFlag();
  const parallaxStyle = useAnimatedStyle(() => {
    // Parallax (translation + pull-to-zoom scale) is spatial delight, not
    // state indication — drop it entirely under reduced motion and keep the
    // photo pinned at rest.
    if (reduced) return {};
    const y = scrollY.value;
    if (y < 0) {
      return { transform: [{ translateY: y / 2 }, { scale: 1 - y / heroHeight }] };
    }
    return { transform: [{ translateY: y * (1 - PARALLAX_FACTOR) }] };
  });

  const { previousId, nextId } = useMemo(() => {
    const index = recipeList?.findIndex((item) => item.id === id) ?? -1;
    if (index < 0 || !recipeList) return { previousId: undefined, nextId: undefined };
    return { previousId: recipeList[index - 1]?.id, nextId: recipeList[index + 1]?.id };
  }, [recipeList, id]);

  const translateX = useSharedValue(0);

  function goToRecipe(targetId: string) {
    const targetRecipe = recipeList?.find((item) => item.id === targetId);
    if (targetRecipe) queryClient.setQueryData(['recipes', targetId], targetRecipe);
    router.setParams({ id: targetId });
    translateX.value = 0;
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      const allowed = event.translationX < 0 ? !!nextId : !!previousId;
      translateX.value = allowed ? event.translationX : event.translationX * SWIPE_RESISTANCE;
    })
    .onEnd((event) => {
      const threshold = screenWidth * 0.25;
      if (event.translationX < -threshold && nextId) {
        translateX.value = withTiming(-screenWidth, { duration: 220 }, (finished) => {
          if (finished) runOnJS(goToRecipe)(nextId);
        });
      } else if (event.translationX > threshold && previousId) {
        translateX.value = withTiming(screenWidth, { duration: 220 }, (finished) => {
          if (finished) runOnJS(goToRecipe)(previousId);
        });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const swipeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

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
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.screen, swipeStyle]}>
        <StatusBar style="light" />
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
          <Animated.View onLayout={onHeaderLayout} style={[styles.photo, { height: heroHeight }, parallaxStyle]}>
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

            <View style={styles.tagRow}>
              {recipe.mealTypes.map((mealType) => (
                <Text key={mealType} style={styles.tag}>
                  {t(`recipeMealTypes.${mealType}`)}
                </Text>
              ))}
              <Text style={styles.tag}>{t(`recipeFrequency.${recipe.frequency}`)}</Text>
            </View>

            <Text style={styles.heroTitle} numberOfLines={2}>
              {recipe.title}
            </Text>
          </Animated.View>

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
        </Animated.ScrollView>

        <CompactHeader title={recipe.title} compactStyle={compactStyle} compactShown={compactShown} titleInset={40} />

        {/* Back/edit buttons stay pinned above everything and always
            visible — they carry their own translucent backing, so they
            don't need the compact bar to be shown to read clearly. */}
        <View pointerEvents="box-none" style={styles.chrome}>
          <IconButton
            name={BackIconName}
            variant="translucent"
            size={38}
            color={compactShown ? '#fff' : undefined}
            onPress={() => router.back()}
            style={[
              styles.cornerButton,
              styles.backButton,
              { top: insets.top + 9 },
              compactShown && styles.cornerButtonBare,
            ]}
          />
          <IconButton
            name="create-outline"
            variant="translucent"
            size={38}
            onPress={() => router.push({ pathname: '/edit-recipe', params: { id } })}
            style={[styles.cornerButton, styles.editButton, { top: insets.top + 9 }]}
          />
        </View>

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
            onPress={() => router.push({ pathname: '/add-to-plan', params: { recipeId: id, title: recipe.title } })}
          />
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
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
  photo: {
    backgroundColor: MiseColors.near,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    // CONTENT_OVERLAP pulls the content sheet up to tuck behind this
    // padding, so the actual visible gap below the title is this amount
    // minus the overlap — pad well beyond it to leave real breathing room.
    paddingBottom: CONTENT_OVERLAP + 20,
  },
  chrome: { position: 'absolute', left: 0, right: 0, top: 0 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
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
  heroTitle: {
    color: '#fff',
    fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking,
    fontSize: 32,
    lineHeight: 34,
  },
  cornerButton: { position: 'absolute' },
  cornerButtonBare: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  backButton: { left: 16 },
  editButton: { right: 16 },
  content: {
    backgroundColor: MiseColors.background,
    borderTopLeftRadius: MiseRadius.xxl,
    borderTopRightRadius: MiseRadius.xxl,
    marginTop: -CONTENT_OVERLAP,
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
  sectionTitle: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 23, color: MiseColors.ink },
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
