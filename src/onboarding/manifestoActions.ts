import type { KeyValueStorage } from '../launch/state';
import {
  markOnboardingComplete,
  recordOnboardingChoice,
  type OnboardingChoiceEvent,
} from './progress';
import { getNextOnboardingRoute, type OnboardingRoute } from './routing';
import type { ManifestoStep } from './manifesto';

export type ManifestoActionKind = 'primary' | 'skip';
export type ManifestoActionResult = Readonly<{
  destination: OnboardingRoute | '/(tabs)';
  event: OnboardingChoiceEvent | null;
}>;

export async function performManifestoAction(
  storage: KeyValueStorage,
  step: ManifestoStep,
  action: ManifestoActionKind,
): Promise<ManifestoActionResult> {
  if (action === 'skip') {
    if (step !== 10) {
      throw new Error('Skip is only available on manifesto screen 10');
    }

    await Promise.all([
      markOnboardingComplete(storage),
      recordOnboardingChoice(storage, 'onb_skip'),
    ]);

    return { destination: '/(tabs)', event: 'onb_skip' };
  }

  if (step === 10) {
    await recordOnboardingChoice(storage, 'onb_commit');
    return { destination: '/onboarding/11', event: 'onb_commit' };
  }

  const destination = getNextOnboardingRoute(step);

  if (destination === null) {
    throw new Error(`Manifesto screen ${step} has no next route`);
  }

  return { destination, event: null };
}
