import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { MiseSpinner } from '@/components/mise/spinner';
import { MiseColors, MiseFonts, MiseRadius, RecipeAccentColors } from '@/constants/theme';
import { useMealPlan } from '@/hooks/use-meal-plan';
import { useRecipes } from '@/hooks/use-recipes';
import { useShoppingItems } from '@/hooks/use-shopping-list';
import { signOut, useActiveOrganization } from '@/lib/auth-client';
import { getCurrentWeekDates } from '@/lib/date-utils';
import { setAppLocale, SUPPORTED_LOCALES, type AppLocale } from '@/lib/i18n';

type Row = {
  key: string;
  name: string;
  sub: string;
  role: 'owner' | 'admin' | 'member' | 'pending';
  initials: string;
  color: string;
  pending: boolean;
};

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export default function HouseholdScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: activeOrganization, isPending } = useActiveOrganization();
  const { data: recipes = [] } = useRecipes();
  const { data: shopping = [] } = useShoppingItems();
  const weekDates = useMemo(() => getCurrentWeekDates(), []);
  const { data: mealPlanEntries = [] } = useMealPlan({
    startDate: weekDates[0],
    endDate: weekDates[weekDates.length - 1],
  });
  const plannedMeals = mealPlanEntries.length;

  const rows = useMemo<Row[]>(() => {
    const members = activeOrganization?.members ?? [];
    const invitations = (activeOrganization?.invitations ?? []).filter((inv) => inv.status === 'pending');
    return [
      ...members.map((member, index) => ({
        key: member.id,
        name: member.user.name,
        sub: member.user.email,
        initials: initialsFor(member.user.name),
        color: RecipeAccentColors[index % RecipeAccentColors.length],
        role: (member.role === 'owner' || member.role === 'admin' ? member.role : 'member') as Row['role'],
        pending: false,
      })),
      ...invitations.map((invitation) => ({
        key: invitation.id,
        name: invitation.email,
        sub: t('household.invitationSent'),
        initials: '✦',
        color: MiseColors.muted,
        role: 'pending' as Row['role'],
        pending: true,
      })),
    ];
  }, [activeOrganization, t]);

  const logoutMutation = useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => router.replace('/'),
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 22, paddingBottom: 108 }}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('household.eyebrow')}</Text>
        <Text style={styles.title}>{activeOrganization?.name ?? t('household.defaultName')}</Text>
      </View>

      <LinearGradient
        colors={[MiseColors.brandDark, MiseColors.brand]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.statCard}>
        <Text style={styles.statCardLabel}>{t('household.sharedLabel')}</Text>
        <View style={styles.statRow}>
          <Stat value={recipes.length} label={t('household.statRecipes')} />
          <Stat value={plannedMeals} label={t('household.statPlannedMeals')} />
          <Stat value={shopping.length} label={t('household.statListItems')} />
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('household.members')}</Text>
        <Text style={styles.sectionCount}>{rows.length}</Text>
      </View>

      {isPending ? (
        <View style={styles.loading}>
          <MiseSpinner size={32} />
        </View>
      ) : (
        <View style={styles.card}>
          {rows.map((row, index) => (
            <MemberRow key={row.key} row={row} isLast={index === rows.length - 1} />
          ))}
        </View>
      )}

      <Button label={t('household.invite')} onPress={() => router.push('/invite')} style={styles.inviteButton} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('household.language')}</Text>
      </View>
      <View style={styles.languageRow}>
        {SUPPORTED_LOCALES.map((locale) => {
          const active = i18n.language === locale;
          return (
            <Pressable
              key={locale}
              onPress={() => setAppLocale(locale as AppLocale)}
              style={[styles.languageChip, active && styles.languageChipActive]}>
              <Text style={[styles.languageChipLabel, active && styles.languageChipLabelActive]}>
                {locale === 'en' ? t('household.languageEnglish') : t('household.languageGerman')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.logout} onPress={() => logoutMutation.mutate()}>
        {logoutMutation.isPending ? t('household.loggingOut') : t('household.logOut')}
      </Text>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MemberRow({ row, isLast }: { row: Row; isLast: boolean }) {
  const { t } = useTranslation();
  const roleStyle = row.pending
    ? { backgroundColor: MiseColors.tintStrong, color: MiseColors.brand }
    : row.role === 'owner'
      ? { backgroundColor: MiseColors.tint, color: MiseColors.brand }
      : { backgroundColor: MiseColors.successBg, color: MiseColors.success };
  const roleText =
    row.role === 'owner'
      ? t('household.roleOwner')
      : row.role === 'admin'
        ? t('household.roleEditor')
        : row.role === 'member'
          ? t('household.roleMember')
          : t('household.rolePending');

  return (
    <View style={[styles.memberRow, !isLast && styles.memberRowDivider]}>
      <View style={[styles.avatar, { backgroundColor: row.color }]}>
        <Text style={styles.avatarLabel}>{row.initials}</Text>
      </View>
      <View style={styles.memberBody}>
        <Text style={styles.memberName} numberOfLines={1}>
          {row.name}
        </Text>
        <Text style={styles.memberSub} numberOfLines={1}>
          {row.sub}
        </Text>
      </View>
      <Text style={[styles.rolePill, { backgroundColor: roleStyle.backgroundColor, color: roleStyle.color }]}>
        {roleText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  header: { paddingTop: 0, paddingBottom: 18 },
  eyebrow: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.muted },
  title: { fontFamily: MiseFonts.display, fontSize: 32, color: MiseColors.ink, marginTop: 2 },
  statCard: {
    borderRadius: MiseRadius.xxl,
    padding: 18,
    paddingBottom: 16,
    marginBottom: 22,
    shadowColor: MiseColors.brandDark,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  statCardLabel: { color: '#fff', opacity: 0.85, fontFamily: MiseFonts.body, fontSize: 13 },
  statRow: { flexDirection: 'row', gap: 22, marginTop: 12 },
  statValue: { color: '#fff', fontFamily: MiseFonts.bodyExtraBold, fontSize: 22 },
  statLabel: { color: '#fff', opacity: 0.8, fontFamily: MiseFonts.body, fontSize: 11.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontFamily: MiseFonts.display, fontSize: 22, color: MiseColors.ink },
  sectionCount: { color: MiseColors.muted, fontFamily: MiseFonts.body, fontSize: 13 },
  loading: { paddingVertical: 30, alignItems: 'center' },
  card: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.lg,
    overflow: 'hidden',
    marginBottom: 18,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 },
  memberRowDivider: { borderBottomWidth: 1, borderBottomColor: MiseColors.divider },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: '#fff', fontFamily: MiseFonts.bodyBold, fontSize: 14 },
  memberBody: { flex: 1, minWidth: 0 },
  memberName: { fontFamily: MiseFonts.bodyBold, fontSize: 14.5, color: MiseColors.ink },
  memberSub: { fontFamily: MiseFonts.body, fontSize: 12.5, color: MiseColors.muted },
  rolePill: {
    fontFamily: MiseFonts.bodyBold,
    fontSize: 11.5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  inviteButton: { marginBottom: 18 },
  languageRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  languageChip: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  languageChipActive: { backgroundColor: MiseColors.near, borderColor: MiseColors.near },
  languageChipLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.inkSoft },
  languageChipLabelActive: { color: '#fff' },
  logout: {
    textAlign: 'center',
    color: MiseColors.muted,
    fontFamily: MiseFonts.bodyBold,
    fontSize: 14,
  },
});
