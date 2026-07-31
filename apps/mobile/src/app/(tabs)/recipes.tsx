import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { EmptyState } from '@/components/mise/empty-state';
import { IconButton } from '@/components/mise/icon-button';
import { RecipeCard } from '@/components/mise/recipe-card';
import { RECIPE_TAG_KEY } from '@/constants/recipe-tags';
import { MiseColors, MiseFonts } from '@/constants/theme';
import { useSession } from '@/lib/auth-client';
import { useRecipes } from '@/hooks/use-recipes';

const FILTERS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Veg'] as const;

export default function RecipesScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');
  const { data: recipes = [] } = useRecipes({ tag: filter });
  const { data: session } = useSession();

  const firstName = session?.user?.name?.trim().split(/\s+/)[0];

  function filterLabel(tag: string) {
    if (tag === 'All') return t('recipesScreen.filterAll');
    const key = RECIPE_TAG_KEY[tag];
    return key ? t(`recipeTags.${key}`) : tag;
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) || r.ingredients.some((ing) => ing.n.toLowerCase().includes(q)),
    );
  }, [recipes, query]);

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 108 }}
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>
                  {firstName ? t('recipesScreen.greetingNamed', { name: firstName }) : t('recipesScreen.greetingAnonymous')}
                </Text>
                <Text style={styles.title}>{t('recipesScreen.title')}</Text>
              </View>
              <IconButton name="add" variant="gradient" size={44} onPress={() => router.push('/add-recipe-sheet')} />
            </View>

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
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.chip, f === filter && styles.chipActive]}>
                  <Text style={[styles.chipLabel, f === filter && styles.chipLabelActive]}>{filterLabel(f)}</Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            meta={t('recipesScreen.cardMeta', { servings: item.servings, tag: filterLabel(item.tags[0]) })}
            onPress={() => router.push(`/recipe/${item.id}`)}
          />
        )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  greeting: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.muted },
  title: { fontFamily: MiseFonts.display, fontSize: 32, color: MiseColors.ink, marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 46,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
    borderRadius: 14,
    marginHorizontal: 22,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: MiseColors.ink, fontFamily: MiseFonts.body, fontSize: 14.5 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingBottom: 16, flexWrap: 'wrap' },
  chip: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: MiseColors.near, borderColor: MiseColors.near },
  chipLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.inkSoft },
  chipLabelActive: { color: '#fff' },
  row: { paddingHorizontal: 22, gap: 14 },
});
