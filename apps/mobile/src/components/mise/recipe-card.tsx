import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import type { Recipe } from '@/hooks/use-recipes';

import { PhotoPlaceholder } from './photo-placeholder';

type RecipeCardProps = {
  recipe: Recipe;
  meta: string;
  onPress: () => void;
};

export function RecipeCard({ recipe, meta, onPress }: RecipeCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <PhotoPlaceholder color={recipe.color} style={styles.photo}>
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeLabel}>{recipe.time}m</Text>
        </View>
      </PhotoPlaceholder>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
    </Pressable>
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
  photo: {
    height: 112,
    position: 'relative',
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
