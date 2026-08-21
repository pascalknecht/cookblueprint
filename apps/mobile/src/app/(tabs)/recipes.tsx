import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { Button } from '@/components/mise/button';
import { EmptyState } from '@/components/mise/empty-state';
import { IconButton } from '@/components/mise/icon-button';
import { RecipeCard } from '@/components/mise/recipe-card';
import { CompactHeader, PageHeader, useScrollHeader } from '@/components/mise/scroll-header';
import { RECIPE_MEAL_TYPES, type RecipeMealType } from '@/constants/recipe-meal-types';
import { MiseColors, MiseFonts } from '@/constants/theme';
import { useRecipes } from '@/hooks/use-recipes';
import { useReducedMotionFlag, colorTransition } from '@/lib/motion';

const FILTERS = ['All', ...RECIPE_MEAL_TYPES] as const;

export default function RecipesScreen() {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');
  const { data: recipes = [] } = useRecipes({ mealType: filter === 'All' ? undefined : filter });
  const { onScroll, onHeaderLayout, compactStyle, compactShown } = useScrollHeader();
  const reduced = useReducedMotionFlag();

  function filterLabel(filterValue: (typeof FILTERS)[number]) {
    if (filterValue === 'All') return t('recipesScreen.filterAll');
    return t(`recipeMealTypes.${filterValue}`);
  }

  function mealTypeLabel(mealType: RecipeMealType) {
    return t(`recipeMealTypes.${mealType}`);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) || r.ingredients.some((ing) => ing.n.toLowerCase().includes(q)),
    );
  }, [recipes, query]);

  // FlatList's numColumns={2} relies on each RecipeCard using flex:1 to split its row evenly.
  // With an odd item count, the lone card in the last row has no sibling to share flex with,
  // so it stretches to fill the whole row — pad the row with an invisible flex:1 spacer instead.
  const gridData = useMemo(
    () => (filtered.length % 2 === 0 ? filtered : [...filtered, { id: '__filler__' } as (typeof filtered)[number]]),
    [filtered],
  );

  return (
    <View accessibilityLabel="recipes-screen" testID="recipes-screen" style={styles.screen}>
      <StatusBar style="light" />
      <Animated.FlatList
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 108 }}
        data={gridData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View>
            <PageHeader
              onLayout={onHeaderLayout}
              title={t('recipesScreen.title')}
              action={
                <IconButton
                  name="add"
                  variant="translucent"
                  size={42}
                  testID="recipes-add-button"
                  onPress={() => router.push('/add-recipe-sheet')}
                />
              }>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={MiseColors.mutedLight} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t('recipesScreen.searchPlaceholder')}
                  placeholderTextColor={MiseColors.mutedLight}
                  style={styles.searchInput}
                />
              </View>

              <View style={styles.filterRow}>
                {FILTERS.map((f) => (
                  <AnimatedPressable
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[styles.chip, f === filter && styles.chipActive, colorTransition(reduced)]}>
                    <Text style={[styles.chipLabel, f === filter && styles.chipLabelActive]}>{filterLabel(f)}</Text>
                  </AnimatedPressable>
                ))}
              </View>
            </PageHeader>
            <View style={styles.gridTopSpacer} />
          </View>
        }
        renderItem={({ item }) =>
          item.id === '__filler__' ? (
            <View style={styles.filler} />
          ) : (
            <RecipeCard
              recipe={item}
              meta={
                item.mealTypes[0]
                  ? t('recipesScreen.cardMeta', { servings: item.servings, mealType: mealTypeLabel(item.mealTypes[0]) })
                  : t('recipesScreen.cardMetaNoType', { servings: item.servings })
              }
              onPress={() => router.push(`/recipe/${item.id}`)}
            />
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListEmptyComponent={
          recipes.length === 0 ? (
            <EmptyState
              icon="restaurant-outline"
              title={t('recipesScreen.emptyTitle')}
              subtitle={t('recipesScreen.emptySubtitle')}
              action={<Button label={t('recipesScreen.addRecipe')} onPress={() => router.push('/add-recipe-sheet')} />}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title={t('recipesScreen.noMatchesTitle')}
              subtitle={
                query.trim()
                  ? t('recipesScreen.noMatchesQuery', { query: query.trim() })
                  : t('recipesScreen.noMatchesFilter', {
                      filter: i18n.language === 'en' ? filterLabel(filter).toLowerCase() : filterLabel(filter),
                    })
              }
            />
          )
        }
      />

      <CompactHeader
        title={t('recipesScreen.title')}
        compactStyle={compactStyle}
        compactShown={compactShown}
        action={
          <IconButton name="add" variant="translucent" size={36} onPress={() => router.push('/add-recipe-sheet')} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 46,
    backgroundColor: '#3A2E26',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#FFF9F3', fontFamily: MiseFonts.body, fontSize: 14.5 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5B493D',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: MiseColors.brand, borderColor: MiseColors.brand },
  chipLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: '#D7B49D' },
  chipLabelActive: { color: '#FFF9F3' },
  row: { paddingHorizontal: 22, gap: 14 },
  gridTopSpacer: { height: 16 },
  filler: { flex: 1 },
});
