import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/mise/button';
import { Sheet } from '@/components/mise/sheet';
import { MiseSpinner } from '@/components/mise/spinner';
import { MiseSwitch } from '@/components/mise/switch';
import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';
import { useGenerateMealPlan } from '@/hooks/use-meal-plan';
import { getCurrentWeekDates } from '@/lib/date-utils';
import { useToast } from '@/store/toast';

export default function PlanOptionsScreen() {
  const generateMutation = useGenerateMealPlan();
  const { showToast } = useToast();
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [avoidRepeats, setAvoidRepeats] = useState(true);
  const planGenerating = generateMutation.isPending;

  function handleGenerate() {
    const weekDates = getCurrentWeekDates();
    generateMutation.mutate(
      { startDate: weekDates[0], endDate: weekDates[weekDates.length - 1], vegetarianOnly, avoidRepeats },
      {
        onSuccess: () => router.back(),
        onError: (error) => showToast(error.message),
      },
    );
  }

  return (
    <Sheet onDismiss={() => (!planGenerating ? router.back() : undefined)}>
      {planGenerating ? (
        <View style={styles.generating}>
          <MiseSpinner size={56} />
          <Text style={styles.generatingTitle}>Building your week…</Text>
          <Text style={styles.generatingSubtitle}>Balancing meals across 7 days.</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Auto-plan your week</Text>
          <Text style={styles.subtitle}>We&apos;ll fill Mon–Sun using recipes from your library.</Text>

          <View style={styles.options}>
            <View style={styles.option}>
              <View style={styles.optionLabel}>
                <Text style={styles.optionEmoji}>🍽</Text>
                <Text style={styles.optionText}>Meals per day</Text>
              </View>
              <Text style={styles.optionValue}>3 ›</Text>
            </View>
            <View style={styles.option}>
              <View style={styles.optionLabel}>
                <Text style={styles.optionEmoji}>🌱</Text>
                <Text style={styles.optionText}>Only vegetarian</Text>
              </View>
              <MiseSwitch value={vegetarianOnly} onValueChange={setVegetarianOnly} />
            </View>
            <View style={styles.option}>
              <View style={styles.optionLabel}>
                <Text style={styles.optionEmoji}>♻️</Text>
                <Text style={styles.optionText}>Avoid repeats</Text>
              </View>
              <MiseSwitch value={avoidRepeats} onValueChange={setAvoidRepeats} />
            </View>
          </View>

          <Button label="✨ Generate plan" variant="gradient" onPress={handleGenerate} />
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: MiseFonts.display, fontSize: 25, color: MiseColors.ink, marginBottom: 4 },
  subtitle: { fontFamily: MiseFonts.body, fontSize: 14, lineHeight: 20, color: MiseColors.muted, marginBottom: 18 },
  options: { gap: 11, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MiseColors.card,
    borderWidth: 1,
    borderColor: MiseColors.borderSoft,
    borderRadius: MiseRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionLabel: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  optionEmoji: { fontSize: 17 },
  optionText: { fontFamily: MiseFonts.bodySemiBold, fontSize: 14.5, color: MiseColors.ink },
  optionValue: { fontFamily: MiseFonts.bodyBold, fontSize: 14, color: MiseColors.brand },
  generating: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  generatingTitle: { fontFamily: MiseFonts.display, fontSize: 22, color: MiseColors.ink, marginTop: 22, marginBottom: 6 },
  generatingSubtitle: { fontFamily: MiseFonts.body, fontSize: 14, color: MiseColors.muted },
});
