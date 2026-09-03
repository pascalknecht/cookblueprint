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
import { TAB_BAR_HEIGHT, getTabBarBottomGap, getTabBarScrollPadding } from '@/components/mise/tab-bar-metrics';
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

  const tabBarHeight = TAB_BAR_HEIGHT + getTabBarBottomGap(insets.bottom);
  const addItemPress = usePressFeedback();
  const addItemOverlay = ADD_ITEM_BAR_HEIGHT + ADD_ITEM_BAR_GAP;

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
        contentContainerStyle={{ paddingBottom: getTabBarScrollPadding(insets.bottom, addItemOverlay) }}>
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
        ) : groups.length === 0 ? (
          // Every item exists but is checked — checked items never render in
          // the grouped grid below, so without this the screen would just go
          // blank instead of confirming the list is actually done.
          <EmptyState
            icon="checkmark-circle-outline"
            title={t('shoppingScreen.allCheckedTitle')}
            subtitle={t('shoppingScreen.allCheckedSubtitle')}
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
        style={[styles.addItemBar, { bottom: tabBarHeight + ADD_ITEM_BAR_GAP }, addItemPress.style]}
        onPress={() => router.push('/add-shopping-item')}
        onPressIn={addItemPress.onPressIn}
        onPressOut={addItemPress.onPressOut}>
        <Ionicons name="search" size={16} color={MiseColors.mutedLight} />
        {/* Decoy field — never actually typed into (no value/onChangeText,
            showSoftInputOnFocus disabled). It exists purely for the visual
            "search bar" look. The wrapping View's pointerEvents="none" routes
            every tap straight to the Pressable's onPress above instead of
            letting the native EditText capture it for its own cursor
            placement — pointerEvents="none" on the TextInput itself doesn't
            reliably stop that, since it handles its own touch dispatch. A
            direct-tap-triggers-onFocus approach was tried here before and was
            unreliable: this view's Android-level focus survives the round
            trip through the sheet's separate dialog window without a real
            blur/focus cycle, so a second tap produced no new focus event to
            react to. */}
        <View pointerEvents="none" style={styles.addItemInputWrapper}>
          <TextInput
            placeholder={t('nav.addItemPlaceholder')}
            placeholderTextColor={MiseColors.mutedLight}
            style={styles.addItemInput}
            showSoftInputOnFocus={false}
          />
        </View>
      </AnimatedPressable>
    </View>
  );
}

const ADD_ITEM_BAR_HEIGHT = 50;
const ADD_ITEM_BAR_GAP = 12;

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
    height: ADD_ITEM_BAR_HEIGHT,
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
  addItemInputWrapper: { flex: 1 },
  addItemInput: { fontFamily: MiseFonts.body, fontSize: 14.5, color: MiseColors.ink },
});
