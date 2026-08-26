import { StyleSheet, Text, View } from 'react-native';

import { AppButton, Chip, Ring, TaskCard } from '../components';
import { ru } from '../i18n/ru';
import { categoryColor } from '../theme/categoryColors';
import { colors, spacing, typography } from '../theme';
import type { DailySnapshot } from './model';

export type DailyScreenProps = Readonly<{
  snapshot: DailySnapshot;
  busy: boolean;
  onCoreDone: () => void;
  onSupportDone: (taskId: string) => void;
  onMicroDone: () => void;
}>;

/**
 * Экран дня: три слота — ядро (L4), поддержка, сегодня. Кольцо на L2.
 * Одно L4-элемент на экране — карточка ядра.
 */
export function DailyScreen({
  snapshot,
  busy,
  onCoreDone,
  onSupportDone,
  onMicroDone,
}: DailyScreenProps) {
  const core = snapshot.core.task;
  const color = categoryColor[core.category];

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Chip
          label={ru.daily.graceChip(snapshot.graceDaysLeft, 2)}
          tone={snapshot.graceDaysLeft === 0 ? 'warm' : 'neutral'}
        />
        <Text style={styles.dayCounter}>{ru.daily.dayCounter(snapshot.dayNumber, 60)}</Text>
        <Text style={styles.xp}>{ru.daily.xpCaption(snapshot.levelXp)}</Text>
      </View>

      <View style={styles.ringArea}>
        <Ring animated={snapshot.core.doneToday} mode="state" size={252} values={snapshot.state} />
      </View>

      <TaskCard
        action={
          <AppButton
            disabled={busy || snapshot.core.doneToday}
            label={snapshot.core.doneToday ? ru.daily.doneToday : ru.daily.markDone}
            onPress={onCoreDone}
            variant={snapshot.core.doneToday ? 'secondary' : 'primary'}
          />
        }
        actionText={core.actionText}
        anchorText={core.anchorText}
        counter={ru.daily.dayCounter(snapshot.dayNumber, 60)}
        label={ru.daily.coreLabel}
        progress={snapshot.core.progress}
        progressColor={color}
        sourceDoi={core.sourceDoi}
        subtitle={core.subtitle}
      />

      <View style={styles.slot}>
        <Text style={styles.slotLabel}>{ru.daily.supportLabel}</Text>
        {snapshot.support.length === 0 ? (
          <Text style={styles.empty}>{ru.daily.supportEmpty}</Text>
        ) : (
          <View style={styles.supportList}>
            {snapshot.support.map(({ task, doneToday }) => (
              <AppButton
                key={task.id}
                disabled={busy || doneToday}
                label={`${doneToday ? '✓' : '○'} ${task.actionText}`}
                onPress={() => onSupportDone(task.id)}
                variant="secondary"
              />
            ))}
          </View>
        )}
      </View>

      {snapshot.micro === null ? null : (
        <View style={styles.slot}>
          <Text style={styles.slotLabel}>{ru.daily.todayLabel}</Text>
          <Text style={styles.microText}>{snapshot.micro.actionText}</Text>
          <AppButton
            disabled={busy || snapshot.micro.doneToday}
            label={snapshot.micro.doneToday ? ru.daily.doneToday : ru.daily.markDone}
            onPress={onMicroDone}
            variant="secondary"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sectionGap,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.cardGap,
    justifyContent: 'space-between',
  },
  dayCounter: {
    ...typography.caption,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  xp: {
    ...typography.caption,
    color: colors.accentBright,
    fontVariant: ['tabular-nums'],
  },
  ringArea: {
    alignItems: 'center',
  },
  slot: {
    gap: spacing.cardGap,
  },
  slotLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  empty: {
    ...typography.caption,
    color: colors.textMuted,
  },
  supportList: {
    gap: spacing.rhythm * 2,
  },
  microText: {
    ...typography.task,
    color: colors.textPrimary,
  },
});
