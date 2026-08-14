import { getOnboardingShellLight, onboardingSteps } from './steps';

describe('onboarding step light configuration', () => {
  test('matches the documented light map for all 22 screens', () => {
    expect(onboardingSteps).toEqual([
      { step: 1, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 2, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 3, light: { startLevel: 'L2', temperature: 'cool' } },
      { step: 4, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 5, light: { startLevel: 'L0', temperature: 'cool' } },
      { step: 6, light: { startLevel: 'L2', temperature: 'cool' } },
      { step: 7, light: { startLevel: 'L0', temperature: 'cool' } },
      { step: 8, light: { startLevel: 'L3', temperature: 'warm' } },
      { step: 9, light: { startLevel: 'L2', temperature: 'cool' } },
      { step: 10, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 11, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 12, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 13, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 14, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 15, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 16, light: { startLevel: 'L1', temperature: 'cool' } },
      { step: 17, light: { startLevel: 'L1', temperature: 'cool' } },
      {
        step: 18,
        light: { startLevel: 'L1', endLevel: 'L3', temperature: 'cool' },
      },
      { step: 19, light: { startLevel: 'L4', temperature: 'cool' } },
      { step: 20, light: { startLevel: 'L3', temperature: 'cool' } },
      { step: 21, light: { startLevel: 'L4', temperature: 'cool' } },
      { step: 22, light: { startLevel: 'L1', temperature: 'cool' } },
    ]);
  });

  test('uses the start of screen 18 transition in the T14 shell', () => {
    expect(getOnboardingShellLight(18)).toEqual({ level: 'L1', temperature: 'cool' });
  });
});
