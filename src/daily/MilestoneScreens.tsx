import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components';
import { doiUrl } from '../content/sources';
import * as WebBrowser from 'expo-web-browser';
import { ru } from '../i18n/ru';
import { type Category } from '../db/schema';
import { colors, spacing, typography } from '../theme';
import { MilestoneLine, MilestoneShell, MilestoneText } from './MilestoneText';

const continueLabel = ru.common.continue;
const lallyDoi = '10.1002/ejsp.674';

export type MissedDayScreenProps = Readonly<{
  graceDaysLeft: number;
  onContinue: () => void;
}>;

/** День 11 / экран пропущенного дня: L2 тёплый, тон — как у обычного дня. */
export function MissedDayScreen({ graceDaysLeft, onContinue }: MissedDayScreenProps) {
  const milestone = ru.milestones[11];

  return (
    <MilestoneShell footer={<AppButton label={continueLabel} onPress={onContinue} />} warm>
      <MilestoneText title={milestone.title}>
        <MilestoneLine>{ru.missedDay.remainingLine(graceDaysLeft, 2)}</MilestoneLine>
        <MilestoneLine>Цепочка цела, ничего не сгорело.</MilestoneLine>
        <MilestoneLine muted>{milestone.body[1]}</MilestoneLine>
        <Text
          accessibilityRole="link"
          onPress={() => void WebBrowser.openBrowserAsync(doiUrl(lallyDoi)).catch(() => {})}
          style={styles.sourceLink}
        >
          Lally et al., 2010 — doi.org/{lallyDoi}
        </Text>
        <MilestoneLine>{milestone.body[2]}</MilestoneLine>
      </MilestoneText>
    </MilestoneShell>
  );
}

export type Day3ScreenProps = Readonly<{
  onContinue: () => void;
}>;

export function Day3Screen({ onContinue }: Day3ScreenProps) {
  const milestone = ru.milestones[3];

  return (
    <MilestoneShell footer={<AppButton label={continueLabel} onPress={onContinue} />}>
      <MilestoneText title={milestone.title}>
        <MilestoneLine>{milestone.body[0]}</MilestoneLine>
        <Text
          accessibilityRole="link"
          onPress={() => void WebBrowser.openBrowserAsync(doiUrl(lallyDoi)).catch(() => {})}
          style={styles.sourceLink}
        >
          Lally et al., 2010 — doi.org/{lallyDoi}
        </Text>
        <MilestoneLine muted>{milestone.body[1]}</MilestoneLine>
      </MilestoneText>
    </MilestoneShell>
  );
}

export type RecalcRow = Readonly<{
  category: Category;
  before: number;
  after: number;
}>;

export type RecalcScreenProps = Readonly<{
  rows: readonly RecalcRow[];
  levelXp: number;
  graceDaysLeft: number;
  graceUsed: boolean;
  onContinue: () => void;
}>;

