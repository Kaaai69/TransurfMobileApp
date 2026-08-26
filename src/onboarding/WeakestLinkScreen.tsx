import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Ring, ScreenShell } from '../components';
import { ru } from '../i18n/ru';
import { colors, spacing, typography } from '../theme';
import type { OnboardingResult } from './result';

export type WeakestLinkScreenProps = Readonly<{
  result: OnboardingResult;
  footer?: ReactNode;
}>;

/**
 * Экран 20 — слабое звено на L3. Остальные секторы кольца гасятся
 * до #4A5058 (BUILD.md T17), свет остаётся только под одной дугой.
 */
export function WeakestLinkScreen({ result, footer }: WeakestLinkScreenProps) {
  const copy = ru.onboarding.screens[20];

  return (
    <ScreenShell footer={footer} level="L3">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {ru.onboarding.weakestTitle(
            ru.categories[result.weakestLink],
            Math.round(result.scores[result.weakestLink]),
          )}
        </Text>
        <View style={styles.ringArea}>
          <Ring
            animated
            highlightCategory={result.weakestLink}
            mode="state"
            size={300}
            values={result.scores}
          />
        </View>
        {copy.body.map((line) => (
          <Text key={line} style={styles.body}>
            {line}
          </Text>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: spacing.sectionGap,
    paddingTop: spacing.sectionGap,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  ringArea: {
    alignItems: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
