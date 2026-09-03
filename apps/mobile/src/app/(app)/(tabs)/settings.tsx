import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { Button } from '@/components/mise/button';
import { CompactHeader, PageHeader, useScrollHeader } from '@/components/mise/scroll-header';
import { getTabBarScrollPadding } from '@/components/mise/tab-bar-metrics';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useLocalMode } from '@/hooks/use-local-mode';
import { usePressFeedback } from '@/hooks/usePressFeedback';
import { useActiveOrganization } from '@/lib/auth-client';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { data: isLocal } = useLocalMode();
  const { data: activeOrganization } = useActiveOrganization();

  const { onScroll, onHeaderLayout, compactStyle, compactShown } = useScrollHeader();
  const insets = useSafeAreaInsets();
  const householdName = isLocal ? t('settings.defaultName') : (activeOrganization?.name ?? t('settings.defaultName'));
  const householdSwitcherPress = usePressFeedback();
  const householdLinkPress = usePressFeedback();
  const editAccountPress = usePressFeedback();
  const preferencesPress = usePressFeedback();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Animated.ScrollView
        testID="settings-screen"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: getTabBarScrollPadding(insets.bottom) }}>
        <PageHeader onLayout={onHeaderLayout} title={t('settings.title')} subtitle={isLocal ? t('settings.eyebrow') : undefined} />
        <View style={styles.content}>

      {isLocal ? (
        <View style={styles.localBanner}>
          <Text style={styles.localBannerTitle}>{t('settings.localBannerTitle')}</Text>
          <Text style={styles.localBannerBody}>{t('settings.localBannerBody')}</Text>
          <Button
            label={t('settings.localCreateAccount')}
            onPress={() => router.push('/register')}
            style={styles.inviteButton}
          />
          <Text style={styles.localLogIn} onPress={() => router.push('/login')}>
            {t('settings.localLogIn')}
          </Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.defaultHouseholdLabel')}</Text>
          <AnimatedPressable
            testID="household-switcher"
            style={[styles.householdSwitcher, householdSwitcherPress.style]}
            onPress={() => router.push('/select-household')}
            onPressIn={householdSwitcherPress.onPressIn}
            onPressOut={householdSwitcherPress.onPressOut}>
            <Text style={styles.householdSwitcherLabel} numberOfLines={1}>
              {householdName}
            </Text>
            <Ionicons name="chevron-down" size={16} color={MiseColors.muted} />
          </AnimatedPressable>
          <Text style={styles.sectionDescription}>{t('settings.defaultHouseholdDescription')}</Text>
        </View>
      )}

      <View style={styles.card}>
        {isLocal ? null : (
          <AnimatedPressable
            testID="household-link"
            style={[styles.navRow, styles.navRowDivider, householdLinkPress.style]}
            onPress={() => router.push('/household')}
            onPressIn={householdLinkPress.onPressIn}
            onPressOut={householdLinkPress.onPressOut}>
            <Text style={styles.navRowLabel}>{t('household.title')}</Text>
            <Ionicons name="chevron-forward" size={18} color={MiseColors.muted} />
          </AnimatedPressable>
        )}

        {isLocal ? null : (
          <AnimatedPressable
            testID="edit-account-link"
            style={[styles.navRow, styles.navRowDivider, editAccountPress.style]}
            onPress={() => router.push('/edit-account')}
            onPressIn={editAccountPress.onPressIn}
            onPressOut={editAccountPress.onPressOut}>
            <Text style={styles.navRowLabel}>{t('settings.editAccount')}</Text>
            <Ionicons name="chevron-forward" size={18} color={MiseColors.muted} />
          </AnimatedPressable>
        )}

        <AnimatedPressable
          testID="preferences-link"
          style={[styles.navRow, preferencesPress.style]}
          onPress={() => router.push('/preferences')}
          onPressIn={preferencesPress.onPressIn}
          onPressOut={preferencesPress.onPressOut}>
          <Text style={styles.navRowLabel}>{t('settings.preferences')}</Text>
          <Ionicons name="chevron-forward" size={18} color={MiseColors.muted} />
        </AnimatedPressable>
      </View>
        </View>
      </Animated.ScrollView>

      <CompactHeader title={t('settings.title')} compactStyle={compactStyle} compactShown={compactShown} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { paddingHorizontal: 22, paddingTop: 18 },
  localBanner: {
    backgroundColor: MiseColors.tint,
    borderWidth: 1,
    borderColor: MiseColors.borderTint,
    borderRadius: MiseRadius.lg,
    padding: 16,
    marginBottom: 22,
  },
  localBannerTitle: { fontFamily: MiseFonts.bodyBold, fontSize: 15, color: MiseColors.brand, marginBottom: 6 },
  localBannerBody: {
    fontFamily: MiseFonts.body,
    fontSize: 13.5,
    color: MiseColors.inkSoft,
    lineHeight: 20,
    marginBottom: 14,
  },
  localLogIn: {
    textAlign: 'center',
    color: MiseColors.brand,
    fontFamily: MiseFonts.bodyBold,
    fontSize: 13.5,
  },
  inviteButton: { marginBottom: 18 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontFamily: MiseFonts.bodyExtraBold,
    fontSize: 10,
    letterSpacing: 1,
    color: MiseColors.mutedLight,
    marginBottom: 9,
  },
  householdSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 9,
    height: 50,
    paddingHorizontal: 15,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
  },
  householdSwitcherLabel: { flex: 1, minWidth: 0, color: MiseColors.ink, fontFamily: MiseFonts.bodySemiBold, fontSize: 14.5 },
  sectionDescription: {
    fontFamily: MiseFonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: MiseColors.muted,
    marginTop: 10,
  },
  card: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.lg,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  navRowDivider: { borderBottomWidth: 1, borderBottomColor: MiseColors.divider },
  navRowLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 14.5, color: MiseColors.ink },
});
