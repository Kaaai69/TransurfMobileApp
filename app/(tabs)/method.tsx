import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../../src/components';
import { doiUrl, sources } from '../../src/content/sources';
import { ru } from '../../src/i18n/ru';
import { colors, spacing, typography } from '../../src/theme';

/** Раздел «Метод» — полный список работ, на которых построены задачи. */
export default function MethodScreen() {
  return (
    <ScreenShell level="L1">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {ru.method.title}
        </Text>
        <Text style={styles.intro}>{ru.method.intro}</Text>

        {sources.map((source) => (
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
  },
});
