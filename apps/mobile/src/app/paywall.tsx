import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Purchases, { PACKAGE_TYPE, type PurchasesError, type PurchasesPackage } from 'react-native-purchases';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useMountEffect } from '@/hooks/use-mount-effect';
import { signOut, useSession } from '@/lib/auth-client';
import { useReducedMotionFlag } from '@/lib/motion';
import { useToast } from '@/store/toast';

function isPurchasesError(error: unknown): error is PurchasesError {
  return typeof error === 'object' && error !== null && 'userCancelled' in error;
}

const HERO_HEIGHT = 172;
// How much slower the hero scrolls than the content, in [0, 1] — matches the
// recipe detail page's parallax (see recipe/[id].tsx).
const PARALLAX_FACTOR = 0.5;

const FEATURE_LIST = [
  { titleKey: 'featureCookingStyle', descKey: 'featureCookingStyleDesc' },
  { titleKey: 'featureEffort', descKey: 'featureEffortDesc' },
  { titleKey: 'featureRules', descKey: 'featureRulesDesc' },
  { titleKey: 'featureServings', descKey: 'featureServingsDesc' },
] as const;

// Free-trial pricing (introPrice.price === 0) is a per-product store config,
// not something this app can toggle — so unlike the reference design's
// on/off trial switch, trial terms just live in each package's own card.
function trialDays(intro: { periodUnit: string; periodNumberOfUnits: number }): number | null {
  if (intro.periodUnit === 'DAY') return intro.periodNumberOfUnits;
  if (intro.periodUnit === 'WEEK') return intro.periodNumberOfUnits * 7;
  return null;
}

