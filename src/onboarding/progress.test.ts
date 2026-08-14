import { readLaunchState, type KeyValueStorage } from '../launch/state';
import { saveOnboardingStep } from './progress';

function createMemoryStorage(): KeyValueStorage {
  const values = new Map<string, string>();

  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
  };
}

describe('onboarding progress', () => {
  test('persists and restores the current step rather than the maximum reached', async () => {
    const storage = createMemoryStorage();

    await saveOnboardingStep(storage, 19);
    await saveOnboardingStep(storage, 4);

    expect(await readLaunchState(storage)).toEqual({
      hasSeenWelcome: false,
      onboardingCompleted: false,
      currentOnboardingStep: 4,
    });
  });
});
