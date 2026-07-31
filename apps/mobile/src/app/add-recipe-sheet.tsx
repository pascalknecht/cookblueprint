import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/mise/sheet';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';

export default function AddRecipeSheetScreen() {
  const { t } = useTranslation();
  return (
    <Sheet onDismiss={() => router.back()}>
      <Text style={styles.title}>{t('addRecipe.title')}</Text>
      <Text style={styles.subtitle}>{t('addRecipe.subtitle')}</Text>

      <View style={styles.rows}>
        <SheetRow
          icon="link"
          iconColor={MiseColors.brand}
          iconBg={MiseColors.tint}
          title={t('addRecipe.linkTitle')}
          subtitle={t('addRecipe.linkSubtitle')}
          onPress={() => router.replace('/import')}
        />
        <SheetRow
          icon="share-social"
          iconColor={MiseColors.amber}
          iconBg={MiseColors.tintStrong}
          title={t('addRecipe.shareTitle')}
          subtitle={t('addRecipe.shareSubtitle')}
          onPress={() => router.replace('/share-sheet')}
        />
        <SheetRow
          icon="create"
          iconColor={MiseColors.success}
          iconBg={MiseColors.successBg}
          title={t('addRecipe.manualTitle')}
          subtitle={t('addRecipe.manualSubtitle')}
          onPress={() => router.replace('/manual')}
        />
      </View>
    </Sheet>
  );
}

function SheetRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#C9BEB0" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: MiseFonts.display, fontSize: 25, color: MiseColors.ink, marginBottom: 4 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 14, color: MiseColors.muted, marginBottom: 18 },
  rows: { gap: 11 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.lg,
    padding: 15,
    paddingHorizontal: 16,
  },
  rowIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: MiseFonts.bodyBold, fontSize: 15, color: MiseColors.ink },
  rowSubtitle: { fontFamily: MiseFonts.body, fontSize: 12.5, color: MiseColors.muted },
});
