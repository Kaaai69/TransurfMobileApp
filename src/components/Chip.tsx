import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

export interface ChipProps {
  label: string;
  tone?: 'neutral' | 'accent' | 'warm';
}

const tones = {
  neutral: { backgroundColor: colors.surface3, color: colors.textSecondary },
  accent: { backgroundColor: colors.accentDim, color: colors.accentBright },
  warm: { backgroundColor: colors.warmDim, color: colors.warm },
} as const;

export function Chip({ label, tone = 'neutral' }: ChipProps) {
  const toneStyle = tones[tone];

  return (
    <View style={[styles.chip, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.label, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: spacing.radii.chip,
    minHeight: spacing.heights.minTouch,
    justifyContent: 'center',
    paddingHorizontal: spacing.rhythm,
  },
  label: {
    ...typography.caption,
  },
});
