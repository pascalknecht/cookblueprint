import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { EmptyState } from '@/components/mise/empty-state';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useAssignMeal, type MealType } from '@/hooks/use-meal-plan';
import { useRecipes, type Recipe } from '@/hooks/use-recipes';
import { usePressFeedback } from '@/hooks/usePressFeedback';
import { useToast } from '@/store/toast';

export default function PickRecipeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { date, meal } = useLocalSearchParams<{ date: string; meal: MealType }>();
  const { data: recipes = [] } = useRecipes();
  const assignMealMutation = useAssignMeal();
  const { showToast } = useToast();

  function pick(recipe: Recipe) {
    assignMealMutation.mutate(
      { date: new Date(date), mealType: meal, recipeId: recipe.id },
      { onError: (error) => showToast(error.message) },
    );
    router.back();
  }

  return (
    <View style={styles.host}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <View style={[styles.sheet, { marginTop: insets.top + 100 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{t('pickRecipe.title')}</Text>
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <EmptyState icon="restaurant-outline" title={t('pickRecipe.emptyTitle')} subtitle={t('pickRecipe.emptySubtitle')} />
          }
          renderItem={({ item }) => <PickRecipeRow recipe={item} onPress={() => pick(item)} />}
        />
      </View>
    </View>
  );
}

function PickRecipeRow({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  const { t } = useTranslation();
  const { onPressIn, onPressOut, style: pressStyle } = usePressFeedback();
  return (
    <AnimatedPressable style={[styles.row, pressStyle]} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <View style={[styles.swatch, { backgroundColor: recipe.color }]} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{recipe.title}</Text>
        <Text style={styles.rowMeta}>{t('pickRecipe.rowMeta', { time: recipe.time, servings: recipe.servings })}</Text>
      </View>
      <Ionicons name="add-circle" size={22} color={MiseColors.brand} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, backgroundColor: 'rgba(20,12,30,0.42)' },
  sheet: {
    flex: 1,
    backgroundColor: MiseColors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 12,
  },
  handle: {
    width: 38,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#DDD3C6',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 24, color: MiseColors.ink, paddingHorizontal: 22, marginBottom: 12 },
  list: { paddingHorizontal: 22, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    padding: 10,
    paddingHorizontal: 12,
  },
  swatch: { width: 44, height: 44, borderRadius: 11 },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: MiseFonts.bodyBold, fontSize: 14.5, color: MiseColors.ink },
  rowMeta: { fontFamily: MiseFonts.body, fontSize: 12, color: MiseColors.muted },
});
