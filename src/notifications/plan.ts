export type NotificationPlan = Readonly<{
  /** Ежедневный утренний пуш в 08:00; после 7 дней неактивности — раз в неделю. */
  morning: 'daily' | 'weekly' | null;
  /** Разовый вечерний пуш сегодня в 21:00, если задача ещё не закрыта. */
  eveningTonight: boolean;
}>;

export const morningHour = 8;
export const eveningHour = 21;

/**
 * Карта пушей из docs/day1-14-and-goals.md: не больше двух в день, никогда ночью.
 * Тротлинг: 3 дня не открывал приложение — вечерние прекращаются;
 * 7 дней — остаётся один пуш в неделю.
 */
export function computeNotificationPlan(input: {
  hourNow: number;
  coreDoneToday: boolean;
  inactiveDays: number;
}): NotificationPlan {
  if (input.inactiveDays >= 7) {
    return { morning: 'weekly', eveningTonight: false };
  }

  const eveningAllowed =
    input.inactiveDays < 3 && !input.coreDoneToday && input.hourNow < eveningHour;

  return {
    morning: 'daily',
    eveningTonight: eveningAllowed,
  };
}

/** Ближайший момент сегодня или завтра для вечернего пула (21:00 локального времени). */
export function nextEveningOccurrence(hourNow: number, now: Date): Date {
  const occurrence = new Date(now);

  occurrence.setHours(eveningHour, 0, 0, 0);

  if (hourNow >= eveningHour) {
    occurrence.setDate(occurrence.getDate() + 1);
  }

  return occurrence;
}
