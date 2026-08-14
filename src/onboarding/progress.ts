import { launchStateKeys, type KeyValueStorage } from '../launch/state';
import type { OnboardingStep } from './steps';

export type OnboardingChoiceEvent = 'onb_commit' | 'onb_skip';

export const onboardingProgressKeys = {
  choiceEvent: 'onboarding.choiceEvent',
} as const;

export function saveOnboardingStep(storage: KeyValueStorage, step: OnboardingStep): Promise<void> {
  return storage.setItem(launchStateKeys.onboardingStep, String(step));
}

export function markOnboardingComplete(storage: KeyValueStorage): Promise<void> {
  return storage.setItem(launchStateKeys.onboardingCompleted, '1');
}

export function recordOnboardingChoice(
  storage: KeyValueStorage,
  event: OnboardingChoiceEvent,
): Promise<void> {
  return storage.setItem(onboardingProgressKeys.choiceEvent, event);
}
