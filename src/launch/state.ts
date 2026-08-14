import {
  getOnboardingRoute,
  parseOnboardingStep,
  type OnboardingRoute,
} from '../onboarding/routing';
import type { OnboardingStep } from '../onboarding/steps';

export type KeyValueStorage = Readonly<{
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}>;

export type LaunchState = Readonly<{
  hasSeenWelcome: boolean;
  onboardingCompleted: boolean;
  currentOnboardingStep: OnboardingStep;
}>;

export type WelcomeMode = 'full' | 'repeat' | 'final-frame';
export type LaunchDestination = OnboardingRoute | '/(tabs)';

export const launchStateKeys = {
  welcomeSeen: 'launch.welcomeSeen',
  onboardingCompleted: 'launch.onboardingCompleted',
  onboardingStep: 'launch.onboardingStep',
} as const;

export async function readLaunchState(storage: KeyValueStorage): Promise<LaunchState> {
  const [welcomeSeen, onboardingCompleted, onboardingStep] = await Promise.all([
    storage.getItem(launchStateKeys.welcomeSeen),
    storage.getItem(launchStateKeys.onboardingCompleted),
    storage.getItem(launchStateKeys.onboardingStep),
  ]);

  return {
    hasSeenWelcome: welcomeSeen === '1',
    onboardingCompleted: onboardingCompleted === '1',
    currentOnboardingStep: parseOnboardingStep(onboardingStep ?? undefined) ?? 1,
  };
}

export function markWelcomeSeen(storage: KeyValueStorage) {
  return storage.setItem(launchStateKeys.welcomeSeen, '1');
}

export function selectWelcomeMode({
  hasSeenWelcome,
  reducedMotion,
}: Readonly<{ hasSeenWelcome: boolean; reducedMotion: boolean }>): WelcomeMode {
  if (reducedMotion) return 'final-frame';
  return hasSeenWelcome ? 'repeat' : 'full';
}

export function getLaunchDestination(state: LaunchState): LaunchDestination {
  return state.onboardingCompleted ? '/(tabs)' : getOnboardingRoute(state.currentOnboardingStep);
}
