import { onboardingStepNumbers, type OnboardingStep } from './steps';

export type OnboardingRoute = `/onboarding/${OnboardingStep}`;

export function parseOnboardingStep(value: string | string[] | undefined): OnboardingStep | null {
  if (typeof value !== 'string' || !/^(?:[1-9]|1[0-9]|2[0-2])$/.test(value)) {
    return null;
  }

  return Number(value) as OnboardingStep;
}

export function getOnboardingRoute(step: OnboardingStep): OnboardingRoute {
  return `/onboarding/${step}`;
}

export function getPreviousOnboardingRoute(step: OnboardingStep): OnboardingRoute | null {
  const index = onboardingStepNumbers.indexOf(step);
  const previous = onboardingStepNumbers[index - 1];

  return previous === undefined ? null : getOnboardingRoute(previous);
}

export function getNextOnboardingRoute(step: OnboardingStep): OnboardingRoute | null {
  const index = onboardingStepNumbers.indexOf(step);
  const next = onboardingStepNumbers[index + 1];

  return next === undefined ? null : getOnboardingRoute(next);
}
