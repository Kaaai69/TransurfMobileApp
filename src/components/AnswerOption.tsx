import { Pressable, StyleSheet, Text } from 'react-native';

import { Glow } from '../light';
import { colors, spacing, typography } from '../theme';

export interface AnswerOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function AnswerOption({ label, selected, onPress, disabled = false }: AnswerOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: pressed
            ? colors.surface3
            : selected
              ? colors.accentDim
              : colors.surface1,
          borderColor: selected ? colors.accentBright : colors.border,
          opacity: disabled ? spacing.heights.minTouch / spacing.heights.row : 1,
        },
      ]}
    >
      <Glow level="L3" form="edge" visible={selected} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    borderWidth: spacing.hairline,
    height: spacing.heights.row,
    justifyContent: 'center',
    overflow: 'visible',
    paddingHorizontal: spacing.rhythm * 2,
    borderRadius: spacing.radii.field,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
