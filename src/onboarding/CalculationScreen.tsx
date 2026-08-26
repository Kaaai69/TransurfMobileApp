import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ScreenShell } from '../components';
import { ru } from '../i18n/ru';
import { colors, spacing, typography } from '../theme';
import type { OnboardingAnswers } from '../domain/scoring';
import { splitManifestoBody } from './manifesto';
import {
  calculationStageIds,
  runCalculation,
  type CalculationStageId,
  type OnboardingResult,
} from './result';

const minimumDisplayMs = 800;

export type CalculationScreenProps = Readonly<{
  answers: OnboardingAnswers;
  onCalculated: (result: OnboardingResult) => Promise<void>;
}>;

/**
 * Экран 18. Расчёт происходит по-настоящему: галочка появляется только когда
 * этап завершён. Если всё посчиталось мгновенно — экран показывается 800 мс
 * и исчезает, искусственно его не растягиваем.
 */
export function CalculationScreen({ answers, onCalculated }: CalculationScreenProps) {
  const lines = splitManifestoBody(ru.onboarding.screens[18].body);
  const [completedStages, setCompletedStages] = useState(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      const startedAt = Date.now();
      const result = await runCalculation(answers, {
        onStageComplete: () => {
          if (active) setCompletedStages((current) => current + 1);
        },
      });

      if (!active) return;

      const remainingMs = Math.max(0, minimumDisplayMs - (Date.now() - startedAt));

      timer = setTimeout(() => {
        if (!active || finishedRef.current) return;

        finishedRef.current = true;
        setCompletedStages(calculationStageIds.length);
        void onCalculated(result).catch(() => {});
      }, remainingMs);
    })();

    return () => {
      active = false;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [answers, onCalculated]);

  return (
    <ScreenShell level={completedStages === calculationStageIds.length ? 'L3' : 'L1'}>
      <View accessibilityLiveRegion="polite" style={styles.content}>
        {lines.map((line, index) => {
          const stageId: CalculationStageId | undefined = calculationStageIds[index];
          const done = stageId !== undefined && index < completedStages;

          return (
            <View key={line} style={styles.stageRow}>
              <View style={[styles.check, done ? styles.checkDone : null]}>
                {done ? <Ionicons color={colors.onAccent} name="checkmark" size={14} /> : null}
              </View>
              <Text style={[styles.line, done ? styles.lineDone : null]}>{line}</Text>
            </View>
          );
        })}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.cardGap,
    minHeight: 220,
  },
  stageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.rhythm * 2,
    minHeight: spacing.heights.minTouch,
  },
  check: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 11,
    borderWidth: spacing.hairline,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  line: {
    ...typography.body,
    color: colors.textMuted,
  },
  lineDone: {
    color: colors.textPrimary,
  },
});