/** День 7 — пересчёт: до → после, стрелки, по одной строке объяснения. */
export function RecalcScreen({
  rows,
  levelXp,
  graceDaysLeft,
  graceUsed,
  onContinue,
}: RecalcScreenProps) {
  const milestone = ru.milestones[7];

  return (
    <MilestoneShell footer={<AppButton label={continueLabel} onPress={onContinue} />}>
      <MilestoneText title={milestone.title}>
        <MilestoneLine muted>{milestone.body[0]}</MilestoneLine>
      </MilestoneText>
      <View style={styles.rows}>
        {rows.map(({ category, before, after }) => {
          const direction = after > before ? 'up' : after < before ? 'down' : ('same' as const);
          const symbol =
            direction === 'up'
              ? ru.recalc.upSymbol
              : direction === 'down'
                ? ru.recalc.downSymbol
                : ru.recalc.unchangedSymbol;
          const explanation =
            direction === 'up'
              ? ru.recalc.explanationUp(ru.categories[category])
              : direction === 'down'
                ? ru.recalc.explanationDown(ru.categories[category])
                : ru.recalc.explanationSame(ru.categories[category]);

          return (
            <View key={category} style={styles.rowBlock}>
              <View style={styles.row}>
                <Text style={styles.rowCategory}>{ru.categories[category]}</Text>
                <Text style={styles.rowValues}>{`${before} → ${after}`}</Text>
                <Text style={[styles.rowArrow, direction === 'down' ? styles.arrowDown : null]}>
                  {symbol}
                </Text>
              </View>
              <Text style={styles.rowExplanation}>{explanation}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.footerInfo}>
        <Text style={styles.xpLine}>{ru.daily.xpCaption(levelXp)}</Text>
        <Text style={styles.graceLine}>
          {graceUsed
            ? ru.recalc.graceUsed(graceDaysLeft, 2)
            : ru.recalc.graceUnused(graceDaysLeft, 2)}
        </Text>
      </View>
    </MilestoneShell>
  );
}

export type SummaryScreenProps = Readonly<{
  doneCount: number;
  dayNumber: number;
  forgivenCount: number;
  nextActionText: string | null;
  changedRows: readonly RecalcRow[];
  onAcceptNextTier: () => void;
  onPostpone: () => void;
}>;

/** День 14 — итог и развилка: следующая ступень или «остаться на этой ещё на неделю». */
export function SummaryScreen({
  doneCount,
  dayNumber,
  forgivenCount,
  nextActionText,
  changedRows,
  onAcceptNextTier,
  onPostpone,
}: SummaryScreenProps) {
  const milestone = ru.milestones[14];
  const skips = Math.max(0, Math.min(dayNumber, 14) - doneCount - forgivenCount);

  return (
    <MilestoneShell>
      <MilestoneText title={milestone.title}>
        <MilestoneLine>{`Ядро выполнено ${doneCount} дней из ${Math.min(dayNumber, 14)}.`}</MilestoneLine>
        <MilestoneLine muted>
          {forgivenCount === 0 && skips === 0
            ? 'Без пропусков.'
            : `Один прощённый день заменяет пропуск. Пропусков без отметок: ${skips}.`}
        </MilestoneLine>
      </MilestoneText>

      <View style={styles.rows}>
        {changedRows.map(({ category, before, after }) => {
          const direction = after > before ? 'up' : after < before ? 'down' : ('same' as const);

          return (
            <View key={category} style={styles.row}>
              <Text style={styles.rowCategory}>{ru.categories[category]}</Text>
              <Text style={styles.rowValues}>{`${before} → ${after}`}</Text>
              <Text style={[styles.rowArrow, direction === 'down' ? styles.arrowDown : null]}>
                {direction === 'up'
                  ? ru.recalc.upSymbol
                  : direction === 'down'
                    ? ru.recalc.downSymbol
                    : ru.recalc.unchangedSymbol}
              </Text>
            </View>
          );
        })}
        {changedRows.length === 0 ? (
          <MilestoneLine muted>
            Значения пока не двинулись — это нормально для старта.
          </MilestoneLine>
        ) : null}
      </View>

      <MilestoneLine muted>{milestone.body[0]}</MilestoneLine>

      {nextActionText === null ? (
        <MilestoneLine>{milestone.body[1]}</MilestoneLine>
      ) : (
        <View style={styles.offer}>
          <MilestoneLine>{ru.tierOffer.nextStep(nextActionText)}</MilestoneLine>
          <MilestoneLine muted>{ru.tierOffer.supportNote}</MilestoneLine>
        </View>
      )}

      <View style={styles.actions}>
        {nextActionText === null ? null : (
          <AppButton label={milestone.primaryAction ?? ''} onPress={onAcceptNextTier} />
        )}
        <AppButton
          label={milestone.secondaryAction ?? ''}
          onPress={onPostpone}
          variant="secondary"
        />
      </View>
    </MilestoneShell>
  );
}

export type DowngradeScreenProps = Readonly<{
  onKeep: () => void;
  onStepDown: () => void;
}>;

export function DowngradeScreen({ onKeep, onStepDown }: DowngradeScreenProps) {
  const copy = ru.downgrade;

  return (
    <MilestoneShell warm>
      <MilestoneText title={copy.title}>
        {copy.body.map((line) => (
          <MilestoneLine key={line} muted>
            {line}
          </MilestoneLine>
        ))}
      </MilestoneText>
      <View style={styles.actions}>
        <AppButton label={copy.stepDown} onPress={onStepDown} />
        <AppButton label={copy.keep} onPress={onKeep} variant="secondary" />
      </View>
    </MilestoneShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.cardGap,
  },
  arrowDown: {
    color: colors.neutralDown,
  },
  footerInfo: {
    gap: spacing.rhythm,
  },
  xpLine: {
    ...typography.body,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  graceLine: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  offer: {
    gap: spacing.rhythm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.cardGap,
    minHeight: spacing.heights.minTouch - 12,
  },
  rowArrow: {
    ...typography.task,
    color: colors.accentBright,
    minWidth: 24,
    textAlign: 'center',
  },
  rowBlock: {
    gap: spacing.rhythm / 2,
  },
  rowCategory: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  rowExplanation: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowValues: {
    ...typography.body,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  rows: {
    gap: spacing.cardGap,
  },
  sourceLink: {
    ...typography.caption,
    color: colors.accentBright,
  },
});
