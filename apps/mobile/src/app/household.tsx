import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/mise/back-header';
import { Button } from '@/components/mise/button';
import { MiseSpinner } from '@/components/mise/spinner';
import { MiseColors, MiseFonts, MiseRadius, RecipeAccentColors } from '@/constants/theme';
import { useActiveOrganization } from '@/lib/auth-client';

type MemberRow = {
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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: activeOrganization, isPending } = useActiveOrganization();
  const rows = useMemo<MemberRow[]>(() => {
    const members = activeOrganization?.members ?? [];
    const invitations = (activeOrganization?.invitations ?? []).filter((inv) => inv.status === 'pending');
    return [
      ...members.map((member, index) => ({
        key: member.id,
        name: member.user.name,
        sub: member.user.email,
        initials: initialsFor(member.user.name),
        color: RecipeAccentColors[index % RecipeAccentColors.length],
        role: (member.role === 'owner' || member.role === 'admin' ? member.role : 'member') as MemberRow['role'],
        pending: false,
      })),
      ...invitations.map((invitation) => ({
        key: invitation.id,
        name: invitation.email,
        sub: t('settings.invitationSent'),
        initials: '✦',
        color: MiseColors.muted,
        role: 'pending' as const,
        pending: true,
      })),
    ];
  }, [activeOrganization, t]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BackHeader title={t('household.title')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.members')}</Text>
          <Text style={styles.sectionCount}>{rows.length}</Text>
        </View>
        {isPending ? (
          <View style={styles.loading}>
            <MiseSpinner size={32} />
          </View>
        ) : (
          <View style={styles.card}>
            {rows.map((row, index) => (
              <MemberRowView key={row.key} row={row} isLast={index === rows.length - 1} />
            ))}
          </View>
        )}
        <Button testID="household-invite-button" label={t('settings.invite')} onPress={() => router.push('/invite')} />
      </ScrollView>
    </View>
  );
}

function MemberRowView({ row, isLast }: { row: MemberRow; isLast: boolean }) {
  const { t } = useTranslation();
  const roleStyle = row.pending
    ? { backgroundColor: MiseColors.tintStrong, color: MiseColors.brand }
    : row.role === 'owner'
      ? { backgroundColor: MiseColors.tint, color: MiseColors.brand }
      : { backgroundColor: MiseColors.successBg, color: MiseColors.success };
  const roleText =
    row.role === 'owner'
      ? t('settings.roleOwner')
      : row.role === 'admin'
        ? t('settings.roleEditor')
        : row.role === 'member'
          ? t('settings.roleMember')
          : t('settings.rolePending');

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
      <Text style={[styles.rolePill, { backgroundColor: roleStyle.backgroundColor, color: roleStyle.color }]}>{roleText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 26 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 20, color: MiseColors.ink },
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
});
