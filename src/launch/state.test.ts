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
    });

    await markWelcomeSeen(storage);

    expect(await readLaunchState(storage)).toEqual({
      hasSeenWelcome: true,
      onboardingCompleted: false,
    });
  });

  test('routes to onboarding or the daily screen from stored state', () => {
    expect(getLaunchDestination({ hasSeenWelcome: true, onboardingCompleted: false })).toBe(
      '/onboarding/1',
    );
    expect(getLaunchDestination({ hasSeenWelcome: true, onboardingCompleted: true })).toBe(
      '/(tabs)',
    );
  });
});
