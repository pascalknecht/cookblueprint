import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView as GorhomBottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView as GorhomBottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useImperativeHandle, useRef, type ComponentProps, type ComponentRef } from 'react';
import { StyleSheet } from 'react-native';

import { MiseColors } from '@/constants/theme';
import { useMountEffect } from '@/hooks/use-mount-effect';

const contentStyle = StyleSheet.create({
  base: {
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
});

export function BottomSheetView({
  style,
  ...rest
}: ComponentProps<typeof GorhomBottomSheetView>) {
  return <GorhomBottomSheetView style={[contentStyle.base, style]} {...rest} />;
}

export { BottomSheetTextInput };

export const BottomSheetScrollView = forwardRef<
  ComponentRef<typeof GorhomBottomSheetScrollView>,
  ComponentProps<typeof GorhomBottomSheetScrollView>
>(function BottomSheetScrollView({ style, ...rest }, ref) {
  return <GorhomBottomSheetScrollView ref={ref} style={[contentStyle.base, style]} {...rest} />;
});

export const Sheet = forwardRef<BottomSheetModal, BottomSheetModalProps>(function Sheet(
  { backdropComponent, backgroundStyle, handleIndicatorStyle, enablePanDownToClose = true, ...rest },
  forwardedRef,
) {
  const innerRef = useRef<BottomSheetModal>(null);
  useImperativeHandle(forwardedRef, () => innerRef.current as BottomSheetModal, []);

  useMountEffect(() => {
    innerRef.current?.present();
  });

  const defaultBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.42}
        pressBehavior={enablePanDownToClose ? 'close' : 'none'}
      />
    ),
    [enablePanDownToClose],
  );

  return (
    <BottomSheetModal
      ref={innerRef}
      enablePanDownToClose={enablePanDownToClose}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={backdropComponent ?? defaultBackdrop}
      backgroundStyle={backgroundStyle ?? styles.card}
      handleIndicatorStyle={handleIndicatorStyle ?? styles.handle}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: MiseColors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  handle: {
    backgroundColor: '#DDD3C6',
    width: 38,
  },
});
