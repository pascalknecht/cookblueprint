import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

// A Pressable whose style prop can carry Reanimated shared-value styles and
// CSS transitions (scale-on-press, color-on-select) without restructuring it
// into a separate hit-target/visual pair the way Button and IconButton do.
export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
