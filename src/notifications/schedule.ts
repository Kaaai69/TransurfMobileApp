import * as Notifications from 'expo-notifications';
import AsyncStorage from 'expo-sqlite/kv-store';

import { diffInDays, today } from '../domain/dates';
import { ru } from '../i18n/ru';
import { computeNotificationPlan, nextEveningOccurrence, type NotificationPlan } from './plan';

export const notificationSettingsKey = 'settings.notifications';
const lastOpenKey = 'daily.lastOpen';

const morningId = 'transurf.morning';
const eveningId = 'transurf.evening';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export function notificationsEnabled(): Promise<boolean> {
  return AsyncStorage.getItem(notificationSettingsKey).then((value) => value === '1');
}

export function setNotificationsEnabled(enabled: boolean): Promise<void> {
  return AsyncStorage.setItem(notificationSettingsKey, enabled ? '1' : '');
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) return true;
  if (current.status === Notifications.PermissionStatus.UNDETERMINED) {
    const requested = await Notifications.requestPermissionsAsync();

    return requested.granted;
  }

  return false;
}

async function scheduleMorning(frequency: 'daily' | 'weekly'): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: morningId,
    content: {
      title: ru.notifications.morningTitle,
      body: ru.notifications.morningBody,
    },
    trigger:
      frequency === 'daily'
        ? {
            hour: 8,
            minute: 0,
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
          }
        : {
            weekday: 2,
            hour: 8,
            minute: 0,
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          },
  });
}

async function scheduleEvening(now: Date): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: eveningId,
    content: {
      title: ru.notifications.eveningTitle,
      body: ru.notifications.eveningBody,
    },
    trigger: {
      date: nextEveningOccurrence(now.getHours(), now),
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });
}

async function cancelByIds(ids: readonly string[]): Promise<void> {
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Идентификатора может не быть — это нормальное состояние.
    }
  }
}

/**
 * Перестраивает расписание при каждом открытии приложения.
 * Пуши локальные; тротлинг считается по факту отметки ядра и дням неактивности.
 */
export async function rebuildSchedule(input: {
  coreDoneToday: boolean;
  inactiveDays: number;
}): Promise<void> {
  const enabled = await notificationsEnabled();
  const plan: NotificationPlan = enabled
    ? computeNotificationPlan({ ...input, hourNow: new Date().getHours() })
    : { morning: null, eveningTonight: false };

  if (!enabled || (plan.morning === null && !plan.eveningTonight)) {
    await cancelByIds([morningId, eveningId]);
    return;
  }

  await cancelByIds([morningId, eveningId]);

  if (plan.morning !== null) await scheduleMorning(plan.morning);

  if (plan.eveningTonight) await scheduleEvening(new Date());
}

export async function enableAndSchedule(coreDoneToday: boolean): Promise<void> {
  const granted = await ensurePermission();

  await setNotificationsEnabled(granted);

  if (granted) {
    await rebuildSchedule({ coreDoneToday, inactiveDays: 0 });
  }
}

/** Вызывается при каждом открытии экрана дня: считает неактивность и перестраивает расписание. */
export async function rebuildOnAppOpen(coreDoneToday: boolean): Promise<void> {
  const day = today();
  const lastOpen = await AsyncStorage.getItem(lastOpenKey);
  const inactiveDays = lastOpen === null ? 0 : Math.max(0, diffInDays(lastOpen, day) - 1);

  await rebuildSchedule({ coreDoneToday, inactiveDays });
  await AsyncStorage.setItem(lastOpenKey, day);
}
