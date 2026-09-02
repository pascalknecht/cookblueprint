import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { forwardRef, useImperativeHandle, useRef, type ComponentProps, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiseColors } from '@/constants/theme';
import { useMountEffect } from '@/hooks/use-mount-effect';

// TrueSheet's native grabber overlays the top of the sheet rather than
// reserving space for itself in the content's own layout — paddingTop has
// to clear it so a title sitting at the top of BottomSheetView /
// BottomSheetScrollView isn't drawn underneath.
export const SHEET_INSET = {
  top: 32,
  horizontal: 16,
  bottom: 16,
} as const;

function useSheetContentPadding() {
  const insets = useSafeAreaInsets();
  return {
    paddingTop: SHEET_INSET.top,
    paddingHorizontal: SHEET_INSET.horizontal,
    paddingBottom: SHEET_INSET.bottom + insets.bottom,
  };
}

export function BottomSheetView({ style, ...rest }: ComponentProps<typeof View>) {
  const padding = useSheetContentPadding();
  return <View style={[padding, style]} {...rest} />;
}

export const BottomSheetTextInput = TextInput;

export const BottomSheetScrollView = forwardRef<
  ComponentRef<typeof ScrollView>,
  ComponentProps<typeof ScrollView>
>(function BottomSheetScrollView({ contentContainerStyle, style, ...rest }, ref) {
  const padding = useSheetContentPadding();
  return (
    <ScrollView
      ref={ref}
      style={[styles.scroll, style]}
      contentContainerStyle={[padding, contentContainerStyle]}
      {...rest}
    />
  );
});

export function TrueSheetHeader({ style, ...rest }: ComponentProps<typeof View>) {
  return <View style={[styles.header, style]} {...rest} />;
}

export function TrueSheetFooter({ style, ...rest }: ComponentProps<typeof View>) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.footer,
        { paddingBottom: SHEET_INSET.bottom + insets.bottom },
        style,
      ]}
      {...rest}
    />
  );
}

export type SheetRef = TrueSheet;

type SheetProps = Omit<ComponentProps<typeof TrueSheet>, 'onDidDismiss'> & {
  onDismiss?: () => void;
  // Kept under its old (gorhom-era) name since every consumer already uses
  // it — maps to TrueSheet's own `dismissible`, which (unlike gorhom) also
  // controls backdrop-tap dismissal, not just the drag gesture.
  enablePanDownToClose?: boolean;
};

export const Sheet = forwardRef<SheetRef, SheetProps>(function Sheet(
  { onDismiss, enablePanDownToClose = true, backgroundColor, detents = ['auto'], ...rest },
  forwardedRef,
) {
  const innerRef = useRef<TrueSheet>(null);
  useImperativeHandle(forwardedRef, () => innerRef.current as TrueSheet, []);

  useMountEffect(() => {
    innerRef.current?.present();
  });

  return (
    <TrueSheet
      ref={innerRef}
      detents={detents}
      dismissible={enablePanDownToClose}
      backgroundColor={backgroundColor ?? MiseColors.background}
      onDidDismiss={onDismiss}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: SHEET_INSET.horizontal,
    paddingTop: SHEET_INSET.top,
    paddingBottom: 12,
    gap: 2,
    backgroundColor: MiseColors.background,
    borderBottomWidth: 1,
    borderBottomColor: MiseColors.borderSoft,
  },
  footer: {
    paddingHorizontal: SHEET_INSET.horizontal,
    paddingTop: 12,
    gap: 9,
    backgroundColor: MiseColors.background,
    borderTopWidth: 1,
    borderTopColor: MiseColors.borderSoft,
  },
});
