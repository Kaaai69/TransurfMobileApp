import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../theme';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed ? (variant === 'primary' ? styles.primaryPressed : styles.secondaryPressed) : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text style={[styles.label, variant === 'primary' ? styles.primaryLabel : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: spacing.radii.button,
    height: spacing.heights.button,
    justifyContent: 'center',
    width: '100%',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  primaryPressed: {
    backgroundColor: colors.accentDeep,
  },
  secondary: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderWidth: spacing.hairline,
  },
  secondaryPressed: {
    backgroundColor: colors.surface3,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  primaryLabel: {
    color: colors.onAccent,
  },
  disabled: {
    opacity: 0.5,
  },
});
