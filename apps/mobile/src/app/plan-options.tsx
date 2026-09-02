import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { Button } from '@/components/mise/button';
import { BottomSheetScrollView, BottomSheetView, Sheet, TrueSheetFooter, TrueSheetHeader } from '@/components/mise/sheet';
import { MiseSpinner } from '@/components/mise/spinner';
import { MiseSwitch } from '@/components/mise/switch';
import { ALL_MEAL_TYPES, type MealType } from '@/constants/meal-types';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useGenerateMealPlan, useMealPlan } from '@/hooks/use-meal-plan';
import { useHasActiveEntitlement } from '@/hooks/use-has-active-entitlement';
import { useEnabledMealTypes, useUpdateEnabledMealTypes } from '@/hooks/use-organization-settings';
import { usePressFeedback } from '@/hooks/usePressFeedback';
import { formatWeekRange, fromISODate, getVisibleWeekDates } from '@/lib/date-utils';
import { useReducedMotionFlag, colorTransition } from '@/lib/motion';
import { useToast } from '@/store/toast';

type CookingStyleKey = 'optimized' | 'balanced' | 'diverse';
type RuleKey = 'leftovers' | 'keepPlanned' | 'noRepeat';

// Reuse curves and "distinct ingredients" estimates are illustrative — the
// generate API turns cookingStyle into real guidance for the AI generator
// (premium orgs only; free orgs keep the plain randomized plan), but doesn't
// simulate this exact reuse curve.
const COOKING_STYLES: { key: CookingStyleKey; reuse: number[]; distinct: number }[] = [
  { key: 'optimized', reuse: [1, 0.95, 0.9, 0.85, 0.9, 0.8, 0.75], distinct: 9 },
  { key: 'balanced', reuse: [1, 0.8, 0.55, 0.8, 0.5, 0.7, 0.45], distinct: 14 },
  { key: 'diverse', reuse: [1, 0.45, 0.5, 0.4, 0.5, 0.42, 0.38], distinct: 19 },
];

const RULE_KEYS: RuleKey[] = ['leftovers', 'keepPlanned', 'noRepeat'];
const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function hexToRgb(hex: string) {
  const v = hex.replace('#', '');
  return { r: parseInt(v.slice(0, 2), 16), g: parseInt(v.slice(2, 4), 16), b: parseInt(v.slice(4, 6), 16) };
}

