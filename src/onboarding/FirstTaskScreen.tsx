import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell, TaskCard } from '../components';
import { findCoreTaskTemplateById } from '../content/tasks';
import { ru } from '../i18n/ru';
import { categoryColor } from '../theme/categoryColors';
import { colors, spacing, typography } from '../theme';
import type { OnboardingResult } from './result';

export type FirstTaskScreenProps = Readonly<{
  result: OnboardingResult;
  busy?: boolean;
  onAccept: () => void;
}>;

/**
 * Экран 21 — первая задача на L4. Карточка в формате если-то с источником,
 * когда он есть; у задач без исследования иконки «i» нет.
 */
export function FirstTaskScreen({ result, busy = false, onAccept }: FirstTaskScreenProps) {
  const copy = ru.onboarding.screens[21];
  const template = findCoreTaskTemplateById(result.firstTaskTemplateId);

  if (template === null) {
    throw new Error(`First task template ${result.firstTaskTemplateId} is not seeded`);
  }

  return (
    <ScreenShell level="L4">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {copy.title}
        </Text>
        <TaskCard
          action={
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onAccept}
              style={({ pressed }) => [
                styles.button,
                pressed ? styles.buttonPressed : null,
                busy ? styles.disabled : null,
              ]}
            >
              <Text style={styles.buttonText}>{copy.primaryAction}</Text>
            </Pressable>
          }
          actionText={template.actionText}
          anchorText={template.anchorText}
          label={ru.daily.coreLabel}
          progressColor={categoryColor[template.category]}
          sourceDoi={template.sourceDoi}
          subtitle={template.subtitle}
        />
        {copy.body[2] === undefined ? null : <Text style={styles.note}>{copy.body[2]}</Text>}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sectionGap,
    paddingTop: spacing.rhythm,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: spacing.radii.button,
    height: spacing.heights.button,
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.accentDeep,
  },
  buttonText: {
    ...typography.body,
    color: colors.onAccent,
  },
  disabled: {
    opacity: 0.5,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
