import { categories, type Category } from '../db/schema';
import {
  applyXpEvent,
  calculateAdherence,
  evaluateTierUnlocks,
  isTierUnlockEligible,
  xpAwards,
  type AdherenceDay,
  type TierProgress,
  type XpEvent,
} from './tiers';

function day(date: string, status: AdherenceDay['status']): AdherenceDay {
  return { date, status };
}

const qualifyingWindow: readonly AdherenceDay[] = [
  day('2026-08-01', 'done'),
  day('2026-08-02', 'done'),
  day('2026-08-03', 'done'),
  day('2026-08-04', 'done'),
  day('2026-08-05', 'done'),
  day('2026-08-06', 'done'),
  day('2026-08-07', 'done'),
  day('2026-08-08', 'done'),
  day('2026-08-09', 'done'),
  day('2026-08-10', 'done'),
  day('2026-08-11', 'missed'),
  day('2026-08-12', 'missed'),
  day('2026-08-13', 'missed'),
  day('2026-08-14', 'missed'),
];

describe('tier unlocks', () => {
  test('unlocks at seventy percent adherence after twenty-one elapsed days', () => {
    const progress: TierProgress = {
      startedAt: '2026-07-24',
      days: qualifyingWindow,
    };

    expect(calculateAdherence(progress.days, '2026-08-14')).toBeCloseTo(10 / 14);
    expect(isTierUnlockEligible(progress, '2026-08-14')).toBe(true);
  });

  test('requires both the adherence threshold and elapsed time', () => {
    expect(
      isTierUnlockEligible({ startedAt: '2026-07-25', days: qualifyingWindow }, '2026-08-14'),
    ).toBe(false);

    expect(
      isTierUnlockEligible(
        {
          startedAt: '2026-07-24',
          days: qualifyingWindow.map((entry, index) =>
            index === 9 ? { ...entry, status: 'missed' } : entry,
          ),
        },
        '2026-08-14',
      ),
    ).toBe(false);
  });

  test('excludes forgiven days from the adherence denominator', () => {
    const days = qualifyingWindow.map((entry, index) =>
      index >= 9 && index <= 10 ? { ...entry, status: 'forgiven' as const } : entry,
    );

    expect(calculateAdherence(days, '2026-08-14')).toBeCloseTo(9 / 12);
  });

  test('evaluates categories independently', () => {
    const progress = Object.fromEntries(
      categories.map((category) => [
        category,
        {
          startedAt: category === 'sleep' ? '2026-07-24' : '2026-08-01',
          days: qualifyingWindow,
        },
      ]),
    ) as Record<Category, TierProgress>;

    expect(evaluateTierUnlocks(progress, '2026-08-14')).toEqual({
      sleep: true,
      energy: false,
      movement: false,
      food: false,
      water: false,
      mind: false,
    });
  });
});

describe('XP awards', () => {
  test('matches the task library values', () => {
    expect(xpAwards).toEqual({
      core_completed: 10,
      support_completed: 3,
      micro_completed: 5,
      custom_completed: 5,
      perfect_week: 25,
      tier_unlocked: 100,
    });
  });

  test('never decreases across 500 random event sequences', () => {
    const events = Object.keys(xpAwards) as XpEvent[];
    let seed = 0x51f15e;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x1_0000_0000;
    };

    for (let sequence = 0; sequence < 500; sequence += 1) {
      let xp = Math.floor(random() * 10_000);
      const eventCount = 1 + Math.floor(random() * 100);

      for (let index = 0; index < eventCount; index += 1) {
        const previousXp = xp;
        const event = events[Math.floor(random() * events.length)];
        xp = applyXpEvent(xp, event);
        expect(xp).toBeGreaterThanOrEqual(previousXp);
      }
    }
  });
});
