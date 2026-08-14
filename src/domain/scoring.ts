import type { Category } from '../db/schema';

export type Frequency4 = 'daily' | 'weekly' | 'rarely' | 'almost_never';

export type OnboardingAnswers = Readonly<{
  bedtimeMinutes: number;
  sleepHours: number;
  unrestedFrequency: Frequency4;
  energyPeak: 'morning' | 'day' | 'evening' | 'night' | 'none';
  caffeineServings: 'none' | 'one_two' | 'three_four' | 'five_plus';
  lastCaffeineMinutes: number | null;
  movementFrequency: 'zero' | 'one_two' | 'three_four' | 'five_plus';
  sittingHours: 'under_four' | 'four_seven' | 'eight_eleven' | 'over_eleven';
  rushedMealFrequency: 'almost_always' | 'often' | 'sometimes' | 'rarely';
  firstMealMinutes: number;
  waterGlasses: 'under_one' | 'two_three' | 'four_six' | 'over_six';
  focusBlocker: 'racing_thoughts' | 'phone' | 'fatigue' | 'others' | 'none';
  bedtimeThoughtFrequency: Frequency4;
  morningAction: 'phone' | 'shower' | 'food' | 'light' | 'other';
  priority: 'sleep' | 'focus' | 'energy' | 'anxiety' | 'fitness' | 'procrastination';
  budgetMinutes: 5 | 15 | 30 | 'more';
}>;

export type CategoryScores = Record<Category, number>;

export type ScoringResult = Readonly<{
  scores: CategoryScores;
  weakestLink: Category;
}>;

const frequencyScores: Record<Frequency4, number> = {
  daily: 15,
  weekly: 40,
  rarely: 75,
  almost_never: 100,
};

const weakestLinkOrder: readonly Category[] = [
  'sleep',
  'movement',
  'mind',
  'energy',
  'food',
  'water',
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeMinutes(minutes: number) {
  return ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
}

function bedtimeScore(minutes: number) {
  const normalized = normalizeMinutes(minutes);

  if (normalized >= 21 * 60 && normalized < 23 * 60) return 100;
  if (normalized >= 23 * 60) return 75;
  if (normalized < 60) return 45;
  return 20;
}

function sleepDurationScore(hours: number) {
  if (hours >= 7) return 100;
  if (hours >= 6) return 70;
  if (hours >= 5) return 40;
  return 15;
}

function minutesBeforeBedtime(bedtimeMinutes: number, eventMinutes: number) {
  return (normalizeMinutes(bedtimeMinutes) - normalizeMinutes(eventMinutes) + 24 * 60) % (24 * 60);
}

function caffeineTimingScore(answers: OnboardingAnswers) {
  if (answers.caffeineServings === 'none' || answers.lastCaffeineMinutes === null) return 100;

  const gap = minutesBeforeBedtime(answers.bedtimeMinutes, answers.lastCaffeineMinutes);
  if (gap >= 10 * 60) return 100;
  if (gap >= 8 * 60) return 75;
  if (gap >= 6 * 60) return 40;
  return 15;
}

function hasLateCaffeine(answers: OnboardingAnswers) {
  return (
    answers.caffeineServings !== 'none' &&
    answers.lastCaffeineMinutes !== null &&
    minutesBeforeBedtime(answers.bedtimeMinutes, answers.lastCaffeineMinutes) < 6 * 60
  );
}

function firstMealScore(minutes: number) {
  const normalized = normalizeMinutes(minutes);

  if (normalized >= 6 * 60 && normalized < 9 * 60) return 100;
  if (normalized >= 9 * 60 && normalized < 12 * 60) return 75;
  if (normalized >= 12 * 60 && normalized < 14 * 60) return 40;
  return 15;
}

export function findWeakestLink(scores: CategoryScores): Category {
  return weakestLinkOrder.reduce((weakest, category) =>
    scores[category] < scores[weakest] ? category : weakest,
  );
}

export function calculateScores(answers: OnboardingAnswers): ScoringResult {
  const sleepModifier =
    (hasLateCaffeine(answers) ? -12 : 0) + (answers.morningAction === 'phone' ? -5 : 0);
  const sleep = clampScore(
    sleepDurationScore(answers.sleepHours) * 0.45 +
      frequencyScores[answers.unrestedFrequency] * 0.35 +
      bedtimeScore(answers.bedtimeMinutes) * 0.2 +
      sleepModifier,
  );

  const energyPeakScores: Record<OnboardingAnswers['energyPeak'], number> = {
    morning: 100,
    day: 80,
    evening: 60,
    night: 35,
    none: 15,
  };
  const caffeineServingScores: Record<OnboardingAnswers['caffeineServings'], number> = {
    none: 100,
    one_two: 75,
    three_four: 40,
    five_plus: 15,
  };
  const energy = clampScore(
    energyPeakScores[answers.energyPeak] * 0.3 +
      caffeineServingScores[answers.caffeineServings] * 0.35 +
      caffeineTimingScore(answers) * 0.35,
  );

  const movementFrequencyScores: Record<OnboardingAnswers['movementFrequency'], number> = {
    zero: 15,
    one_two: 40,
    three_four: 75,
    five_plus: 100,
  };
  const sittingScores: Record<OnboardingAnswers['sittingHours'], number> = {
    under_four: 100,
    four_seven: 75,
    eight_eleven: 40,
    over_eleven: 15,
  };
  const movement = clampScore(
    movementFrequencyScores[answers.movementFrequency] * 0.6 +
      sittingScores[answers.sittingHours] * 0.4,
  );

  const rushedMealScores: Record<OnboardingAnswers['rushedMealFrequency'], number> = {
    almost_always: 15,
    often: 40,
    sometimes: 75,
    rarely: 100,
  };
  const food = clampScore(
    rushedMealScores[answers.rushedMealFrequency] * 0.6 +
      firstMealScore(answers.firstMealMinutes) * 0.4,
  );

  const waterScores: Record<OnboardingAnswers['waterGlasses'], number> = {
    under_one: 15,
    two_three: 40,
    four_six: 75,
    over_six: 100,
  };
  const water = clampScore(waterScores[answers.waterGlasses]);

  const focusBlockerScore = answers.focusBlocker === 'none' ? 100 : 40;
  const morningActionScores: Record<OnboardingAnswers['morningAction'], number> = {
    phone: 15,
    shower: 75,
    food: 75,
    light: 100,
    other: 75,
  };
  const mind = clampScore(
    focusBlockerScore * 0.35 +
      frequencyScores[answers.bedtimeThoughtFrequency] * 0.4 +
      morningActionScores[answers.morningAction] * 0.25,
  );

  const scores = { sleep, energy, movement, food, water, mind };

  return { scores, weakestLink: findWeakestLink(scores) };
}
