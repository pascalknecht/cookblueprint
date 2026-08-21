import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { withTiming, type ExitAnimationsValues } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/mise/animated-pressable';
import { Button } from '@/components/mise/button';
import { EmptyState } from '@/components/mise/empty-state';
import { IconButton } from '@/components/mise/icon-button';
import { CompactHeader, PageHeader, useScrollHeader } from '@/components/mise/scroll-header';
import { ShoppingTile } from '@/components/mise/shopping-tile';
import { TAB_BAR_HEIGHT } from '@/components/mise/tab-bar';
import { SHOPPING_CATEGORY_COLOR, SHOPPING_CATEGORY_KEY, type ShoppingCategory } from '@/constants/shopping-categories';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useShoppingCategoryOrder } from '@/hooks/use-organization-settings';
import { useShoppingItems, useToggleShoppingItem } from '@/hooks/use-shopping-list';
import { usePressFeedback } from '@/hooks/usePressFeedback';

function categoryOf(item: { category: string }): ShoppingCategory {
  return (item.category as ShoppingCategory) in SHOPPING_CATEGORY_COLOR ? (item.category as ShoppingCategory) : 'Pantry';
}

function collapseOut(values: ExitAnimationsValues) {
  'worklet';
  return {
    initialValues: { opacity: 1, height: values.currentHeight },
    animations: {
      opacity: withTiming(0, { duration: 200 }),
      height: withTiming(0, { duration: 200 }),
    },
  };
}

export default function ListScreen() {
  const { t } = useTranslation();
  const { data: shopping = [] } = useShoppingItems();
  const toggleMutation = useToggleShoppingItem();
  const categoryOrder = useShoppingCategoryOrder();
  const { onScroll, onHeaderLayout, compactStyle, compactShown } = useScrollHeader();
  const insets = useSafeAreaInsets();

  // Keep in sync with MiseTabBar's own bottom-gap logic so the add-item bar clears the pill consistently.
  const tabBarHeight = TAB_BAR_HEIGHT + Math.max(insets.bottom, 16);
  const addItemPress = usePressFeedback();

  const groups = useMemo(() => {
    return categoryOrder
      .map((cat) => ({
        cat,
        items: shopping.filter((item) => item.category === cat && !item.checked),
      }))
      .filter((g) => g.items.length);
  }, [shopping, categoryOrder]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Animated.ScrollView
        testID="list-screen"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 140 }}>
        <PageHeader
          onLayout={onHeaderLayout}
          title={t('shoppingScreen.title')}
          subtitle={t('shoppingScreen.eyebrow')}
          action={
            <IconButton
              name="settings-outline"
              variant="translucent"
              size={42}
              color="#FFF9F3"
              style={styles.settingsButton}
              onPress={() => router.push('/shopping-category-settings')}
            />
          }
        />

        {shopping.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title={t('shoppingScreen.emptyTitle')}
            subtitle={t('shoppingScreen.emptySubtitle')}
            action={<Button label={t('shoppingScreen.addItem')} onPress={() => router.push('/add-shopping-item')} />}
            style={styles.emptyState}
          />
        ) : (
          <View style={styles.groups}>
            {groups.map((group) => (
              <Animated.View key={group.cat} exiting={collapseOut} style={styles.group}>
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
        )}
      </Animated.ScrollView>

      <CompactHeader
        title={t('shoppingScreen.title')}
        compactStyle={compactStyle}
        compactShown={compactShown}
        action={
          <IconButton
            name="settings-outline"
            variant="translucent"
            size={36}
            color="#FFF9F3"
            style={styles.settingsButton}
            onPress={() => router.push('/shopping-category-settings')}
          />
        }
      />

      <AnimatedPressable
        testID="shopping-add-item-bar"
        style={[styles.addItemBar, { bottom: tabBarHeight + 12 }, addItemPress.style]}
        onPress={() => router.push('/add-shopping-item')}
        onPressIn={addItemPress.onPressIn}
        onPressOut={addItemPress.onPressOut}>
        <Ionicons name="search" size={16} color={MiseColors.mutedLight} />
        <TextInput
          placeholder={t('nav.addItemPlaceholder')}
          placeholderTextColor={MiseColors.mutedLight}
          style={styles.addItemInput}
          showSoftInputOnFocus={false}
          onFocus={() => router.push('/add-shopping-item')}
        />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  settingsButton: {
    backgroundColor: 'rgba(255,249,243,0.14)',
    shadowOpacity: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  emptyState: { marginTop: 16 },
  groups: { paddingTop: 16, paddingHorizontal: 22, gap: 24 },
  group: { overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  groupTitle: { fontFamily: MiseFonts.bodyExtraBold, fontSize: 12, color: MiseColors.ink, letterSpacing: 0.6 },
  groupCount: { fontFamily: MiseFonts.bodySemiBold, fontSize: 11, color: MiseColors.mutedLight },
  groupDivider: { flex: 1, height: 1, backgroundColor: MiseColors.divider },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  addItemBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: MiseRadius.md,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    shadowColor: '#5A3C14',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addItemInput: { flex: 1, fontFamily: MiseFonts.body, fontSize: 14.5, color: MiseColors.ink },
});
