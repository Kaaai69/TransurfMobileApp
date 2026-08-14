export type KeyValueStorage = Readonly<{
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}>;

export type LaunchState = Readonly<{
  hasSeenWelcome: boolean;
  onboardingCompleted: boolean;
}>;

export type WelcomeMode = 'full' | 'repeat' | 'final-frame';
export type LaunchDestination = '/onboarding/1' | '/(tabs)';

export const launchStateKeys = {
  welcomeSeen: 'launch.welcomeSeen',
  onboardingCompleted: 'launch.onboardingCompleted',
} as const;

export async function readLaunchState(storage: KeyValueStorage): Promise<LaunchState> {
  const [welcomeSeen, onboardingCompleted] = await Promise.all([
    storage.getItem(launchStateKeys.welcomeSeen),
    storage.getItem(launchStateKeys.onboardingCompleted),
  ]);

  return {
    hasSeenWelcome: welcomeSeen === '1',
    onboardingCompleted: onboardingCompleted === '1',
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
  return state.onboardingCompleted ? '/(tabs)' : '/onboarding/1';
}
