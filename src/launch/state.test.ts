import {
  getLaunchDestination,
  markWelcomeSeen,
  readLaunchState,
  selectWelcomeMode,
  type KeyValueStorage,
} from './state';

function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const values = new Map(Object.entries(initial));

  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
  };
}

describe('launch state', () => {
  test('uses the complete source video on the first launch', () => {
    expect(selectWelcomeMode({ hasSeenWelcome: false, reducedMotion: false })).toBe('full');
  });

  test('uses the derived final clip after the first launch', () => {
    expect(selectWelcomeMode({ hasSeenWelcome: true, reducedMotion: false })).toBe('repeat');
  });

  test('uses the final frame when reduced motion is enabled', () => {
    expect(selectWelcomeMode({ hasSeenWelcome: false, reducedMotion: true })).toBe('final-frame');
    expect(selectWelcomeMode({ hasSeenWelcome: true, reducedMotion: true })).toBe('final-frame');
  });

  test('persists completion for later launches', async () => {
    const storage = createMemoryStorage();

    expect(await readLaunchState(storage)).toEqual({
      hasSeenWelcome: false,
      onboardingCompleted: false,
      currentOnboardingStep: 1,
    });

    await markWelcomeSeen(storage);

    expect(await readLaunchState(storage)).toEqual({
      hasSeenWelcome: true,
      onboardingCompleted: false,
      currentOnboardingStep: 1,
    });
  });

  test('routes to the stored onboarding step or the daily screen', () => {
    expect(
      getLaunchDestination({
        hasSeenWelcome: true,
        onboardingCompleted: false,
        currentOnboardingStep: 14,
      }),
    ).toBe('/onboarding/14');
    expect(
      getLaunchDestination({
        hasSeenWelcome: true,
        onboardingCompleted: true,
        currentOnboardingStep: 14,
      }),
    ).toBe('/(tabs)');
  });

  test('falls back to step 1 when stored onboarding progress is invalid', async () => {
    const storage = createMemoryStorage({ 'launch.onboardingStep': '23' });

    expect((await readLaunchState(storage)).currentOnboardingStep).toBe(1);
  });
});
