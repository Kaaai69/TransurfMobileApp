import { getNextOnboardingRoute, getPreviousOnboardingRoute, parseOnboardingStep } from './routing';

const validSteps = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
] as const;

describe('onboarding routing', () => {
  test.each(validSteps)('accepts route step %i', (step) => {
    expect(parseOnboardingStep(String(step))).toBe(step);
  });

  test.each([undefined, [], ['1'], '-1', '0', '01', '1.5', '22.0', '23', '99', ' 1', '1 ', 'step'])(
    'rejects invalid route step %p',
    (value) => {
      expect(parseOnboardingStep(value)).toBeNull();
    },
  );

  test('returns replace targets for the neighboring steps', () => {
    expect(getPreviousOnboardingRoute(1)).toBeNull();
    expect(getNextOnboardingRoute(1)).toBe('/onboarding/2');
    expect(getPreviousOnboardingRoute(12)).toBe('/onboarding/11');
    expect(getNextOnboardingRoute(12)).toBe('/onboarding/13');
    expect(getPreviousOnboardingRoute(22)).toBe('/onboarding/21');
    expect(getNextOnboardingRoute(22)).toBeNull();
  });
});
