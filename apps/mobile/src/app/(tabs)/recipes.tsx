import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/mise/icon-button';
import { RecipeCard } from '@/components/mise/recipe-card';
import { MiseColors, MiseFonts } from '@/constants/theme';
import { useSession } from '@/lib/auth-client';
import { useRecipes } from '@/hooks/use-recipes';

const FILTERS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Veg'] as const;

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');
  const { data: recipes = [] } = useRecipes({ tag: filter });
  const { data: session } = useSession();

  const firstName = session?.user?.name?.trim().split(/\s+/)[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) || r.ingredients.some((ing) => ing.n.toLowerCase().includes(q)),
    );
  }, [recipes, query]);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 108 }}
      data={filtered}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hi {firstName ?? 'there'} 👋</Text>
              <Text style={styles.title}>Recipes</Text>
            </View>
            {Platform.OS === 'ios' ? (
              <IconButton name="add" variant="gradient" size={44} onPress={() => router.push('/add-recipe-sheet')} />
            ) : null}
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={MiseColors.mutedLight} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search recipes & ingredients"
              placeholderTextColor={MiseColors.mutedLight}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, f === filter && styles.chipActive]}>
                <Text style={[styles.chipLabel, f === filter && styles.chipLabelActive]}>{f}</Text>
              </Pressable>
            ))}
          </View>
        </>
      }
      renderItem={({ item }) => (
        <RecipeCard
          recipe={item}
          meta={`${item.servings} servings · ${item.tags[0]}`}
          onPress={() => router.push(`/recipe/${item.id}`)}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
    />
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
