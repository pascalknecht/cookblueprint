import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Transition from 'react-native-screen-transitions';

import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import type { Recipe } from '@/hooks/use-recipes';

import { PhotoPlaceholder } from './photo-placeholder';

type RecipeCardProps = {
  recipe: Recipe;
  meta: string;
  onPress: () => void;
};

export function RecipeCard({ recipe, meta, onPress }: RecipeCardProps) {
  const pressed = useSharedValue(false);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.96 : 1, { damping: 14, stiffness: 320 }) }],
  }));

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (pressed.value = true)}
        onPressOut={() => (pressed.value = false)}
        style={styles.pressable}>
        <Transition.Boundary id={recipe.id} style={styles.photo}>
          <PhotoPlaceholder
            color={recipe.color}
            style={StyleSheet.absoluteFill}
            source={recipe.imageUrl ? { uri: recipe.imageUrl } : undefined}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeLabel}>{recipe.time}m</Text>
            </View>
          </PhotoPlaceholder>
        </Transition.Boundary>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: MiseColors.card,
    borderRadius: MiseRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    shadowColor: '#5A3C14',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pressable: { flex: 1 },
  photo: {
    height: 112,
    position: 'relative',
    // The zoom transition reads this boundary's own borderRadius to know
    // where to start interpolating from — without it, it starts from 0
    // (the card's rounding otherwise comes only from the parent's
    // overflow:hidden clip, which the boundary can't see) and the corner
    // pops straight to rounded instead of animating smoothly.
    borderRadius: MiseRadius.xl,
    overflow: 'hidden',
  },
  timeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(20,17,24,0.62)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeBadgeLabel: {
    color: '#fff',
    fontSize: 11,
    fontFamily: MiseFonts.bodySemiBold,
  },
  body: {
    paddingHorizontal: 11,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 3,
  },
  title: {
    fontSize: 13.5,
    fontFamily: MiseFonts.bodyBold,
    color: MiseColors.ink,
    lineHeight: 17,
  },
  meta: {
    fontSize: 11.5,
    fontFamily: MiseFonts.body,
    color: MiseColors.muted,
  },
});
