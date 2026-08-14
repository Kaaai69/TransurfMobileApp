import { categories, type Category } from '../db/schema';

export type AdherenceStatus = 'done' | 'missed' | 'forgiven';

export type AdherenceDay = Readonly<{
  date: string;
  status: AdherenceStatus;
}>;

export type TierProgress = Readonly<{
  startedAt: string;
  days: readonly AdherenceDay[];
}>;

export const xpAwards = {
  core_completed: 10,
  support_completed: 3,
  micro_completed: 5,
  custom_completed: 5,
  perfect_week: 25,
  tier_unlocked: 100,
} as const;

export type XpEvent = keyof typeof xpAwards;

const dayMilliseconds = 24 * 60 * 60 * 1000;

function utcDay(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / dayMilliseconds;
}

export function calculateAdherence(days: readonly AdherenceDay[], asOf: string) {
  const asOfDay = utcDay(asOf);
  const activeWindow = days.filter((entry) => {
    const age = asOfDay - utcDay(entry.date);
    return age >= 0 && age < 14 && entry.status !== 'forgiven';
  });

  if (activeWindow.length === 0) return 0;

  const completed = activeWindow.filter((entry) => entry.status === 'done').length;
  return completed / activeWindow.length;
}

export function isTierUnlockEligible(progress: TierProgress, asOf: string) {
  const elapsedDays = utcDay(asOf) - utcDay(progress.startedAt);
  return elapsedDays >= 21 && calculateAdherence(progress.days, asOf) >= 0.7;
}

export function evaluateTierUnlocks(
  progressByCategory: Readonly<Record<Category, TierProgress>>,
  asOf: string,
) {
  return Object.fromEntries(
    categories.map((category) => [
      category,
      isTierUnlockEligible(progressByCategory[category], asOf),
    ]),
  ) as Record<Category, boolean>;
}

export function applyXpEvent(currentXp: number, event: XpEvent) {
  if (!Number.isSafeInteger(currentXp) || currentXp < 0) {
    throw new RangeError('XP must be a non-negative safe integer');
  }

  return currentXp + xpAwards[event];
}
