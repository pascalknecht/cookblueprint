import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { BottomSheetView, Sheet, type SheetRef } from '@/components/mise/sheet';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useDeleteRecipe } from '@/hooks/use-recipes';
import { usePressFeedback } from '@/hooks/usePressFeedback';
import { useToast } from '@/store/toast';

export default function RecipeOptionsScreen() {
  const { t } = useTranslation();
  const { id, title, color } = useLocalSearchParams<{ id: string; title: string; color: string }>();
  const deleteMutation = useDeleteRecipe();
  const { showToast } = useToast();
  const sheetRef = useRef<SheetRef>(null);
  const nextHrefRef = useRef<Href | null>(null);
  const leaveDetailRef = useRef(false);
  const editPress = usePressFeedback();
  const deletePress = usePressFeedback();

  function goTo(href: Href) {
    nextHrefRef.current = href;
    sheetRef.current?.dismiss();
  }

  function handleDismiss() {
    router.back();
    if (leaveDetailRef.current) {
      leaveDetailRef.current = false;
      router.back();
      return;
    }
    if (nextHrefRef.current) {
      router.push(nextHrefRef.current);
      nextHrefRef.current = null;
    }
  }

  function handleDelete() {
    Alert.alert(t('recipeDetail.deleteConfirmTitle'), t('recipeDetail.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('recipeDetail.deleteConfirmDelete'),
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              showToast(t('recipeDetail.deletedToast'));
              leaveDetailRef.current = true;
              sheetRef.current?.dismiss();
            },
            onError: () => showToast(t('recipeDetail.deleteError')),
          });
        },
      },
    ]);
  }

  return (
    <Sheet ref={sheetRef} onDismiss={handleDismiss}>
      <BottomSheetView>
        <View style={styles.header}>
          <View style={[styles.swatch, { backgroundColor: color }]} />
          <View style={styles.headerBody}>
            <Text style={styles.eyebrow}>{t('recipeDetail.options')}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

        <AnimatedPressable
          testID="recipe-options-edit"
          accessibilityLabel={t('editRecipe.title')}
          style={[styles.action, editPress.style]}
          onPress={() => goTo({ pathname: '/edit-recipe', params: { id } })}
          onPressIn={editPress.onPressIn}
          onPressOut={editPress.onPressOut}>
          <Ionicons name="create-outline" size={20} color={MiseColors.ink} />
          <Text style={styles.actionLabel}>{t('editRecipe.title')}</Text>
        </AnimatedPressable>

        <AnimatedPressable
          testID="recipe-options-delete"
          accessibilityLabel={t('recipeDetail.delete')}
          style={[styles.action, deletePress.style]}
          onPress={handleDelete}
          onPressIn={deletePress.onPressIn}
          onPressOut={deletePress.onPressOut}
          disabled={deleteMutation.isPending}>
          <Ionicons name="trash-outline" size={20} color={MiseColors.brand} />
          <Text style={[styles.actionLabel, styles.destructiveLabel]}>{t('recipeDetail.delete')}</Text>
        </AnimatedPressable>
      </BottomSheetView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 18 },
  swatch: { width: 44, height: 44, borderRadius: 12 },
  headerBody: { flex: 1, minWidth: 0 },
  eyebrow: {
    fontFamily: MiseFonts.bodyBold,
    fontSize: 10,
    color: MiseColors.mutedLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: { fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking, fontSize: 20, color: MiseColors.ink },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    padding: 14,
    marginBottom: 10,
  },
  actionLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 15, color: MiseColors.ink },
  destructiveLabel: { color: MiseColors.brand },
});
