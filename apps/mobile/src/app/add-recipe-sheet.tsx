import { Ionicons } from '@expo/vector-icons';
import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, type Href } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetView, Sheet } from '@/components/mise/sheet';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';

export default function AddRecipeSheetScreen() {
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheetModal>(null);
  // The sheet closes itself (animated, in its own portal) before we leave
  // this route, then its onDismiss below does the actual navigation — so
  // there's never a screen swap racing the close animation.
  const nextHrefRef = useRef<Href | null>(null);

  function goTo(href: Href) {
    nextHrefRef.current = href;
    sheetRef.current?.dismiss();
  }

  function handleDismiss() {
    router.back();
    if (nextHrefRef.current) {
      router.push(nextHrefRef.current);
      nextHrefRef.current = null;
    }
  }

  return (
    <Sheet ref={sheetRef} onDismiss={handleDismiss}>
      <BottomSheetView>
      <Text style={styles.title}>{t('addRecipe.title')}</Text>
      <Text style={styles.subtitle}>{t('addRecipe.subtitle')}</Text>

      <View style={styles.rows}>
        <SheetRow
          icon="link"
          iconColor={MiseColors.brand}
          iconBg={MiseColors.tint}
          title={t('addRecipe.linkTitle')}
          subtitle={t('addRecipe.linkSubtitle')}
          onPress={() => goTo('/import')}
        />
        <SheetRow
          icon="share-social"
          iconColor={MiseColors.amber}
          iconBg={MiseColors.tintStrong}
          title={t('addRecipe.shareTitle')}
          subtitle={t('addRecipe.shareSubtitle')}
          onPress={() => goTo('/share-sheet')}
        />
        <SheetRow
          testID="add-recipe-manual-option"
          icon="create"
          iconColor={MiseColors.success}
          iconBg={MiseColors.successBg}
          title={t('addRecipe.manualTitle')}
          subtitle={t('addRecipe.manualSubtitle')}
          onPress={() => goTo('/manual')}
        />
      </View>
      </BottomSheetView>
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
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable accessibilityLabel={testID} testID={testID} onPress={onPress} style={styles.row}>
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
  title: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 25, color: MiseColors.ink, marginBottom: 4 },
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
