import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Ring, ScreenShell } from '../components';
import { ru } from '../i18n/ru';
import { colors, spacing, typography } from '../theme';
import type { OnboardingResult } from './result';

export type ProfileResultScreenProps = Readonly<{
  result: OnboardingResult;
  footer?: ReactNode;
}>;

/** Экран 19 — кольцо на L4 с шестью значениями и обязательным мелким шрифтом. */
export function ProfileResultScreen({ result, footer }: ProfileResultScreenProps) {
  const copy = ru.onboarding.screens[19];

  return (
    <ScreenShell footer={footer} level="L4">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {copy.title}
        </Text>
        <View style={styles.ringArea}>
          <Ring animated mode="state" size={300} values={result.scores} />
        </View>
        <Text style={styles.explanation}>{copy.body[0]}</Text>
        <Text style={styles.disclaimer}>{copy.body[1]}</Text>
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
  explanation: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