// Two modes, chosen by the `dismissible` param:
// - Dismissible (the only way in today): reached from an optional
//   premium-feature upsell (e.g. the advanced auto-plan lock) while already
//   inside the free app — closing it just returns to whatever screen offered
//   the upgrade. Registration and login both go straight into the app now;
//   neither forces this screen.
// - Not dismissible (default when the param is absent): kept for a future
//   forced gate — e.g. a lapsed-entitlement wall — should the app ever need
//   one again. Starting a trial or logging out are the only ways past it.
export default function PaywallScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { data: session } = useSession();
  const { dismissible } = useLocalSearchParams<{ dismissible?: string }>();
  const isDismissible = dismissible === '1';
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);
  // The CTA lives in a footer pinned outside the ScrollView (so it's always
  // reachable on short phones without scrolling) — the scroll content needs
  // to reserve exactly that much bottom space, measured rather than guessed
  // since it varies by locale (the German legal copy wraps to more lines).
  const [footerHeight, setFooterHeight] = useState(0);
  const reduced = useReducedMotionFlag();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const parallaxStyle = useAnimatedStyle(() => {
    if (reduced) return {};
    const y = scrollY.value;
    if (y < 0) {
      return { transform: [{ translateY: y / 2 }, { scale: 1 - y / HERO_HEIGHT }] };
    }
    return { transform: [{ translateY: y * (1 - PARALLAX_FACTOR) }] };
  });

  const offeringsQuery = useQuery({
    queryKey: ['revenuecat-current-offering'],
    queryFn: async () => {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages ?? [];
    },
  });

  const packages = offeringsQuery.data ?? [];
  const selectedPackage =
    packages.find((pkg) => pkg.identifier === selectedIdentifier) ?? packages[0];
  const selectedHasTrial = !!selectedPackage?.product.introPrice && selectedPackage.product.introPrice.price === 0;

  // The annual package's savings only mean something next to a shorter
  // package's price — comparing weekly-equivalents works regardless of
  // whether that shorter package is weekly or monthly.
  const annualPackage = packages.find((pkg) => pkg.packageType === PACKAGE_TYPE.ANNUAL);
  const comparisonPackage = packages.find(
    (pkg) => pkg.packageType !== PACKAGE_TYPE.ANNUAL && pkg.product.pricePerWeek,
  );
  const savePercent =
    annualPackage?.product.pricePerWeek && comparisonPackage?.product.pricePerWeek
      ? Math.round((1 - annualPackage.product.pricePerWeek / comparisonPackage.product.pricePerWeek) * 100)
      : null;

  // Block Android's hardware/gesture back button from escaping the paywall —
  // the swipe-back gesture is already off (see app.json), this covers the
  // physical/soft back button too. Skipped in dismissible mode, where
  // leaving is the point.
  useMountEffect(() => {
    if (isDismissible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  });

  const purchaseMutation = useMutation({
    mutationFn: (pkg: PurchasesPackage) => Purchases.purchasePackage(pkg),
    onSuccess: () => {
      // Dismissible: back to whatever screen offered the upgrade, now
      // unlocked. Otherwise: right after registering (no session yet — still
      // needs email verification) or an already-signed-in account.
      if (isDismissible) {
        router.back();
        return;
      }
      router.replace(session ? '/(tabs)/recipes' : '/check-email');
    },
    onError: (error: unknown) => {
      if (isPurchasesError(error) && error.userCancelled) return;
      showToast(t('paywall.purchaseError'));
    },
  });

  async function handleLogOut() {
    await signOut();
    router.replace('/');
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: footerHeight + 16 }}>
        <Animated.View style={[styles.hero, parallaxStyle]}>
          <Image
            source={require('@/assets/images/welcome/pasta.jpg')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(20,12,8,0.05)', 'rgba(20,12,8,0.35)', 'rgba(20,12,8,0.88)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.heroTitle}>{t('paywall.title')}</Text>
        </Animated.View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>

          <View style={styles.featureList}>
            {FEATURE_LIST.map((feature) => (
              <View key={feature.titleKey} style={styles.featureRow}>
                <View style={styles.featureCheck}>
                  <Ionicons name="checkmark" size={13} color="#fff" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{t(`paywall.${feature.titleKey}`)}</Text>
                  <Text style={styles.featureDesc}>{t(`paywall.${feature.descKey}`)}</Text>
                </View>
              </View>
            ))}
          </View>

          {offeringsQuery.isPending ? (
            <ActivityIndicator style={styles.loading} color={MiseColors.brand} />
          ) : offeringsQuery.isError || packages.length === 0 ? (
            <View style={styles.errorBlock}>
              <Text style={styles.error}>{t('paywall.loadError')}</Text>
              <Button
                testID="paywall-retry-button"
                label={t('paywall.retryButton')}
                variant="secondary"
                onPress={() => offeringsQuery.refetch()}
                loading={offeringsQuery.isFetching}
              />
            </View>
          ) : (
            <View style={styles.packages}>
              {packages.map((pkg) => {
                const isSelected = pkg.identifier === selectedPackage?.identifier;
                const intro = pkg.product.introPrice;
                const hasTrial = !!intro && intro.price === 0;
                const days = hasTrial ? trialDays(intro) : null;
                const periodShort = t(`paywall.periodShort.${pkg.packageType}`, { defaultValue: '' });
                const isAnnual = pkg.packageType === PACKAGE_TYPE.ANNUAL;
                const weeklyEquivalent =
                  !hasTrial && pkg.product.pricePerWeekString && pkg.packageType !== PACKAGE_TYPE.WEEKLY
                    ? pkg.product.pricePerWeekString
                    : null;

                return (
                  <AnimatedPressable
                    key={pkg.identifier}
                    testID={`paywall-package-${pkg.identifier}`}
                    onPress={() => setSelectedIdentifier(pkg.identifier)}
                    style={[styles.packageCard, isSelected && styles.packageCardSelected]}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageLabel}>
                        {hasTrial
                          ? days
                            ? t('paywall.freeTrialLabel', { count: days })
                            : t('paywall.freeTrialGeneric')
                          : t(`paywall.periodLabel.${pkg.packageType}`, { defaultValue: pkg.product.title })}
                      </Text>
                      {weeklyEquivalent ? (
                        <Text style={styles.packageSub}>{t('paywall.perWeekEquivalent', { price: weeklyEquivalent })}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.packagePrice}>
                      {hasTrial
                        ? t('paywall.thenPerPeriod', { price: pkg.product.priceString, period: periodShort })
                        : pkg.product.priceString}
                    </Text>
                    {isAnnual && savePercent && savePercent > 0 ? (
                      <View style={styles.saveBadge}>
                        <Text style={styles.saveBadgeLabel}>{t('paywall.savePercent', { percent: savePercent })}</Text>
                      </View>
                    ) : null}
                  </AnimatedPressable>
                );
              })}
            </View>
          )}

          {session ? (
            <Text testID="paywall-logout-button" style={styles.logOut} onPress={handleLogOut}>
              {t('paywall.logOut')}
            </Text>
          ) : null}
        </View>
      </Animated.ScrollView>

      {isDismissible ? (
        <IconButton
          name="close"
          variant="translucent"
          size={38}
          accessibilityLabel={t('paywall.close')}
          onPress={() => router.back()}
          style={[styles.closeButton, { top: insets.top + 12 }]}
        />
      ) : null}

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}
        onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}>
        <Button
          testID="paywall-subscribe-button"
          label={selectedHasTrial ? t('paywall.ctaTrial') : t('paywall.ctaSubscribe')}
          variant="gradient"
          onPress={() => selectedPackage && purchaseMutation.mutate(selectedPackage)}
          disabled={!selectedPackage}
          loading={purchaseMutation.isPending}
        />
        <Text style={styles.legalLinks}>{t('paywall.legalLinks')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  hero: {
    height: HERO_HEIGHT,
    paddingHorizontal: 22,
    paddingBottom: 16,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: MiseColors.near,
  },
  closeButton: { position: 'absolute', left: 22, zIndex: 10 },
  heroTitle: {
    color: '#fff',
    fontFamily: MiseFonts.display,
    letterSpacing: MiseFonts.displayTracking,
    fontSize: 32,
    lineHeight: 34,
  },
  content: { paddingHorizontal: 22, paddingTop: 18 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 14, color: MiseColors.muted, marginBottom: 16, textAlign: 'center' },
  featureList: { gap: 10, marginBottom: 20 },
  featureRow: { flexDirection: 'row', gap: 12 },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: MiseColors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  featureText: { flex: 1, gap: 1 },
  featureTitle: { fontFamily: MiseFonts.bodyBold, fontSize: 14.5, color: MiseColors.ink },
  featureDesc: { fontFamily: MiseFonts.body, fontSize: 12.5, color: MiseColors.muted },
  loading: { marginTop: 24 },
  errorBlock: { alignItems: 'stretch', gap: 14, marginTop: 24 },
  error: { fontFamily: MiseFonts.body, fontSize: 14, color: MiseColors.muted, textAlign: 'center' },
  packages: { gap: 12 },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: MiseRadius.lg,
    borderWidth: 1.5,
    borderColor: MiseColors.border,
    backgroundColor: MiseColors.card,
  },
  packageCardSelected: { borderColor: MiseColors.brand, backgroundColor: MiseColors.tint },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: MiseColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: MiseColors.brand },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: MiseColors.brand },
  packageInfo: { flex: 1, gap: 2 },
  packageLabel: { fontFamily: MiseFonts.bodyBold, fontSize: 15.5, color: MiseColors.ink },
  packageSub: { fontFamily: MiseFonts.body, fontSize: 12.5, color: MiseColors.muted },
  packagePrice: { fontFamily: MiseFonts.bodyBold, fontSize: 15, color: MiseColors.ink },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: MiseColors.brand,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  saveBadgeLabel: { fontFamily: MiseFonts.bodyExtraBold, fontSize: 10.5, color: '#fff' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingTop: 12,
    gap: 6,
    backgroundColor: MiseColors.background,
    borderTopWidth: 1,
    borderTopColor: MiseColors.borderSoft,
  },
  legalLinks: {
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 12,
    color: MiseColors.muted,
    textAlign: 'center',
  },
  logOut: {
    textAlign: 'center',
    marginTop: 18,
    color: MiseColors.muted,
    fontFamily: MiseFonts.bodyBold,
    fontSize: 14,
  },
});
