import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { MEAL_DEFS, MealType, useMealPlan } from '@/hooks/use-meal-plan';
import type { Recipe } from '@/hooks/use-recipes';
import { useAddMealPlanToShoppingList } from '@/hooks/use-shopping-list';
import { dayOfMonth, formatWeekRange, getCurrentWeekDates, isSameDate, toISODate, weekdayShort } from '@/lib/date-utils';
import { useToast } from '@/store/toast';

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const weekDates = useMemo(() => getCurrentWeekDates(), []);
  const startDate = weekDates[0];
  const endDate = weekDates[weekDates.length - 1];
  const { data: entries = [] } = useMealPlan({ startDate, endDate });
  const addWeekToListMutation = useAddMealPlanToShoppingList();
  const { showToast } = useToast();
  const today = new Date();

  const entriesByDate = useMemo(() => {
    const map = new Map<string, Map<MealType, Recipe>>();
    for (const entry of entries) {
      const dateKey = toISODate(new Date(entry.date));
      if (!map.has(dateKey)) map.set(dateKey, new Map());
      map.get(dateKey)!.set(entry.mealType, entry.recipe);
    }
    return map;
  }, [entries]);

  function handleAddWeekToList() {
    addWeekToListMutation.mutate(
      { startDate, endDate },
      {
        onSuccess: () => showToast('Added week to shopping list'),
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 108 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>This week</Text>
          <Text style={styles.title}>Meal plan</Text>
        </View>
        <Text style={styles.range}>{formatWeekRange(weekDates)}</Text>
      </View>

      <View style={styles.ctaRow}>
        <Button
          label="✨ Auto-plan week"
          variant="gradient"
          onPress={() => router.push('/plan-options')}
          style={styles.ctaGradient}
        />
        <Button
          label="＋ List"
          variant="secondary"
          compact
          onPress={handleAddWeekToList}
          loading={addWeekToListMutation.isPending}
        />
      </View>

      <View style={styles.week}>
        {weekDates.map((date) => {
          const isToday = isSameDate(date, today);
          const dateISO = toISODate(date);
          const dayMeals = entriesByDate.get(dateISO);

          return (
            <View key={dateISO}>
              <View style={styles.dayHeader}>
                <View style={[styles.dayBadge, isToday && styles.dayBadgeToday]}>
                  <Text style={[styles.dayBadgeLabel, isToday && styles.dayBadgeLabelToday]}>
                    {weekdayShort(date)}
                  </Text>
                  <Text style={[styles.dayBadgeDate, isToday && styles.dayBadgeLabelToday]}>{dayOfMonth(date)}</Text>
                </View>
                {isToday ? (
                  <View style={styles.todayPill}>
                    <Text style={styles.todayPillLabel}>TODAY</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.cells}>
                {MEAL_DEFS.map((meal) => {
                  const recipe = dayMeals?.get(meal);
                  if (recipe) {
                    return (
                      <MealCell
                        key={meal}
                        meal={meal}
                        recipe={recipe}
                        onPress={() => router.push(`/recipe/${recipe.id}`)}
                      />
                    );
                  }
                  return (
                    <EmptyMealCell
                      key={meal}
                      meal={meal}
                      onPress={() => router.push({ pathname: '/pick-recipe', params: { date: dateISO, meal } })}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function MealCell({
  meal,
  recipe,
  onPress,
}: {
  meal: MealType;
  recipe: { title: string; color: string; time: number };
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.cellTouchable} onPress={onPress}>
      <View style={[styles.cellSwatch, { backgroundColor: recipe.color }]} />
      <View style={styles.cellBody}>
        <Text style={styles.cellMeal}>{meal}</Text>
        <Text style={styles.cellTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
      </View>
      <Text style={styles.cellTime}>{recipe.time}m</Text>
    </Pressable>
  );
}

function EmptyMealCell({ meal, onPress }: { meal: MealType; onPress: () => void }) {
  const label = meal.charAt(0).toUpperCase() + meal.slice(1);
  return (
    <Pressable style={styles.emptyCell} onPress={onPress}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconLabel}>＋</Text>
      </View>
      <Text style={styles.emptyLabel}>Add {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  eyebrow: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.muted },
  title: { fontFamily: MiseFonts.display, fontSize: 32, color: MiseColors.ink, marginTop: 2 },
  range: { fontFamily: MiseFonts.bodySemiBold, fontSize: 12.5, color: MiseColors.muted },
  ctaRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, paddingVertical: 14 },
  ctaGradient: { flex: 1 },
  week: { paddingHorizontal: 22, gap: 14 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dayBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
  },
  dayBadgeToday: { backgroundColor: MiseColors.brand, borderColor: MiseColors.brand },
  dayBadgeLabel: { fontFamily: MiseFonts.bodyBold, fontSize: 10, color: MiseColors.ink, lineHeight: 11 },
  dayBadgeDate: { fontFamily: MiseFonts.bodyExtraBold, fontSize: 15, color: MiseColors.ink, lineHeight: 16 },
  dayBadgeLabelToday: { color: '#fff' },
  todayPill: { backgroundColor: MiseColors.tint, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  todayPillLabel: { fontFamily: MiseFonts.bodyBold, fontSize: 10.5, color: MiseColors.brand },
  cells: { gap: 7 },
  cellTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    padding: 10,
    paddingHorizontal: 12,
  },
  cellSwatch: { width: 36, height: 36, borderRadius: 10 },
  cellBody: { flex: 1, minWidth: 0 },
  cellMeal: {
    fontFamily: MiseFonts.bodyBold,
    fontSize: 10,
    color: MiseColors.mutedLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cellTitle: { fontFamily: MiseFonts.bodyBold, fontSize: 14, color: MiseColors.ink },
  cellTime: { fontSize: 12, color: '#C9BEB0', fontFamily: MiseFonts.body },
  emptyCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1.4,
    borderColor: '#DED4C5',
    borderStyle: 'dashed',
    borderRadius: MiseRadius.md,
    padding: 11,
    paddingHorizontal: 12,
  },
  emptyIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: MiseColors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconLabel: { color: MiseColors.mutedLight, fontSize: 14 },
  emptyLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.mutedLight },
});
