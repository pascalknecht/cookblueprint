import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { type MealType } from '@/constants/meal-types';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useMealPlan, type MealPlanEntry } from '@/hooks/use-meal-plan';
import { useEnabledMealTypes } from '@/hooks/use-organization-settings';
import { useAddMealPlanToShoppingList } from '@/hooks/use-shopping-list';
import { dayOfMonth, formatWeekRange, getCurrentWeekDates, isSameDate, toISODate, weekdayShort } from '@/lib/date-utils';
import { useToast } from '@/store/toast';

export default function PlanScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = useMemo(() => {
    const reference = new Date();
    reference.setDate(reference.getDate() + weekOffset * 7);
    return getCurrentWeekDates(reference);
  }, [weekOffset]);
  const startDate = weekDates[0];
  const endDate = weekDates[weekDates.length - 1];
  const { data: entries = [] } = useMealPlan({ startDate, endDate });
  const addWeekToListMutation = useAddMealPlanToShoppingList();
  const { showToast } = useToast();
  const today = new Date();

  const weekLabel =
    weekOffset === 0
      ? t('planScreen.eyebrow')
      : weekOffset === 1
        ? t('planScreen.nextWeek')
        : weekOffset === -1
          ? t('planScreen.lastWeek')
          : weekOffset > 1
            ? t('planScreen.weeksAhead', { count: weekOffset })
            : t('planScreen.weeksAgo', { count: -weekOffset });

  const mealTypes = useEnabledMealTypes();

  const entriesByDate = useMemo(() => {
    const map = new Map<string, Map<MealType, MealPlanEntry>>();
    for (const entry of entries) {
      const dateKey = toISODate(new Date(entry.date));
      if (!map.has(dateKey)) map.set(dateKey, new Map());
      map.get(dateKey)!.set(entry.mealType, entry);
    }
    return map;
  }, [entries]);

  function handleAddWeekToList() {
    addWeekToListMutation.mutate(
      { startDate, endDate },
      {
        onSuccess: () => showToast(t('planScreen.addedWeekToList')),
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 108 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{weekLabel}</Text>
          <Text style={styles.title}>{t('planScreen.title')}</Text>
        </View>
      </View>

      <View style={styles.weekSwitcher}>
        <IconButton name="chevron-back" size={44} onPress={() => setWeekOffset((offset) => offset - 1)} />
        <View style={styles.weekSwitcherCenter}>
          <Text style={styles.range}>{formatWeekRange(weekDates, i18n.language)}</Text>
          {weekOffset !== 0 ? (
            <Pressable hitSlop={8} onPress={() => setWeekOffset(0)}>
              <Text style={styles.todayLinkLabel}>{t('planScreen.backToThisWeek')}</Text>
            </Pressable>
          ) : null}
        </View>
        <IconButton name="chevron-forward" size={44} onPress={() => setWeekOffset((offset) => offset + 1)} />
      </View>

      <View style={styles.ctaRow}>
        <Button
          label={t('planScreen.autoPlan')}
          variant="gradient"
          onPress={() =>
            router.push({
              pathname: '/plan-options',
              params: { startDate: toISODate(startDate), endDate: toISODate(endDate) },
            })
          }
          style={styles.ctaGradient}
        />
        <Button
          label={t('planScreen.addToList')}
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
                    {weekdayShort(date, i18n.language)}
                  </Text>
                  <Text style={[styles.dayBadgeDate, isToday && styles.dayBadgeLabelToday]}>{dayOfMonth(date)}</Text>
                </View>
                {isToday ? (
                  <View style={styles.todayPill}>
                    <Text style={styles.todayPillLabel}>{t('planScreen.today')}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.cells}>
                {mealTypes.map((meal) => {
                  const entry = dayMeals?.get(meal);
                  if (entry) {
                    return (
                      <MealCell
                        key={meal}
                        meal={meal}
                        recipe={entry.recipe}
                        onPress={() => router.push(`/recipe/${entry.recipe.id}`)}
                        onOptionsPress={() =>
                          router.push({
                            pathname: '/edit-meal',
                            params: {
                              date: dateISO,
                              meal,
                              entryId: entry.id,
                              title: entry.recipe.title,
                              color: entry.recipe.color,
                            },
                          })
                        }
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
  onOptionsPress,
}: {
  meal: MealType;
  recipe: { title: string; color: string; time: number };
  onPress: () => void;
  onOptionsPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable style={styles.cellTouchable} onPress={onPress}>
      <View style={[styles.cellSwatch, { backgroundColor: recipe.color }]} />
      <View style={styles.cellBody}>
        <Text style={styles.cellMeal}>{t(`mealTypes.${meal}`)}</Text>
        <Text style={styles.cellTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
      </View>
      <Text style={styles.cellTime}>{t('planScreen.minutesShort', { count: recipe.time })}</Text>
      <Pressable
        hitSlop={8}
        onPress={(e) => {
          e.stopPropagation();
          onOptionsPress();
        }}
        style={styles.cellOptions}>
        <Ionicons name="ellipsis-horizontal" size={16} color={MiseColors.mutedLight} />
      </Pressable>
    </Pressable>
  );
}

function EmptyMealCell({ meal, onPress }: { meal: MealType; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable style={styles.emptyCell} onPress={onPress}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconLabel}>＋</Text>
      </View>
      <Text style={styles.emptyLabel}>{t('planScreen.addMeal', { meal: t(`mealTypes.${meal}`) })}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  eyebrow: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.muted },
  title: { fontFamily: MiseFonts.display, fontSize: 32, color: MiseColors.ink, marginTop: 2 },
  range: { fontFamily: MiseFonts.bodySemiBold, fontSize: 15, color: MiseColors.ink },
  weekSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  weekSwitcherCenter: { alignItems: 'center', gap: 4 },
  todayLinkLabel: { fontFamily: MiseFonts.bodyBold, fontSize: 12.5, color: MiseColors.brand },
  ctaRow: { flexDirection: 'column', gap: 10, paddingHorizontal: 22, paddingVertical: 14 },
  ctaGradient: {},
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
  cellOptions: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
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
