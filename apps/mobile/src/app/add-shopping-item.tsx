import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { BottomSheetScrollView, BottomSheetTextInput, Sheet } from "@/components/mise/sheet";
import { ShoppingTile } from "@/components/mise/shopping-tile";
import { TextField } from "@/components/mise/text-field";
import {
  DEFAULT_SHOPPING_CATEGORY,
  SHOPPING_CATEGORY_COLOR,
  type ShoppingCategory,
} from "@/constants/shopping-categories";
import {
  GROCERY_SUGGESTIONS,
  inferShoppingCategory,
} from "@/constants/grocery-suggestions";
import { MiseColors, MiseFonts } from "@/constants/theme";
import {
  useCreateShoppingItem,
  useRecentShoppingItems,
  type RecentShoppingItem,
} from "@/hooks/use-shopping-list";
import { useToast } from "@/store/toast";

function categoryOf(item: RecentShoppingItem): ShoppingCategory {
  return (item.category as ShoppingCategory) in SHOPPING_CATEGORY_COLOR
    ? (item.category as ShoppingCategory)
    : "Pantry";
}

type ShoppingSuggestion = {
  id: string;
  name: string;
  category: ShoppingCategory;
};

export default function AddShoppingItemScreen() {
  const { t, i18n } = useTranslation();
  const createItemMutation = useCreateShoppingItem();
  const { data: recentItems = [] } = useRecentShoppingItems();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const nameInputRef = useRef<TextInput>(null);

  // Focus once the sheet has actually settled at its open snap point,
  // instead of via autoFocus — opening the keyboard at the same time as
  // mount makes gorhom's dynamic content-height measurement miscalculate.
  const handleSheetChange = useCallback((index: number) => {
    if (index === 0) nameInputRef.current?.focus();
  }, []);

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return [];

    const matchingRecent = recentItems
      .filter((item) => item.name.toLowerCase().includes(q))
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: categoryOf(item),
      }));
    const recentNames = new Set(
      matchingRecent.map((item) => item.name.toLowerCase()),
    );
    const matchingCatalog = GROCERY_SUGGESTIONS.filter(
      (item) =>
        !recentNames.has(item.name.toLowerCase()) &&
        item.aliases.some((alias) => alias.includes(q)),
    ).map((item) => ({
      id: `catalog-${item.name}`,
      name: i18n.language.startsWith("de")
        ? (item.aliases.at(-1) ?? item.name)
        : item.name,
      category: item.category,
    }));

    const matches = [...matchingRecent, ...matchingCatalog];
    // Whatever the user typed is always a valid, tappable option — even when
    // it matches nothing in the catalog — so there's always a way forward.
    const hasExactMatch = matches.some((item) => item.name.toLowerCase() === q);
    const freeform: ShoppingSuggestion[] = hasExactMatch
      ? []
      : [
          {
            id: "freeform",
            name: name.trim(),
            category: inferShoppingCategory(name) ?? DEFAULT_SHOPPING_CATEGORY,
          },
        ];

    return [...freeform, ...matches].slice(0, 12);
  }, [recentItems, name, i18n.language]);

  function handleQuickAdd(item: ShoppingSuggestion) {
    createItemMutation.mutate(
      { name: item.name, quantity: "1", category: item.category },
      {
        onSuccess: () => showToast(t("addShoppingItem.addedToast")),
        onError: (error) => showToast(error.message),
      },
    );
    setName("");
  }

  return (
    <Sheet
      onDismiss={() => router.back()}
      onChange={handleSheetChange}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustPan">
      <BottomSheetScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t("addShoppingItem.title")}</Text>
        <Text style={styles.subtitle}>{t("addShoppingItem.subtitle")}</Text>

        <TextField
          ref={nameInputRef}
          InputComponent={BottomSheetTextInput}
          testID="shopping-item-name-input"
          value={name}
          onChangeText={setName}
          placeholder={t("addShoppingItem.searchPlaceholder")}
          icon={<Ionicons name="search" size={16} color={MiseColors.mutedLight} />}
          containerStyle={styles.field}
        />

        {name.trim() ? (
          <View style={styles.grid}>
            {suggestions.map((item) => (
              <ShoppingTile
                key={item.id}
                name={item.name}
                category={item.category}
                onPress={() => handleQuickAdd(item)}
              />
            ))}
          </View>
        ) : recentItems.length ? (
          <>
            <Text style={styles.recentLabel}>{t("addShoppingItem.recentlyUsed")}</Text>
            <View style={styles.grid}>
              {recentItems.slice(0, 6).map((item) => (
                <ShoppingTile
                  key={item.id}
                  name={item.name}
                  category={categoryOf(item)}
                  onPress={() =>
                    handleQuickAdd({ id: item.id, name: item.name, category: categoryOf(item) })
                  }
                />
              ))}
            </View>
          </>
        ) : null}
      </BottomSheetScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: MiseFonts.display, letterSpacing: MiseFonts.displayTracking,
    fontSize: 25,
    color: MiseColors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: MiseFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: MiseColors.muted,
    marginBottom: 18,
  },
  recentLabel: {
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 13,
    color: MiseColors.inkSoft,
    marginBottom: 8,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  field: { marginBottom: 14 },
});
