import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/mise/button';
import { Sheet } from '@/components/mise/sheet';
import { ShoppingTile } from '@/components/mise/shopping-tile';
import { TextField } from '@/components/mise/text-field';
import {
  DEFAULT_SHOPPING_CATEGORY,
  SHOPPING_CATEGORIES,
  SHOPPING_CATEGORY_COLOR,
  SHOPPING_CATEGORY_KEY,
  type ShoppingCategory,
} from '@/constants/shopping-categories';
import { MiseColors, MiseFonts } from '@/constants/theme';
import { useCreateShoppingItem, useRecentShoppingItems, type RecentShoppingItem } from '@/hooks/use-shopping-list';
import { useToast } from '@/store/toast';

function categoryOf(item: RecentShoppingItem): ShoppingCategory {
  return (item.category as ShoppingCategory) in SHOPPING_CATEGORY_COLOR ? (item.category as ShoppingCategory) : 'Pantry';
}

export default function AddShoppingItemScreen() {
  const { t } = useTranslation();
  const createItemMutation = useCreateShoppingItem();
  const { data: recentItems = [] } = useRecentShoppingItems();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<ShoppingCategory>(DEFAULT_SHOPPING_CATEGORY);

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return [];
    return recentItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [recentItems, name]);

  function addItem(input: { name: string; quantity: string; category: string }) {
    createItemMutation.mutate(input, {
      onSuccess: () => {
        showToast(t('addShoppingItem.addedToast'));
        router.back();
      },
      onError: (error) => showToast(error.message),
    });
  }

  function handleAdd() {
    if (!name.trim()) return;
    addItem({ name: name.trim(), quantity: quantity.trim() || '1', category });
  }

  function handleQuickAdd(item: RecentShoppingItem) {
    addItem({ name: item.name, quantity: '1', category: item.category });
  }

  return (
    <Sheet onDismiss={() => router.back()} contentStyle={styles.sheetContent}>
      <Text style={styles.title}>{t('addShoppingItem.title')}</Text>
      <Text style={styles.subtitle}>{t('addShoppingItem.subtitle')}</Text>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <TextField
        value={name}
        onChangeText={setName}
        placeholder={t('addShoppingItem.searchPlaceholder')}
        icon={<Ionicons name="search" size={16} color={MiseColors.mutedLight} />}
        containerStyle={styles.field}
        autoFocus
      />

      {name.trim() ? (
        suggestions.length ? (
          <View style={styles.grid}>
            {suggestions.map((item) => (
              <ShoppingTile
                key={item.id}
                name={item.name}
                category={categoryOf(item)}
                onPress={() => handleQuickAdd(item)}
              />
            ))}
          </View>
        ) : null
      ) : recentItems.length ? (
        <>
          <Text style={styles.recentLabel}>{t('addShoppingItem.recentlyUsed')}</Text>
          <View style={styles.grid}>
            {recentItems.map((item) => (
              <ShoppingTile
                key={item.id}
                name={item.name}
                category={categoryOf(item)}
                onPress={() => handleQuickAdd(item)}
              />
            ))}
          </View>
        </>
      ) : null}

      <TextField
        label={t('addShoppingItem.quantityLabel')}
        value={quantity}
        onChangeText={setQuantity}
        placeholder={t('addShoppingItem.quantityPlaceholder')}
        containerStyle={styles.field}
      />

      <Text style={styles.categoryLabel}>{t('addShoppingItem.categoryLabel')}</Text>
      <View style={styles.categoryChips}>
        {SHOPPING_CATEGORIES.map((cat) => {
          const active = cat === category;
          return (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.categoryChip, active && styles.categoryChipActive]}>
              <Text style={[styles.categoryChipLabel, active && styles.categoryChipLabelActive]}>
                {t(`shoppingCategories.${SHOPPING_CATEGORY_KEY[cat]}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        label={t('addShoppingItem.addButton')}
        variant="gradient"
        onPress={handleAdd}
        disabled={!name.trim()}
        loading={createItemMutation.isPending}
      />
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: { maxHeight: '88%' },
  scroll: { flexShrink: 1 },
  title: { fontFamily: MiseFonts.display, fontSize: 25, color: MiseColors.ink, marginBottom: 4 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 14, lineHeight: 20, color: MiseColors.muted, marginBottom: 18 },
  recentLabel: {
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 13,
    color: MiseColors.inkSoft,
    marginBottom: 8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  field: { marginBottom: 14 },
  categoryLabel: {
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 13,
    color: MiseColors.inkSoft,
    marginBottom: 8,
  },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  categoryChip: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderFaint,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipActive: { backgroundColor: MiseColors.near, borderColor: MiseColors.near },
  categoryChipLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.inkSoft },
  categoryChipLabelActive: { color: '#fff' },
});
