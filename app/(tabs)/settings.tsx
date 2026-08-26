import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from 'expo-sqlite/kv-store';

import appConfig from '../../app.json';
import { AppButton, ScreenShell } from '../../src/components';
import { sqlite } from '../../src/db/client';
import { getActiveCoreTask, hasTaskLog, resetLocalData } from '../../src/db/repo';
import { today } from '../../src/domain/dates';
import { ru } from '../../src/i18n/ru';
import {
  enableAndSchedule,
  notificationsEnabled,
  rebuildSchedule,
  setNotificationsEnabled,
} from '../../src/notifications/schedule';
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
  'settings.notifications',
];

/** Настройки — L0, света нет: служебный экран. */
export default function SettingsScreen() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Error | null>(null);
  const [notificationsOn, setNotificationsOn] = useState<boolean | null>(null);
  const mounted = useRef(true);

  useFocusEffect(
    useCallback(() => {
      mounted.current = true;

      void notificationsEnabled()
        .then((enabled) => {
          if (mounted.current) setNotificationsOn(enabled);
        })
        .catch(() => {});

      return () => {
        mounted.current = false;
      };
    }, []),
  );

  const runAction = useCallback(
    (action: () => Promise<void>) => {
      if (busy) return;

      setBusy(true);

      void action()
        .catch((error: unknown) => {
          if (mounted.current) {
            setFailure(error instanceof Error ? error : new Error(String(error)));
          }
        })
        .finally(() => {
          if (mounted.current) {
            setBusy(false);
            setConfirming(false);
          }
        });
    },
    [busy],
  );

  const handleReset = useCallback(() => {
    runAction(async () => {
      await Promise.all(kvKeys.map((key) => AsyncStorage.setItem(key, '')));
      await resetLocalData(sqlite);
    });
  }, [runAction]);

  const handleToggleNotifications = useCallback(() => {
    runAction(async () => {
      if (notificationsOn === true) {
        await setNotificationsEnabled(false);
        // План с morning:null и без вечернего отменяет всё запланированное.
        await rebuildSchedule({ coreDoneToday: true, inactiveDays: 999 });
        setNotificationsOn(false);

        return;
      }

      let coreDoneToday = false;
      const core = await getActiveCoreTask(sqlite);

      if (core !== null) {
        coreDoneToday = (await hasTaskLog(sqlite, core.id, today())) === 'done';
      }

      await enableAndSchedule(coreDoneToday);
      setNotificationsOn(await notificationsEnabled());
    });
  }, [notificationsOn, runAction]);

  if (failure !== null) throw failure;

  return (
    <ScreenShell level="L0">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {ru.settings.title}
        </Text>

        <View style={styles.section}>
          <Text style={styles.rowLabel}>{ru.settings.notifications}</Text>
          <AppButton
            disabled={busy || notificationsOn === null}
            label={
              notificationsOn === true ? ru.settings.notificationsOn : ru.settings.notificationsOff
            }
            onPress={handleToggleNotifications}
            variant="secondary"
          />
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
