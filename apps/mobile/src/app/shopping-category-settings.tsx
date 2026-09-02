import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";

import { BottomSheetView, Sheet, type SheetRef } from "@/components/mise/sheet";
import {
  SHOPPING_CATEGORY_COLOR,
  SHOPPING_CATEGORY_ICON,
  SHOPPING_CATEGORY_KEY,
  type ShoppingCategory,
} from "@/constants/shopping-categories";
import { MiseColors, MiseFonts, MiseRadius } from "@/constants/theme";
import {
  useShoppingCategoryOrder,
  useUpdateShoppingCategoryOrder,
} from "@/hooks/use-organization-settings";

const ROW_HEIGHT = 62;
const ROW_GAP = 10;
const ROW_SLOT = ROW_HEIGHT + ROW_GAP;

export default function ShoppingCategorySettingsScreen() {
  const { t } = useTranslation();
  const sheetRef = useRef<SheetRef>(null);
  const order = useShoppingCategoryOrder();
  const updateMutation = useUpdateShoppingCategoryOrder();

  // Seeded once — the list is only ever reordered from this screen, so there's
  // no external order change to reconcile with mid-drag.
  const positions = useSharedValue<Record<string, number>>(
    Object.fromEntries(order.map((cat, index) => [cat, index])),
  );

  function handleDragEnd(finalPositions: Record<string, number>) {
    const next = [...order].sort((a, b) => finalPositions[a] - finalPositions[b]);
    updateMutation.mutate(next);
  }

  return (
    <Sheet ref={sheetRef} onDismiss={() => router.back()}>
      <GestureHandlerRootView style={styles.gestureRoot}>
        <BottomSheetView style={styles.headerText}>
          <Text style={styles.title}>{t("shoppingCategorySettings.title")}</Text>
          <Text style={styles.subtitle}>{t("shoppingCategorySettings.subtitle")}</Text>
        </BottomSheetView>
        {/* Not BottomSheetScrollView: nested inside TrueSheet's content on
            Android, its scroll viewport collapses to zero height and the
            rows never paint. The five rows fit without scrolling anyway. */}
        <BottomSheetView style={styles.content}>
          <View style={[styles.rows, { height: order.length * ROW_SLOT - ROW_GAP }]}>
            {order.map((cat) => (
              <CategoryRow
                key={cat}
                cat={cat}
                positions={positions}
                total={order.length}
                onDragEnd={handleDragEnd}
              />
            ))}
          </View>
        </BottomSheetView>
      </GestureHandlerRootView>
    </Sheet>
  );
}

function CategoryRow({
  cat,
  positions,
  total,
  onDragEnd,
}: {
  cat: ShoppingCategory;
  positions: SharedValue<Record<string, number>>;
  total: number;
  onDragEnd: (positions: Record<string, number>) => void;
}) {
  const { t } = useTranslation();
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragStartIndex = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      dragStartIndex.value = positions.value[cat];
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
      const targetIndex = Math.min(
        total - 1,
        Math.max(
          0,
          Math.round((dragStartIndex.value * ROW_SLOT + translateY.value) / ROW_SLOT),
        ),
      );
      const currentIndex = positions.value[cat];
      if (targetIndex === currentIndex) return;

      const next = { ...positions.value };
      for (const key in next) {
        if (key === cat) continue;
        const value = next[key];
        if (currentIndex < targetIndex && value > currentIndex && value <= targetIndex) {
          next[key] = value - 1;
        } else if (currentIndex > targetIndex && value < currentIndex && value >= targetIndex) {
          next[key] = value + 1;
        }
      }
      next[cat] = targetIndex;
      positions.value = next;
    })
    .onEnd(() => {
      isDragging.value = false;
      translateY.value = withSpring(0);
      runOnJS(onDragEnd)(positions.value);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const index = positions.value[cat] ?? 0;
    return {
      top: isDragging.value
        ? dragStartIndex.value * ROW_SLOT + translateY.value
        : withSpring(index * ROW_SLOT),
      zIndex: isDragging.value ? 10 : 0,
      shadowOpacity: withSpring(isDragging.value ? 0.18 : 0),
      transform: [{ scale: withSpring(isDragging.value ? 1.02 : 1) }],
    };
  });

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      <View
        style={[styles.iconBadge, { backgroundColor: `${SHOPPING_CATEGORY_COLOR[cat]}22` }]}>
        <Ionicons name={SHOPPING_CATEGORY_ICON[cat]} size={18} color={SHOPPING_CATEGORY_COLOR[cat]} />
      </View>
      <Text style={styles.rowLabel}>{t(`shoppingCategories.${SHOPPING_CATEGORY_KEY[cat]}`)}</Text>
      <GestureDetector gesture={panGesture}>
        <Animated.View hitSlop={8} style={styles.dragHandle}>
          <Ionicons name="reorder-three-outline" size={22} color={MiseColors.muted} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // TrueSheet's Android content lives in a separate native surface from the
  // app root, so the single GestureHandlerRootView in _layout.tsx doesn't
  // reach it — re-establish gesture handling locally. flexGrow (not flex)
  // per TrueSheet's own troubleshooting guide, to avoid layout issues.
  gestureRoot: { flexGrow: 1 },
  headerText: { paddingBottom: 0 },
  title: {
    fontFamily: MiseFonts.display,
    letterSpacing: MiseFonts.displayTracking,
    fontSize: 25,
    color: MiseColors.ink,
    marginBottom: 4,
  },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 14, lineHeight: 20, color: MiseColors.muted },
  content: { paddingTop: 18 },
  rows: { position: "relative" },
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    paddingHorizontal: 14,
    shadowColor: "#5A3C14",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconBadge: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontFamily: MiseFonts.bodySemiBold, fontSize: 14.5, color: MiseColors.ink },
  dragHandle: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
});
