import { runCalculation, sanitizeOnboardingResult } from './result';
import type { OnboardingAnswers } from '../domain/scoring';

const answers: OnboardingAnswers = {
  bedtimeMinutes: 22 * 60 + 30,
  sleepHours: 7,
  unrestedFrequency: 'rarely',
  energyPeak: 'day',
  caffeineServings: 'one_two',
  lastCaffeineMinutes: 14 * 60,
  movementFrequency: 'one_two',
  sittingHours: 'eight_eleven',
  rushedMealFrequency: 'sometimes',
  firstMealMinutes: 9 * 60,
  waterGlasses: 'two_three',
  focusBlocker: 'phone',
  bedtimeThoughtFrequency: 'weekly',
  morningAction: 'phone',
  priority: 'energy',
  budgetMinutes: 15,
};

function makeClock(start: number) {
  let current = start;

  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
  };
}

describe('runCalculation', () => {
  test('completes every stage and measures the real duration', async () => {
    const clock = makeClock(1_000);
    const ticks: number[] = [];
    const result = await runCalculation(answers, {
      now: clock.now,
      tick: async () => {
        clock.advance(7);
        ticks.push(clock.now());
      },
    });

    expect(ticks).toHaveLength(3);
    expect(result.calcMs).toBe(21);
    expect(result.calculatedAt).toBe(new Date(1_021).toISOString());
    expect(result.baseline).toEqual(result.scores);
    expect(Object.values(result.scores).every((value) => value >= 0 && value <= 100)).toBe(true);
    expect(result.firstTaskTemplateId).toBe(`${result.weakestLink}-1`);
  });

  test('applies the five minute budget rule inside the staged flow', async () => {
    const result = await runCalculation({ ...answers, budgetMinutes: 5 }, { now: () => 0 });

    expect(result.firstTaskTemplateId).toBe('mind-1');
  });
});

describe('sanitizeOnboardingResult', () => {
  test('accepts a stored result and normalises calcMs', async () => {
    const result = await runCalculation(answers, { now: () => 50 });

    expect(sanitizeOnboardingResult(JSON.parse(JSON.stringify(result)))).toEqual(result);
  });

  test('accepts mind-1 as the first task regardless of the weakest link', async () => {
    const scores = { sleep: 40, energy: 41, movement: 28, food: 52, water: 46, mind: 30 };
    const stored = {
      baseline: scores,
      scores,
      weakestLink: 'sleep',
      firstTaskTemplateId: 'mind-1',
      calcMs: -5,
      calculatedAt: '2026-08-26T00:00:00.000Z',
    };

    const sanitized = sanitizeOnboardingResult(stored);

    expect(sanitized?.firstTaskTemplateId).toBe('mind-1');
    expect(sanitized?.calcMs).toBe(0);
  });

  test('rejects broken payloads', () => {
    expect(sanitizeOnboardingResult(null)).toBeNull();
    expect(sanitizeOnboardingResult({})).toBeNull();
    expect(
      sanitizeOnboardingResult({
        baseline: {},
        scores: {},
        weakestLink: 'sleep',
        firstTaskTemplateId: 'sleep-1',
        calcMs: 1,
        calculatedAt: '',
      }),
    ).toBeNull();
    expect(
      sanitizeOnboardingResult({
        baseline: { sleep: 1, energy: 1, movement: 1, food: 1, water: 1, mind: 1 },
        scores: { sleep: 1, energy: 1, movement: 1, food: 1, water: 1, mind: 1 },
        weakestLink: 'sleep',
        firstTaskTemplateId: 'movement-1',
        calcMs: 1,
        calculatedAt: '2026-08-26T00:00:00.000Z',
      }),
    ).toBeNull();
  });
});
