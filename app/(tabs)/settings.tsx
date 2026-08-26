import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from 'expo-sqlite/kv-store';

import appConfig from '../../app.json';
import { AppButton, ScreenShell } from '../../src/components';
import { resetLocalData } from '../../src/db/repo';
import { databaseReady, sqlite } from '../../src/db/client';
import { ru } from '../../src/i18n/ru';
import { colors, spacing, typography } from '../../src/theme';

const kvKeys = [
  'launch.welcomeSeen',
  'launch.onboardingCompleted',
  'launch.onboardingStep',
  'onboarding.choiceEvent',
  'onboarding.questionnaireDraft',
  'onboarding.result',
  'daily.chain',
  'daily.milestones',
  'daily.tierOfferPostponedUntil',
  'daily.perfectWeekAwarded',
];

/** Настройки — L0, света нет: служебный экран. */
export default function SettingsScreen() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Error | null>(null);

  const handleReset = useCallback(() => {
    if (busy) return;

    setBusy(true);

    void databaseReady
      .then(async () => {
        await Promise.all(kvKeys.map((key) => AsyncStorage.setItem(key, '')));
        await resetLocalData(sqlite);
      })
      .then(() => {
        setBusy(false);
        setConfirming(false);
      })
      .catch((error: unknown) => {
        setBusy(false);
        setFailure(error instanceof Error ? error : new Error(String(error)));
      });
  }, [busy]);

  if (failure !== null) throw failure;

  return (
    <ScreenShell level="L0">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {ru.settings.title}
        </Text>

        <View style={styles.section}>
          <Text style={styles.rowLabel}>{ru.settings.notifications}</Text>
          <Text style={styles.rowValue}>{ru.settings.notificationsOff}</Text>
        </View>

        <View style={styles.section}>
          {confirming ? (
            <>
              <Text style={styles.confirm}>{ru.settings.resetConfirm}</Text>
              <AppButton disabled={busy} label={ru.settings.reset} onPress={handleReset} />
              <AppButton
                disabled={busy}
                label={ru.settings.resetCancel}
                onPress={() => setConfirming(false)}
                variant="secondary"
              />
            </>
          ) : (
            <AppButton
              disabled={busy}
              label={ru.settings.reset}
              onPress={() => setConfirming(true)}
              variant="secondary"
            />
          )}
        </View>

        <Text style={styles.version}>{ru.settings.version(appConfig.expo.version ?? '1.0.0')}</Text>
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
  section: {
    gap: spacing.cardGap,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textMuted,
  },
  confirm: {
    ...typography.body,
    color: colors.textSecondary,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
});
