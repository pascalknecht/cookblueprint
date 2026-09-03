import Transition from 'react-native-screen-transitions';
import { BlankStack } from 'react-native-screen-transitions/expo-router';

// A real shared-element zoom (RecipeCard photo → recipe detail hero) needs
// the tapped card and the destination screen to share one BlankStack — the
// library's boundary-matching context (DescriptorsProvider) only exists
// inside a BlankStack tree, so both (tabs) and recipe/[id] live here rather
// than the root Stack. Everything else (auth screens, the ~12 TrueSheet
// modal routes) stays on the root Stack, untouched, in _layout.tsx.
export default function AppLayout() {
  return (
    <BlankStack>
      <BlankStack.Screen name="(tabs)" />
      <BlankStack.Screen
        name="recipe/[id]"
        options={{
          navigationMaskEnabled: true,
          transitionSpec: Transition.Specs.Zoom,
          screenStyleInterpolator: ({ bounds, active }) => {
            'worklet';
            const id = (active.route.params as { id?: string } | undefined)?.id;
            if (!id) return null;
            // Default expanded radius is 64 — on our plain, unrounded hero
            // that reads as an extra bump right as the corners settle.
            // Interpolate straight from the card's own radius to 0 instead.
            return bounds(id).navigation.zoom({ borderRadius: 0 });
          },
        }}
      />
    </BlankStack>
  );
}
