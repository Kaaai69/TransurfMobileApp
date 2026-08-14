import {
  calculateScores,
  findWeakestLink,
  type CategoryScores,
  type OnboardingAnswers,
} from './scoring';

const bestAnswers = {
  bedtimeMinutes: 22 * 60,
  sleepHours: 8,
  unrestedFrequency: 'almost_never',
  energyPeak: 'morning',
  caffeineServings: 'none',
  lastCaffeineMinutes: null,
  movementFrequency: 'five_plus',
  sittingHours: 'under_four',
  rushedMealFrequency: 'rarely',
  firstMealMinutes: 8 * 60,
  waterGlasses: 'over_six',
  focusBlocker: 'none',
  bedtimeThoughtFrequency: 'almost_never',
  morningAction: 'light',
  priority: 'sleep',
  budgetMinutes: 30,
} as const satisfies OnboardingAnswers;

const worstAnswers = {
  bedtimeMinutes: 2 * 60,
  sleepHours: 4,
  unrestedFrequency: 'daily',
  energyPeak: 'none',
  caffeineServings: 'five_plus',
  lastCaffeineMinutes: 23 * 60,
  movementFrequency: 'zero',
  sittingHours: 'over_eleven',
  rushedMealFrequency: 'almost_always',
  firstMealMinutes: 16 * 60,
  waterGlasses: 'under_one',
  focusBlocker: 'racing_thoughts',
  bedtimeThoughtFrequency: 'daily',
  morningAction: 'phone',
  priority: 'procrastination',
  budgetMinutes: 5,
} as const satisfies OnboardingAnswers;

describe('onboarding scoring', () => {
  test('maps all-best answers to six clamped maximum values', () => {
    expect(calculateScores(bestAnswers)).toEqual({
      scores: { sleep: 100, energy: 100, movement: 100, food: 100, water: 100, mind: 100 },
      weakestLink: 'sleep',
    });
  });

  test('maps all-worst answers without producing values below zero', () => {
    expect(calculateScores(worstAnswers)).toEqual({
      scores: { sleep: 0, energy: 15, movement: 15, food: 15, water: 15, mind: 24 },
      weakestLink: 'sleep',
    });
  });

  test('applies the caffeine penalty across midnight only inside six hours of bedtime', () => {
    const sevenHoursBefore = calculateScores({
      ...bestAnswers,
      bedtimeMinutes: 60,
      caffeineServings: 'one_two',
      lastCaffeineMinutes: 18 * 60,
    });
    const fiveHoursBefore = calculateScores({
      ...bestAnswers,
      bedtimeMinutes: 60,
      caffeineServings: 'one_two',
      lastCaffeineMinutes: 20 * 60,
    });

    expect(sevenHoursBefore.scores.sleep - fiveHoursBefore.scores.sleep).toBe(12);
  });

  test('uses the fixed weakest-link order for every tie position', () => {
    const scores: CategoryScores = {
      sleep: 0,
      movement: 0,
      mind: 0,
      energy: 0,
      food: 0,
      water: 0,
    };

    expect(findWeakestLink(scores)).toBe('sleep');
    scores.sleep = 1;
    expect(findWeakestLink(scores)).toBe('movement');
    scores.movement = 1;
    expect(findWeakestLink(scores)).toBe('mind');
    scores.mind = 1;
    expect(findWeakestLink(scores)).toBe('energy');
    scores.energy = 1;
    expect(findWeakestLink(scores)).toBe('food');
    scores.food = 1;
    expect(findWeakestLink(scores)).toBe('water');
  });
});
