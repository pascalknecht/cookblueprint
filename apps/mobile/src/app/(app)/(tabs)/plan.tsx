import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { Button } from '@/components/mise/button';
import { CompactHeader, PageHeader, useScrollHeader } from '@/components/mise/scroll-header';
import { getTabBarScrollPadding } from '@/components/mise/tab-bar-metrics';
import { type MealType } from '@/constants/meal-types';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useAssignMeal, useDeleteMealAssignment, useMealPlan, type MealPlanEntry } from '@/hooks/use-meal-plan';
import { useEnabledMealTypes } from '@/hooks/use-organization-settings';
import { useAddMealPlanToShoppingList } from '@/hooks/use-shopping-list';
import { usePressFeedback } from '@/hooks/usePressFeedback';
import { dayOfMonth, formatWeekRange, fromISODate, getVisibleWeekDates, isSameDate, toISODate, weekdayShort } from '@/lib/date-utils';
import { useReducedMotionFlag } from '@/lib/motion';
import { useToast } from '@/store/toast';

type CellBounds = { x: number; y: number; width: number; height: number };

// Haptics are a nice-to-have layered on top of the visual feedback, never
// the only signal — a missing/unlinked native module must not surface as a
// disruptive uncaught-promise error over the drag gesture.
function safeImpact(style: Haptics.ImpactFeedbackStyle) {
  Haptics.impactAsync(style).catch(() => {});
}

