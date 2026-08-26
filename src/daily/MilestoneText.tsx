import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components';
import type { ReactNode } from 'react';

import { colors, spacing, typography } from '../theme';

export function MilestoneText({
  children,
  title,
}: Readonly<{ children: ReactNode; title?: string }>) {
  return (
    <View style={milestoneScreenStyles.content}>
      {title === undefined ? null : (
        <Text accessibilityRole="header" style={milestoneScreenStyles.title}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

export function MilestoneLine({
  children,
  muted = false,
}: Readonly<{ children: ReactNode; muted?: boolean }>) {
  return (
    <Text style={[milestoneScreenStyles.line, muted ? milestoneScreenStyles.lineMuted : null]}>
      {children}
    </Text>
  );
}

export const milestoneScreenStyles = StyleSheet.create({
  content: {
    gap: spacing.sectionGap,
    paddingTop: spacing.sectionGap,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  line: {
    ...typography.body,
    color: colors.textPrimary,
  },
  lineMuted: {
    color: colors.textSecondary,
  },
});

/** Обёртка текстовых вех: L2 — спокойный свет, ничего не давит. */
export function MilestoneShell({
  children,
  footer,
  warm = false,
}: Readonly<{
  children: ReactNode;
  footer?: ReactNode;
  warm?: boolean;
}>) {
  return (
    <ScreenShell footer={footer} glowTemperature={warm ? 'warm' : 'cool'} level="L2">
      {children}
    </ScreenShell>
  );
}
