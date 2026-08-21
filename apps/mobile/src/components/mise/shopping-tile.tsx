import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { SHOPPING_CATEGORY_COLOR, SHOPPING_CATEGORY_ICON, type ShoppingCategory } from '@/constants/shopping-categories';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useReducedMotionFlag } from '@/lib/motion';

const COMPLETE_HOLD_MS = 480;

type ShoppingTileProps = {
  name: string;
  category: ShoppingCategory;
  quantity?: string;
  checked?: boolean;
  onPress: () => void;
};

export function ShoppingTile({ name, category, quantity, checked, onPress }: ShoppingTileProps) {
  const [completing, setCompleting] = useState(false);
  const reduced = useReducedMotionFlag();
  const done = checked || completing;
  const tint = done ? MiseColors.mutedLight : SHOPPING_CATEGORY_COLOR[category];

  function handlePress() {
    if (completing) return;
    setCompleting(true);
    setTimeout(onPress, COMPLETE_HOLD_MS);
  }

  return (
    <Animated.View
      style={styles.tile}
      entering={reduced ? undefined : FadeIn.duration(220)}
      exiting={reduced ? undefined : ZoomOut.duration(220)}>
      <Pressable onPress={handlePress} disabled={completing} style={[styles.pressable, { backgroundColor: tint }]}>
        <Ionicons name={SHOPPING_CATEGORY_ICON[category]} size={26} color="rgba(255,255,255,0.92)" />
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        {quantity ? <Text style={styles.quantity}>{quantity}</Text> : null}

        {completing ? (
          <Animated.View entering={reduced ? undefined : FadeIn.duration(120)} style={styles.completeOverlay}>
            <Animated.View
              entering={reduced ? undefined : ZoomIn.springify().damping(11).stiffness(260)}
              style={styles.completeCircle}>
              <Ionicons name="checkmark" size={26} color={MiseColors.mutedLight} />
            </Animated.View>
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '31%',
    aspectRatio: 1,
  },
  pressable: {
    flex: 1,
    borderRadius: MiseRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  name: {
    fontFamily: MiseFonts.bodyBold,
    fontSize: 12.5,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 15,
  },
  quantity: {
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.8)',
  },
  completeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: MiseRadius.lg,
    backgroundColor: 'rgba(20,17,24,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
