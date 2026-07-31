import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { EmptyState } from '@/components/mise/empty-state';
import { ShoppingTile } from '@/components/mise/shopping-tile';
import {
  SHOPPING_CATEGORIES,
  SHOPPING_CATEGORY_COLOR,
  SHOPPING_CATEGORY_KEY,
  type ShoppingCategory,
} from '@/constants/shopping-categories';
import { MiseColors, MiseFonts } from '@/constants/theme';
import { useShoppingItems, useToggleShoppingItem } from '@/hooks/use-shopping-list';

function categoryOf(item: { category: string }): ShoppingCategory {
  return (item.category as ShoppingCategory) in SHOPPING_CATEGORY_COLOR ? (item.category as ShoppingCategory) : 'Pantry';
}

export default function ListScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: shopping = [] } = useShoppingItems();
  const toggleMutation = useToggleShoppingItem();

  const groups = useMemo(() => {
    return SHOPPING_CATEGORIES.map((cat) => ({
      cat,
      items: shopping.filter((item) => item.category === cat && !item.checked),
    })).filter((g) => g.items.length);
  }, [shopping]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 140 }}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('shoppingScreen.eyebrow')}</Text>
        <Text style={styles.title}>{t('shoppingScreen.title')}</Text>
      </View>

      {shopping.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title={t('shoppingScreen.emptyTitle')}
          subtitle={t('shoppingScreen.emptySubtitle')}
          action={<Button label={t('shoppingScreen.addItem')} onPress={() => router.push('/add-shopping-item')} />}
        />
      ) : (
        <>
          <View style={styles.groups}>
            {groups.map((group) => (
              <Animated.View key={group.cat} exiting={FadeOut.duration(200)} layout={LinearTransition.springify().damping(16)}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>
                    {t(`shoppingCategories.${SHOPPING_CATEGORY_KEY[group.cat]}`).toUpperCase()}
                  </Text>
                  <Text style={styles.groupCount}>{group.items.length}</Text>
                  <View style={styles.groupDivider} />
                </View>
                <View style={styles.grid}>
                  {group.items.map((item) => (
                    <ShoppingTile
                      key={item.id}
                      name={item.name}
                      quantity={item.quantity}
                      category={categoryOf(item)}
                      checked={item.checked}
                      onPress={() => toggleMutation.mutate({ id: item.id, checked: !item.checked })}
                    />
                  ))}
                </View>
              </Animated.View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  header: { paddingHorizontal: 22, paddingBottom: 20 },
  eyebrow: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.muted },
  title: { fontFamily: MiseFonts.display, fontSize: 32, color: MiseColors.ink, marginTop: 2 },
  groups: { paddingHorizontal: 22, gap: 24 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  groupTitle: { fontFamily: MiseFonts.bodyExtraBold, fontSize: 12, color: MiseColors.ink, letterSpacing: 0.6 },
  groupCount: { fontFamily: MiseFonts.bodySemiBold, fontSize: 11, color: MiseColors.mutedLight },
  groupDivider: { flex: 1, height: 1, backgroundColor: MiseColors.divider },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
