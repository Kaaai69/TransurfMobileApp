import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PropsWithChildren, ReactNode } from 'react';

import { doiUrl, findSourceByDoi } from '../content/sources';
import { ru } from '../i18n/ru';
import { Glow } from '../light';
import { colors, spacing, typography } from '../theme';

export interface TaskCardProps extends PropsWithChildren {
  label: string;
  counter?: string;
  anchorText: string;
  actionText: string;
  subtitle?: string;
  sourceDoi?: string | null;
  progressColor: string;
  progress?: number;
  action?: ReactNode;
}

export function TaskCard({
  label,
  counter,
  anchorText,
  actionText,
  subtitle,
  sourceDoi,
  progressColor,
  progress = 0,
  action,
  children,
}: TaskCardProps) {
  const source = findSourceByDoi(sourceDoi ?? null);

  return (
    <View style={styles.card}>
      <Glow color={progressColor} form="core" level="L4" />
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {counter === undefined ? null : <Text style={styles.counter}>{counter}</Text>}
      </View>
      <Text style={styles.task}>{ru.onboarding.firstTaskHeading(anchorText, actionText)}</Text>
      {subtitle == null || subtitle.length === 0 ? null : (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      {children}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { backgroundColor: progressColor, width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <View style={styles.actions}>
        {action == null ? null : (
          <View style={styles.actionSlot}>{action}</View>
        )}
        {source === null ? (
          <View style={styles.infoPlaceholder} />
        ) : (
          <Pressable
            accessibilityLabel={`${ru.sources.openLink}: ${source.work}`}
            accessibilityRole="button"
            onPress={() => {
              void WebBrowser.openBrowserAsync(doiUrl(source.doi)).catch(() => {});
            }}
            style={({ pressed }) => [styles.infoButton, pressed ? styles.infoPressed : null]}
          >
            <Ionicons color={colors.accentBright} name="information-outline" size={20} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderRadius: spacing.radii.card,
    borderWidth: spacing.hairline,
    gap: spacing.rhythm * 2,
    overflow: 'visible',
    padding: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.label,
    color: colors.accentBright,
  },
  counter: {
    ...typography.label,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  task: {
    ...typography.task,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressTrack: {
    backgroundColor: colors.surface3,
    borderRadius: 1,
    height: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.cardGap,
  },
  actionSlot: {
    flex: 1,
  },
  infoButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: spacing.heights.minTouch / 2,
    borderWidth: spacing.hairline,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  infoPressed: {
    backgroundColor: colors.surface3,
  },
  infoPlaceholder: {
    width: 42,
  },
});
