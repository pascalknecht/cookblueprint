import { ComponentType, ReactNode, forwardRef } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { MiseColors, MiseFonts, MiseRadius } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  icon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  multiline?: boolean;
  // Pass @/components/mise/sheet's BottomSheetTextInput when this field lives
  // inside a Sheet, so the sheet can track keyboard focus for auto-sizing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  InputComponent?: ComponentType<any>;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, icon, containerStyle, style, multiline, InputComponent, ...inputProps },
  ref,
) {
  const Input: ComponentType<any> = InputComponent ?? TextInput; // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, multiline && styles.fieldMultiline]}>
        {icon}
        <Input
          ref={ref}
          placeholderTextColor={MiseColors.mutedLight}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          multiline={multiline}
          {...inputProps}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    fontFamily: MiseFonts.bodySemiBold,
    fontSize: 13,
    color: MiseColors.inkSoft,
    marginBottom: 7,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    borderWidth: 1.5,
    borderColor: MiseColors.border,
    borderRadius: MiseRadius.md,
    backgroundColor: MiseColors.card,
    paddingHorizontal: 15,
  },
  fieldMultiline: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontFamily: MiseFonts.body,
    fontSize: 15,
    color: MiseColors.ink,
  },
  inputMultiline: {
    height: '100%',
    textAlignVertical: 'top',
    lineHeight: 22,
  },
});
