import { launchStateKeys, type KeyValueStorage } from '../launch/state';
import type { OnboardingStep } from './steps';

export function saveOnboardingStep(storage: KeyValueStorage, step: OnboardingStep): Promise<void> {
  return storage.setItem(launchStateKeys.onboardingStep, String(step));
}
