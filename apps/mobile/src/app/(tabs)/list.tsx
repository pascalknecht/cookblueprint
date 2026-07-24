import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { ShoppingItem, useClearCheckedItems, useShoppingItems, useToggleShoppingItem } from '@/hooks/use-shopping-list';
import { useToast } from '@/store/toast';

const CATEGORY_ORDER = ['Produce', 'Dairy & Eggs', 'Meat & Fish', 'Bakery', 'Pantry'];

export default function ListScreen() {
  const insets = useSafeAreaInsets();
  const { data: shopping = [] } = useShoppingItems();
  const toggleMutation = useToggleShoppingItem();
  const clearCheckedMutation = useClearCheckedItems();
  const { showToast } = useToast();

  const groups = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({ cat, items: shopping.filter((item) => item.category === cat) })).filter(
      (g) => g.items.length,
    );
  }, [shopping]);

  const left = shopping.filter((x) => !x.checked).length;
  const done = shopping.filter((x) => x.checked).length;
  const progress = shopping.length ? Math.round((done / shopping.length) * 100) : 0;

  function handleClearChecked() {
    const checkedIds = shopping.filter((x) => x.checked).map((x) => x.id);
    if (!checkedIds.length) return;
    clearCheckedMutation.mutate(checkedIds, {
      onSuccess: () => showToast('Cleared checked items'),
      onError: (error) => showToast(error.message),
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 108 }}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Shared list</Text>
        <Text style={styles.title}>Shopping</Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{left} left</Text>
        <Pressable onPress={handleClearChecked} style={styles.clearButton}>
          <Text style={styles.clearLabel}>Clear done</Text>
        </Pressable>
      </View>

      <View style={styles.groups}>
        {groups.map((group) => (
          <View key={group.cat}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group.cat.toUpperCase()}</Text>
              <Text style={styles.groupCount}>{group.items.length}</Text>
              <View style={styles.groupDivider} />
            </View>
            <View style={styles.card}>
              {group.items.map((item, index) => (
                <ShoppingRow
                  key={item.id}
                  item={item}
                  isLast={index === group.items.length - 1}
                  onToggle={() => toggleMutation.mutate({ id: item.id, checked: !item.checked })}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ShoppingRow({ item, isLast, onToggle }: { item: ShoppingItem; isLast: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
      </View>
      <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>{item.name}</Text>
      <Text style={styles.itemQty}>{item.quantity}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  header: { paddingHorizontal: 22, paddingBottom: 6 },
  eyebrow: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.muted },
  title: { fontFamily: MiseFonts.display, fontSize: 32, color: MiseColors.ink, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 22, paddingVertical: 12 },
  progressTrack: { height: 8, width: 120, borderRadius: 99, backgroundColor: '#EDE4D8', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: MiseColors.success, borderRadius: 99 },
  progressLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 12.5, color: MiseColors.muted },
  clearButton: { marginLeft: 'auto' },
  clearLabel: { color: MiseColors.brand, fontFamily: MiseFonts.bodyBold, fontSize: 13 },
  groups: { paddingHorizontal: 22, gap: 20 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  groupTitle: { fontFamily: MiseFonts.bodyExtraBold, fontSize: 12, color: MiseColors.ink, letterSpacing: 0.6 },
  groupCount: { fontFamily: MiseFonts.bodySemiBold, fontSize: 11, color: MiseColors.mutedLight },
  groupDivider: { flex: 1, height: 1, backgroundColor: MiseColors.divider },
  card: {
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.lg,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 15 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: MiseColors.divider },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#DDD3C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: MiseColors.success, borderColor: MiseColors.success },
  itemName: { flex: 1, fontFamily: MiseFonts.body, fontSize: 14.5, color: MiseColors.ink },
  itemNameChecked: { color: MiseColors.mutedLight, textDecorationLine: 'line-through' },
  itemQty: { fontFamily: MiseFonts.body, fontSize: 13, color: MiseColors.mutedLight },
});