export default function PlanScreen() {
  const { t, i18n } = useTranslation();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = useMemo(() => {
    const reference = new Date();
    reference.setDate(reference.getDate() + weekOffset * 7);
    return getVisibleWeekDates(reference);
  }, [weekOffset]);
  const startDate = weekDates[0];
  const endDate = weekDates[weekDates.length - 1];
  const { data: entries = [] } = useMealPlan({ startDate, endDate });
  const addWeekToListMutation = useAddMealPlanToShoppingList();
  const assignMealMutation = useAssignMeal();
  const deleteMealMutation = useDeleteMealAssignment();
  const { showToast } = useToast();
  const today = new Date();
  const reduced = useReducedMotionFlag();
  const { onScroll, onHeaderLayout, compactStyle, compactShown } = useScrollHeader();
  const insets = useSafeAreaInsets();

  // Drag-to-reorder: a cell is dragged by key ("YYYY-MM-DD|mealType"). Scroll
  // is disabled for the gesture's duration so all cell bounds — measured once
  // via measureInWindow — stay valid without needing scroll-offset math.
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [dragPreview, setDragPreview] = useState<{ meal: MealType; recipe: MealPlanEntry['recipe'] } | null>(null);
  const dragKey = useSharedValue<string | null>(null);
  const targetKey = useSharedValue<string | null>(null);
  const dragTranslate = useSharedValue({ x: 0, y: 0 });
  const dragOrigin = useSharedValue<CellBounds>({ x: 0, y: 0, width: 0, height: 0 });
  const cellLayouts = useSharedValue<Record<string, CellBounds>>({});
  // Accumulated on the JS thread in a plain ref, then pushed to the shared
  // value — measureCell fires many times in a burst (one per cell on
  // mount/layout), and each call reading-modifying-writing the shared value
  // directly races: rapid successive .set() calls don't reliably see each
  // other's just-written state, so most updates get clobbered.
  const cellLayoutsMap = useRef<Record<string, CellBounds>>({});
  const cellRefsMap = useRef<Map<string, View>>(new Map());
  const screenRef = useRef<View>(null);
  // measureInWindow gives coordinates in the OS window, but the overlay is
  // positioned inside this screen's own View — which the BlankStack
  // navigator wraps in its own transform, so window coordinates don't map
  // 1:1 to this screen's local space. Measuring the screen's own window
  // origin lets the overlay style subtract it back out.
  const screenOrigin = useSharedValue({ x: 0, y: 0 });

  const measureCell = useCallback(
    (key: string) => {
      cellRefsMap.current.get(key)?.measureInWindow((x, y, width, height) => {
        cellLayoutsMap.current = { ...cellLayoutsMap.current, [key]: { x, y, width, height } };
        cellLayouts.set(cellLayoutsMap.current);
      });
    },
    [cellLayouts],
  );

  const measureScreen = useCallback(() => {
    screenRef.current?.measureInWindow((x, y) => screenOrigin.set({ x, y }));
  }, [screenOrigin]);
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

  const handleDragStart = useCallback(
    (key: string) => {
      const [dateISO, meal] = key.split('|') as [string, MealType];
      const entry = entriesByDate.get(dateISO)?.get(meal);
      if (!entry) return;
      const origin = cellLayouts.get()[key];
      if (origin) dragOrigin.set(origin);
      dragTranslate.set({ x: 0, y: 0 });
      setDragPreview({ meal, recipe: entry.recipe });
      setScrollEnabled(false);
    },
    [entriesByDate, cellLayouts, dragOrigin, dragTranslate, screenOrigin],
  );

  const handleDragEnd = useCallback(
    (sourceKey: string, targetKeyValue: string | null) => {
      setScrollEnabled(true);
      setDragPreview(null);
      if (!targetKeyValue || targetKeyValue === sourceKey) return;

      const [sourceDateISO, sourceMeal] = sourceKey.split('|') as [string, MealType];
      const [targetDateISO, targetMeal] = targetKeyValue.split('|') as [string, MealType];
      const sourceEntry = entriesByDate.get(sourceDateISO)?.get(sourceMeal);
      if (!sourceEntry) return;
      const targetEntry = entriesByDate.get(targetDateISO)?.get(targetMeal);

      assignMealMutation.mutate({ date: fromISODate(targetDateISO), mealType: targetMeal, recipeId: sourceEntry.recipe.id });
      if (targetEntry) {
        assignMealMutation.mutate({ date: fromISODate(sourceDateISO), mealType: sourceMeal, recipeId: targetEntry.recipe.id });
        showToast(t('planScreen.mealSwapped'));
      } else {
        deleteMealMutation.mutate(sourceEntry.id);
        showToast(t('planScreen.mealMoved'));
      }
      safeImpact(Haptics.ImpactFeedbackStyle.Light);
    },
    [entriesByDate, assignMealMutation, deleteMealMutation, showToast, t],
  );

  const overlayStyle = useAnimatedStyle(() => {
    const origin = dragOrigin.get();
    const translate = dragTranslate.get();
    const screen = screenOrigin.get();
    return {
      left: origin.x - screen.x,
      top: origin.y - screen.y,
      width: origin.width,
      height: origin.height,
      transform: [{ translateX: translate.x }, { translateY: translate.y }],
    };
  });

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
    <View ref={screenRef} onLayout={measureScreen} style={styles.screen}>
      <StatusBar style="light" />
      <Animated.ScrollView
        testID="plan-screen"
        contentContainerStyle={{ paddingBottom: getTabBarScrollPadding(insets.bottom) }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollEnabled={scrollEnabled}>
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
                    const cellKeyStr = `${dateISO}|${meal}`;
                    const entry = dayMeals?.get(meal);
                    return (
                      <View
                        key={meal}
                        ref={(el) => {
                          if (el) cellRefsMap.current.set(cellKeyStr, el);
                          else cellRefsMap.current.delete(cellKeyStr);
                        }}
                        collapsable={false}
                        onLayout={() => measureCell(cellKeyStr)}>
                        {entry ? (
                          <MealCell
                            cellKey={cellKeyStr}
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
                            dragKey={dragKey}
                            targetKey={targetKey}
                            cellLayouts={cellLayouts}
                            dragTranslate={dragTranslate}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                          />
                        ) : (
                          <EmptyMealCell
                            cellKey={cellKeyStr}
                            testID={`meal-cell-empty-${dayIndex}-${meal}`}
                            meal={meal}
                            onPress={() => router.push({ pathname: '/pick-recipe', params: { date: dateISO, meal } })}
                            dragKey={dragKey}
                            targetKey={targetKey}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </Animated.View>
      </Animated.ScrollView>

      {dragPreview ? (
        <Animated.View pointerEvents="none" style={[styles.cellTouchable, styles.dragOverlay, overlayStyle]}>
          <View style={[styles.cellSwatch, { backgroundColor: dragPreview.recipe.color }]} />
          <View style={styles.cellBody}>
            <Text style={styles.cellMeal}>{t(`mealTypes.${dragPreview.meal}`)}</Text>
            <Text style={styles.cellTitle} numberOfLines={1}>
              {dragPreview.recipe.title}
            </Text>
          </View>
          <Text style={styles.cellTime}>{t('planScreen.minutesShort', { count: dragPreview.recipe.time })}</Text>
        </Animated.View>
      ) : null}

      <CompactHeader title={t('planScreen.title')} compactStyle={compactStyle} compactShown={compactShown} action={weekActions} />
    </View>
  );
}

function MealCell({
  cellKey,
  meal,
  recipe,
  onPress,
  onOptionsPress,
  dragKey,
  targetKey,
  cellLayouts,
  dragTranslate,
  onDragStart,
  onDragEnd,
}: {
  cellKey: string;
  meal: MealType;
  recipe: { title: string; color: string; time: number };
  onPress: () => void;
  onOptionsPress: () => void;
  dragKey: SharedValue<string | null>;
  targetKey: SharedValue<string | null>;
  cellLayouts: SharedValue<Record<string, CellBounds>>;
  dragTranslate: SharedValue<{ x: number; y: number }>;
  onDragStart: (key: string) => void;
  onDragEnd: (sourceKey: string, targetKeyValue: string | null) => void;
}) {
  const { t } = useTranslation();
  const { isPressed } = usePressFeedback();

  // Pan only activates after a stationary hold, so it never competes with the
  // screen's own vertical scroll (a scroll starts with immediate movement,
  // which fails that requirement and falls through to the ScrollView).
  const pan = Gesture.Pan()
    .activateAfterLongPress(350)
    .onStart(() => {
      dragKey.set(cellKey);
      targetKey.set(cellKey);
      dragTranslate.set({ x: 0, y: 0 });
      scheduleOnRN(safeImpact, Haptics.ImpactFeedbackStyle.Medium);
      scheduleOnRN(onDragStart, cellKey);
    })
    .onUpdate((e) => {
      dragTranslate.set({ x: e.translationX, y: e.translationY });
      const layouts = cellLayouts.get();
      let found: string | null = null;
      for (const key in layouts) {
        const box = layouts[key];
        if (e.absoluteX >= box.x && e.absoluteX <= box.x + box.width && e.absoluteY >= box.y && e.absoluteY <= box.y + box.height) {
          found = key;
          break;
        }
      }
      if (found !== targetKey.get()) targetKey.set(found);
    })
    .onEnd(() => {
      const target = targetKey.get();
      dragKey.set(null);
      targetKey.set(null);
      scheduleOnRN(onDragEnd, cellKey, target);
    });

  const tap = Gesture.Tap()
    .onBegin(() => isPressed.set(true))
    .onEnd((_e, success) => {
      if (success) scheduleOnRN(onPress);
    })
    .onFinalize(() => isPressed.set(false));

  const optionsTap = Gesture.Tap().onEnd((_e, success) => {
    if (success) scheduleOnRN(onOptionsPress);
  });

  const cellStyle = useAnimatedStyle(() => {
    const isSource = dragKey.get() === cellKey;
    const isTargetOfOther = !isSource && dragKey.get() !== null && targetKey.get() === cellKey;
    return {
      opacity: withTiming(isSource ? 0.4 : 1, { duration: 120 }),
      borderColor: withTiming(isTargetOfOther ? MiseColors.brand : MiseColors.borderSoft, { duration: 120 }),
      transform: [{ scale: withTiming(isSource ? 1.04 : isPressed.get() ? 0.97 : 1, { duration: 120 }) }],
    };
  });

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <Animated.View style={[styles.cellTouchable, cellStyle]}>
        <View style={[styles.cellSwatch, { backgroundColor: recipe.color }]} />
        <View style={styles.cellBody}>
          <Text style={styles.cellMeal}>{t(`mealTypes.${meal}`)}</Text>
          <Text style={styles.cellTitle} numberOfLines={1}>
            {recipe.title}
          </Text>
        </View>
        <Text style={styles.cellTime}>{t('planScreen.minutesShort', { count: recipe.time })}</Text>
        <GestureDetector gesture={optionsTap}>
          <Animated.View hitSlop={8} style={styles.cellOptions}>
            <Ionicons name="ellipsis-horizontal" size={16} color={MiseColors.mutedLight} />
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  );
}

function EmptyMealCell({
  cellKey,
  meal,
  onPress,
  testID,
  dragKey,
  targetKey,
}: {
  cellKey: string;
  meal: MealType;
  onPress: () => void;
  testID?: string;
  dragKey: SharedValue<string | null>;
  targetKey: SharedValue<string | null>;
}) {
  const { t } = useTranslation();
  const { onPressIn, onPressOut, style: pressStyle } = usePressFeedback();

  const targetStyle = useAnimatedStyle(() => {
    const isTarget = dragKey.get() !== null && targetKey.get() === cellKey;
    return {
      borderColor: withTiming(isTarget ? MiseColors.brand : '#DED4C5', { duration: 120 }),
      backgroundColor: withTiming(isTarget ? `${MiseColors.brand}14` : 'transparent', { duration: 120 }),
    };
  });

  return (
    <AnimatedPressable
      testID={testID}
      style={[styles.emptyCell, pressStyle, targetStyle]}
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
  dragOverlay: {
    position: 'absolute',
    zIndex: 50,
    shadowColor: '#5A3C14',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
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
