import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/mise/button';
import { IconButton } from '@/components/mise/icon-button';
import { TextField } from '@/components/mise/text-field';
import { BackIconName, MiseColors, MiseFonts, MiseRadius, RecipeAccentColors } from '@/constants/theme';
import { useCreateRecipe } from '@/hooks/use-recipes';
import { useToast } from '@/store/toast';

export default function ManualScreen() {
  const insets = useSafeAreaInsets();
  const createRecipeMutation = useCreateRecipe();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [servings, setServings] = useState('');
  const [ing, setIng] = useState('');

  function handleSave() {
    const ingredients = ing
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((n) => ({ n, q: '', cat: 'Pantry' }));

    createRecipeMutation.mutate(
      {
        title: title || 'My Recipe',
        color: RecipeAccentColors[5],
        time: Number(time) || 20,
        servings: Number(servings) || 2,
        kcal: '—',
        tags: ['My recipe'],
        ingredients: ingredients.length ? ingredients : [{ n: 'Add ingredients', q: '', cat: 'Pantry' }],
        steps: ['Add your method steps.'],
      },
      {
        onSuccess: () => {
          showToast('Recipe added');
          router.replace('/(tabs)/recipes');
        },
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 40 }]}>
      <IconButton name={BackIconName} onPress={() => router.back()} style={styles.back} />
      <Text style={styles.title}>New recipe</Text>

      <View style={styles.photoBox}>
        <Ionicons name="camera-outline" size={26} color={MiseColors.mutedLight} />
        <Text style={styles.photoLabel}>Add a photo</Text>
      </View>

      <TextField label="Title" value={title} onChangeText={setTitle} placeholder="Grandma's lasagna" containerStyle={styles.field} />

      <View style={styles.row}>
        <TextField
          label="Time (min)"
          value={time}
          onChangeText={setTime}
          placeholder="45"
          keyboardType="number-pad"
          containerStyle={styles.rowField}
        />
        <TextField
          label="Serves"
          value={servings}
          onChangeText={setServings}
          placeholder="4"
          keyboardType="number-pad"
          containerStyle={styles.rowField}
        />
      </View>

      <TextField
        label="Ingredients (one per line)"
        value={ing}
        onChangeText={setIng}
        placeholder={'2 slices sourdough\n1 avocado\n2 eggs'}
        multiline
        containerStyle={styles.field}
      />

      <Button label="Save recipe" onPress={handleSave} loading={createRecipeMutation.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MiseColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22 },
  back: { marginBottom: 20 },
  title: { fontFamily: MiseFonts.display, fontSize: 30, color: MiseColors.ink, marginBottom: 22 },
  photoBox: {
    height: 130,
    borderWidth: 1.5,
    borderColor: '#D8CDBE',
    borderStyle: 'dashed',
    borderRadius: MiseRadius.lg,
    backgroundColor: MiseColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 18,
  },
  photoLabel: { fontFamily: MiseFonts.bodySemiBold, fontSize: 13, color: MiseColors.mutedLight },
  field: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  rowField: { flex: 1 },
});