function mixColor(hex: string, base: string, t: number): string {
  const from = hexToRgb(base);
  const to = hexToRgb(hex);
  const r = Math.round(from.r + (to.r - from.r) * t);
  const g = Math.round(from.g + (to.g - from.g) * t);
  const b = Math.round(from.b + (to.b - from.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function PlanOptionsScreen() {
  const { t, i18n } = useTranslation();
  const { startDate: startDateParam } = useLocalSearchParams<{ startDate?: string; endDate?: string }>();
  const generateMutation = useGenerateMealPlan();
  const { showToast } = useToast();
  const planGenerating = generateMutation.isPending;
  const reduced = useReducedMotionFlag();
  const decrementServingsPress = usePressFeedback();
  const incrementServingsPress = usePressFeedback();

  const enabledMealTypes = useEnabledMealTypes();
  const updateEnabledMealTypesMutation = useUpdateEnabledMealTypes();
  // Free accounts still get a full auto-plan — cooking style, rules and
  // servings just stay locked at their sensible defaults below, so
  // generation reads as a randomly balanced week rather than a customized one.
  const { hasActiveEntitlement } = useHasActiveEntitlement();
  const advancedLocked = !hasActiveEntitlement;

  const weekDates = useMemo(
    () => getVisibleWeekDates(startDateParam ? fromISODate(startDateParam) : new Date()),
    [startDateParam],
  );
  const startDate = weekDates[0];
  const endDate = weekDates[weekDates.length - 1];
  const { data: plannedEntries = [] } = useMealPlan({ startDate, endDate });

  const [styleIndex, setStyleIndex] = useState(1);
  const [servings, setServings] = useState(4);
  const [rules, setRules] = useState<Record<RuleKey, boolean>>({
    leftovers: true,
    keepPlanned: true,
    noRepeat: true,
  });

  const style = COOKING_STYLES[styleIndex];
  const totalSlots = weekDates.length * enabledMealTypes.length;
  const slots = Math.max(0, totalSlots - (rules.keepPlanned ? plannedEntries.length : 0));

  function toggleMealType(type: MealType) {
    const isEnabled = enabledMealTypes.includes(type);
    if (isEnabled && enabledMealTypes.length === 1) {
      showToast(t('planOptions.keepOneMeal'));
      return;
    }
    const next = isEnabled ? enabledMealTypes.filter((m) => m !== type) : [...enabledMealTypes, type];
    updateEnabledMealTypesMutation.mutate(next, { onError: (error) => showToast(error.message) });
  }

  function toggleRule(key: RuleKey) {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleGenerate() {
    if (slots <= 0) return;
    generateMutation.mutate(
      {
        startDate,
        endDate,
        avoidRepeats: rules.noRepeat,
        cookingStyle: style.key,
        leftovers: rules.leftovers,
        keepPlanned: rules.keepPlanned,
      },
      {
        onSuccess: () => router.back(),
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <Sheet
      onDismiss={() => router.back()}
      detents={[0.86]}
      enablePanDownToClose={!planGenerating}
      scrollable={!planGenerating}
      header={
        planGenerating ? undefined : (
          <TrueSheetHeader>
            <Text style={styles.title}>{t('planOptions.title')}</Text>
            <Text style={styles.subtitle}>{formatWeekRange(weekDates, i18n.language)}</Text>
          </TrueSheetHeader>
        )
      }
      footer={
        planGenerating ? undefined : (
          <TrueSheetFooter>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLeft} numberOfLines={1}>
                {t('planOptions.subtitleIngredients', { count: style.distinct })}
              </Text>
              <Text style={styles.summaryRight}>{t('planOptions.summary', { count: servings })}</Text>
            </View>
            <Button
              testID="plan-options-generate"
              label={slots > 0 ? t('planOptions.generate', { count: slots }) : t('planOptions.nothingToPlan')}
              variant="gradient"
              disabled={slots <= 0}
              onPress={handleGenerate}
            />
          </TrueSheetFooter>
        )
      }>
      {planGenerating ? (
        <BottomSheetView style={styles.generating}>
          <MiseSpinner size={56} />
          <Text style={styles.generatingTitle}>{t('planOptions.generatingTitle')}</Text>
          <Text style={styles.generatingSubtitle}>{t('planOptions.generatingSubtitle')}</Text>
        </BottomSheetView>
      ) : (
        <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('planOptions.mealsToPlan')}</Text>
              <View style={styles.pillRowWrap}>
                {ALL_MEAL_TYPES.map((type) => {
                  const active = enabledMealTypes.includes(type);
                  return (
                    <AnimatedPressable
                      key={type}
                      onPress={() => toggleMealType(type)}
                      style={[
                        styles.togglePill,
                        active ? styles.togglePillActive : styles.togglePillOff,
                        colorTransition(reduced),
                      ]}>
                      <Text style={[styles.togglePillLabel, active && styles.togglePillLabelActive]}>
                        {t(`mealTypes.${type}`)}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>

            {advancedLocked ? (
              <Pressable
                testID="plan-options-premium-lock"
                style={styles.lockCard}
                // The sheet is a native modal presented above the whole app —
                // pushing a screen on top of it doesn't hide it, since
                // nothing tells the native sheet itself to close. Replacing
                // this route unmounts it (and with it, the presented sheet)
                // instead of just changing what's focused underneath.
                onPress={() => router.replace({ pathname: '/paywall', params: { dismissible: '1' } })}>
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={12} color="#fff" />
                  <Text style={styles.lockBadgeLabel}>{t('planOptions.premiumLock.badge')}</Text>
                </View>
                <Text style={styles.lockTitle}>{t('planOptions.premiumLock.title')}</Text>
                <Text style={styles.lockSubtitle}>{t('planOptions.premiumLock.subtitle')}</Text>
                <View style={styles.lockCta}>
                  <Text style={styles.lockCtaLabel}>{t('planOptions.premiumLock.cta')}</Text>
                  <Ionicons name="arrow-forward" size={14} color={MiseColors.brand} />
                </View>
              </Pressable>
            ) : (
              <>
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>{t('planOptions.cookingStyle.label')}</Text>
                    <Text style={styles.styleName}>{t(`planOptions.cookingStyle.${style.key}.name`)}</Text>
                  </View>

                  <View style={styles.bars}>
                    {style.reuse.map((v, i) => (
                      <View key={i} style={styles.barColumn}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: 8 + v * 34,
                              backgroundColor: i === 0 ? MiseColors.brand : mixColor(MiseColors.brand, '#EFE2D4', v),
                            },
                          ]}
                        />
                        <Text style={styles.barLabel}>{WEEKDAY_LETTERS[i]}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.pillRow}>
                    {COOKING_STYLES.map((s, i) => (
                      <AnimatedPressable
                        key={s.key}
                        onPress={() => setStyleIndex(i)}
                        style={[styles.pill, i === styleIndex && styles.pillActive, colorTransition(reduced)]}>
                        <Text style={[styles.pillLabel, i === styleIndex && styles.pillLabelActive]}>
                          {t(`planOptions.cookingStyle.${s.key}.label`)}
                        </Text>
                      </AnimatedPressable>
                    ))}
                  </View>

                  <Text style={styles.note}>{t(`planOptions.cookingStyle.${style.key}.note`)}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, styles.rulesLabel]}>{t('planOptions.rules.label')}</Text>
                  {RULE_KEYS.map((key) => (
                    <View key={key} style={styles.ruleRow}>
                      <View style={styles.ruleText}>
                        <Text style={styles.ruleLabel}>{t(`planOptions.rules.${key}.label`)}</Text>
                        <Text style={styles.ruleNote}>{t(`planOptions.rules.${key}.note`)}</Text>
                      </View>
                      <View style={styles.ruleSwitch}>
                        <MiseSwitch value={rules[key]} onValueChange={() => toggleRule(key)} />
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{t('planOptions.servings.label')}</Text>
                  <View style={styles.servingsRow}>
                    <AnimatedPressable
                      onPress={() => setServings((s) => Math.max(1, s - 1))}
                      onPressIn={decrementServingsPress.onPressIn}
                      onPressOut={decrementServingsPress.onPressOut}
                      style={[styles.servingsButton, decrementServingsPress.style]}>
                      <Text style={styles.servingsButtonLabel}>−</Text>
                    </AnimatedPressable>
                    <Text style={styles.servingsValue}>{servings}</Text>
                    <AnimatedPressable
                      onPress={() => setServings((s) => Math.min(10, s + 1))}
                      onPressIn={incrementServingsPress.onPressIn}
                      onPressOut={incrementServingsPress.onPressOut}
                      style={[styles.servingsButton, incrementServingsPress.style]}>
                      <Text style={styles.servingsButtonLabel}>+</Text>
                    </AnimatedPressable>
                    <Text style={styles.servingsNote}>
                      {t(rules.leftovers ? 'planOptions.servings.withLeftovers' : 'planOptions.servings.exact')}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </BottomSheetScrollView>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 25, color: MiseColors.ink },
  subtitle: { fontFamily: MiseFonts.bodyMedium, fontSize: 12, color: MiseColors.muted },
  scrollContent: { paddingTop: 6, paddingBottom: 24, gap: 22 },

  section: { gap: 11 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionLabel: { fontFamily: MiseFonts.bodyExtraBold, fontSize: 10, letterSpacing: 1, color: MiseColors.mutedLight },
  rulesLabel: { marginBottom: -2 },

  lockCard: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: MiseRadius.lg,
    borderWidth: 1.4,
    borderColor: MiseColors.borderFaint,
    borderStyle: 'dashed',
    backgroundColor: MiseColors.tint,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: MiseColors.brand,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 4,
  },
  lockBadgeLabel: { fontFamily: MiseFonts.bodyExtraBold, fontSize: 10.5, letterSpacing: 0.5, color: '#fff' },
  lockTitle: { fontFamily: MiseFonts.bodyBold, fontSize: 15, color: MiseColors.ink, textAlign: 'center' },
  lockSubtitle: { fontFamily: MiseFonts.body, fontSize: 12.5, lineHeight: 18, color: MiseColors.muted, textAlign: 'center' },
  lockCta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  lockCtaLabel: { fontFamily: MiseFonts.bodyBold, fontSize: 13, color: MiseColors.brand },

  styleName: { fontFamily: MiseFonts.bodyBold, fontSize: 12, color: MiseColors.brand },
  bars: { flexDirection: 'row', gap: 3, height: 56, alignItems: 'flex-end' },
  barColumn: { flex: 1, alignItems: 'center', gap: 5 },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 9.5, color: MiseColors.mutedLight },

  pillRow: { flexDirection: 'row', gap: 6 },
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: MiseRadius.md,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
  },
  pillActive: { backgroundColor: MiseColors.brand, borderColor: MiseColors.brand },
  pillLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 12.5, color: MiseColors.inkSoft },
  pillLabelActive: { color: '#fff' },

  note: {
    fontFamily: MiseFonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: MiseColors.inkSoft,
    backgroundColor: MiseColors.tint,
    borderRadius: MiseRadius.md,
    padding: 12,
  },

  pillRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  togglePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  togglePillOff: { borderWidth: 1, borderColor: MiseColors.borderFaint, borderStyle: 'dashed' },
  togglePillActive: { backgroundColor: MiseColors.brand },
  togglePillLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 12.5, color: MiseColors.inkSoft },
  togglePillLabelActive: { color: '#fff' },

  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MiseColors.borderSoft,
  },
  ruleText: { flex: 1, flexShrink: 1, minWidth: 0, gap: 2 },
  ruleSwitch: { flexShrink: 0 },
  ruleLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 14, color: MiseColors.ink },
  ruleNote: { fontFamily: MiseFonts.body, fontSize: 11.5, color: MiseColors.muted },

  servingsRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  servingsButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: MiseColors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsButtonLabel: { fontFamily: MiseFonts.bodyBold, fontSize: 19, color: MiseColors.ink },
  servingsValue: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 26, color: MiseColors.ink, minWidth: 22, textAlign: 'center' },
  servingsNote: { flex: 1, fontFamily: MiseFonts.bodyMedium, fontSize: 11.5, color: MiseColors.muted, textAlign: 'right' },

  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  summaryLeft: { flex: 1, fontFamily: MiseFonts.bodyMedium, fontSize: 11.5, color: MiseColors.muted },
  summaryRight: { fontFamily: MiseFonts.bodySemiBold, fontSize: 11.5, color: MiseColors.ink },

  generating: { alignItems: 'center' },
  generatingTitle: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 22, color: MiseColors.ink, marginTop: 22, marginBottom: 6 },
  generatingSubtitle: { fontFamily: MiseFonts.body, fontSize: 14, color: MiseColors.muted },
});
