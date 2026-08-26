import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ru } from '../i18n/ru';
import { colors, spacing, typography } from '../theme';

export type OnboardingFooterProps = Readonly<{
  onBack: (() => void) | null;
  primaryLabel: string;
  onPrimary: () => void;
  busy?: boolean;
  caption?: string;
}>;

export function OnboardingFooter({
  onBack,
  primaryLabel,
  onPrimary,
  busy = false,
  caption,
}: OnboardingFooterProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.actions}>
        {onBack === null ? null : (
          <Pressable
            accessibilityLabel={ru.common.back}
            accessibilityRole="button"
            disabled={busy}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed ? styles.pressedSurface : null,
              busy ? styles.disabled : null,
            ]}
          >
            <Ionicons color={colors.textPrimary} name="arrow-back" size={22} />
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onPrimary}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed ? styles.primaryPressed : null,
            busy ? styles.disabled : null,
            onBack === null ? styles.fullWidth : null,
          ]}
        >
          <Text style={styles.primaryText}>{primaryLabel}</Text>
        </Pressable>
      </View>
      {caption === undefined ? null : <Text style={styles.caption}>{caption}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.cardGap,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.cardGap,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderRadius: spacing.radii.button,
    borderWidth: spacing.hairline,
    height: spacing.heights.button,
    justifyContent: 'center',
    width: spacing.heights.button,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: spacing.radii.button,
    flex: 1,
    height: spacing.heights.button,
    justifyContent: 'center',
  },
  primaryPressed: {
    backgroundColor: colors.accentDeep,
  },
  primaryText: {
    ...typography.body,
    color: colors.onAccent,
  },
  fullWidth: {
    flex: undefined,
    width: '100%',
  },
  pressedSurface: {
    backgroundColor: colors.surface3,
  },
  disabled: {
    opacity: 0.5,
  },
  caption: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
