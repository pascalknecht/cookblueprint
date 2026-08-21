import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { Button } from '@/components/mise/button';
import { CompactHeader, PageHeader, useScrollHeader } from '@/components/mise/scroll-header';
import { type MealType } from '@/constants/meal-types';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useMealPlan, type MealPlanEntry } from '@/hooks/use-meal-plan';
import { useEnabledMealTypes } from '@/hooks/use-organization-settings';
import { useAddMealPlanToShoppingList } from '@/hooks/use-shopping-list';
import { usePressFeedback } from '@/hooks/usePressFeedback';
import { dayOfMonth, formatWeekRange, getCurrentWeekDates, isSameDate, toISODate, weekdayShort } from '@/lib/date-utils';
import { useReducedMotionFlag } from '@/lib/motion';
import { useToast } from '@/store/toast';

export default function PlanScreen() {
  const { t, i18n } = useTranslation();
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
  const reduced = useReducedMotionFlag();
  const { onScroll, onHeaderLayout, compactStyle, compactShown } = useScrollHeader();
  const lastWeekPress = usePressFeedback();
  const nextWeekPress = usePressFeedback();
  const weekActions = (
    <View style={styles.weekActions}>
      <AnimatedPressable
        accessibilityLabel={t('planScreen.lastWeek')}
        hitSlop={6}
        onPress={() => setWeekOffset((offset) => offset - 1)}
        onPressIn={lastWeekPress.onPressIn}
        onPressOut={lastWeekPress.onPressOut}
        style={[styles.weekAction, lastWeekPress.style]}>
        <Ionicons name="chevron-back" size={16} color="#FFF9F3" />
      </AnimatedPressable>
      <AnimatedPressable
        accessibilityLabel={t('planScreen.nextWeek')}
        hitSlop={6}
        onPress={() => setWeekOffset((offset) => offset + 1)}
        onPressIn={nextWeekPress.onPressIn}
        onPressOut={nextWeekPress.onPressOut}
        style={[styles.weekAction, nextWeekPress.style]}>
        <Ionicons name="chevron-forward" size={16} color="#FFF9F3" />
      </AnimatedPressable>
    </View>
  );

  const mealTypes = useEnabledMealTypes();
  const plannedMealCount = entries.length;
  const totalMealCount = weekDates.length * mealTypes.length;

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
    if (plannedMealCount === 0) {
      showToast(t('planScreen.noMealsToAdd'));
      return;
    }
    addWeekToListMutation.mutate(
      { startDate, endDate },
      {
        onSuccess: () => showToast(t('planScreen.addedWeekToList')),
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Animated.ScrollView
        testID="plan-screen"
        contentContainerStyle={{ paddingBottom: 108 }}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <PageHeader
          onLayout={onHeaderLayout}
          title={t('planScreen.title')}
          subtitle={formatWeekRange(weekDates, i18n.language)}
          action={weekActions}>
          {weekOffset !== 0 ? (
            <Pressable hitSlop={8} onPress={() => setWeekOffset(0)}>
              <Text style={styles.todayLinkLabel}>{t('planScreen.backToThisWeek')}</Text>
            </Pressable>
          ) : null}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: `${totalMealCount ? (plannedMealCount / totalMealCount) * 100 : 0}%` },
                  {
                    transitionProperty: 'width',
                    transitionDuration: reduced ? 0 : 260,
                    transitionTimingFunction: 'ease-out',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>{t('planScreen.plannedProgress', { planned: plannedMealCount, total: totalMealCount })}</Text>
          </View>
          <View style={styles.mastheadActions}>
            <Button
              label={t('planScreen.autoPlan')}
              variant="gradient"
              onPress={() =>
                router.push({
                  pathname: '/plan-options',
                  params: { startDate: toISODate(startDate), endDate: toISODate(endDate) },
                })
              }
              style={styles.autoPlanButton}
            />
            <Pressable
              accessibilityLabel={t('planScreen.addToList')}
              disabled={addWeekToListMutation.isPending}
              onPress={handleAddWeekToList}
              style={[styles.listAction, addWeekToListMutation.isPending && styles.listActionDisabled]}>
              <Ionicons name="cart-outline" size={21} color="#FFF9F3" />
            </Pressable>
          </View>
        </PageHeader>

        <Animated.View key={weekOffset} entering={reduced ? undefined : FadeIn.duration(180)} style={styles.week}>
          {weekDates.map((date, dayIndex) => {
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
                        testID={`meal-cell-empty-${dayIndex}-${meal}`}
                        meal={meal}
                        onPress={() => router.push({ pathname: '/pick-recipe', params: { date: dateISO, meal } })}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </Animated.View>
      </Animated.ScrollView>

      <CompactHeader title={t('planScreen.title')} compactStyle={compactStyle} compactShown={compactShown} action={weekActions} />
    </View>
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
  const { onPressIn, onPressOut, style: pressStyle } = usePressFeedback();
  return (
    <AnimatedPressable style={[styles.cellTouchable, pressStyle]} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
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
    </AnimatedPressable>
  );
}

function EmptyMealCell({
  meal,
  onPress,
  testID,
}: {
  meal: MealType;
  onPress: () => void;
  testID?: string;
}) {
  const { t } = useTranslation();
  const { onPressIn, onPressOut, style: pressStyle } = usePressFeedback();
  return (
    <AnimatedPressable
      testID={testID}
      style={[styles.emptyCell, pressStyle]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconLabel}>＋</Text>
      </View>
      <Text style={styles.emptyLabel}>{t('planScreen.addMeal', { meal: t(`mealTypes.${meal}`) })}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  weekActions: { flexDirection: 'row', gap: 8 },
  weekAction: {
    alignItems: 'center',
    backgroundColor: '#30251E',
    borderColor: '#5B493D',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  todayLinkLabel: { color: '#E88861', fontFamily: MiseFonts.bodyBold, fontSize: 12.5, marginTop: 8 },
  progressRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 16 },
  progressTrack: { backgroundColor: '#4A3A30', flex: 1, height: 4 },
  progressFill: { backgroundColor: '#E88861', height: 4 },
  progressLabel: { color: '#D7B49D', fontFamily: MiseFonts.bodyMedium, fontSize: 11.5 },
  mastheadActions: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 16 },
  autoPlanButton: { flex: 1 },
  listAction: {
    alignItems: 'center',
    borderColor: '#5B493D',
    borderRadius: 14,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  listActionDisabled: { opacity: 0.5 },
  week: { paddingTop: 16, paddingHorizontal: 22, gap: 14 },
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
