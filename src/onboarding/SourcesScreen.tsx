import type { ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../components';
import { doiUrl, selectSourcesForProfile } from '../content/sources';
import { ru } from '../i18n/ru';
import { colors, spacing, typography } from '../theme';
import type { OnboardingResult } from './result';

export type SourcesScreenProps = Readonly<{
  result: OnboardingResult;
  footer?: ReactNode;
}>;

/**
 * Экран 22 — только текст: работа, журнал, год, кликабельный DOI.
 * Никаких логотипов и обложек журналов.
 */
export function SourcesScreen({ result, footer }: SourcesScreenProps) {
  const copy = ru.onboarding.screens[22];
  const cards = selectSourcesForProfile(result.scores);

  return (
    <ScreenShell footer={footer} level="L1">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {copy.title}
        </Text>
        <Text style={styles.intro}>{copy.body[0]}</Text>
        <View style={styles.cards}>
          {cards.map((source) => (
            <Pressable
              accessibilityLabel={`${ru.sources.openLink}: ${source.work}`}
              accessibilityRole="link"
              key={source.doi}
              onPress={() => {
                void WebBrowser.openBrowserAsync(doiUrl(source.doi)).catch(() => {});
              }}
              style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
            >
              <Text style={styles.work}>{source.work}</Text>
              <Text style={styles.meta}>{ru.sources.journalYear(source.journal, source.year)}</Text>
              <Text style={styles.doi}>doi.org/{source.doi}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.outro}>{copy.body[1]}</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sectionGap,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cards: {
    gap: spacing.cardGap,
  },
  card: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderRadius: spacing.radii.card,
    borderWidth: spacing.hairline,
    gap: spacing.rhythm,
    padding: spacing.screen,
  },
  cardPressed: {
    backgroundColor: colors.surface2,
  },
  work: {
    ...typography.task,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  doi: {
    ...typography.caption,
    color: colors.accentBright,
    fontVariant: ['tabular-nums'],
  },
  outro: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
