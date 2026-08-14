import { readLaunchState, type KeyValueStorage } from '../launch/state';
import { onboardingProgressKeys } from './progress';
import { performManifestoAction } from './manifestoActions';

function createMemoryStorage() {
  const values = new Map<string, string>();
  const storage: KeyValueStorage = {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
  };

  return { storage, values };
}

describe('manifesto actions', () => {
  test('continues through screens 1–9 without completing onboarding', async () => {
    const { storage, values } = createMemoryStorage();

    expect(await performManifestoAction(storage, 4, 'primary')).toEqual({
      destination: '/onboarding/5',
      event: null,
    });
    expect((await readLaunchState(storage)).onboardingCompleted).toBe(false);
    expect(values.has(onboardingProgressKeys.choiceEvent)).toBe(false);
  });

  test('records commitment separately and opens the questions', async () => {
    const { storage, values } = createMemoryStorage();

    expect(await performManifestoAction(storage, 10, 'primary')).toEqual({
      destination: '/onboarding/11',
      event: 'onb_commit',
    });
    expect((await readLaunchState(storage)).onboardingCompleted).toBe(false);
    expect(values.get(onboardingProgressKeys.choiceEvent)).toBe('onb_commit');
  });

  test('records skip separately, completes onboarding, and opens the app', async () => {
    const { storage, values } = createMemoryStorage();

    expect(await performManifestoAction(storage, 10, 'skip')).toEqual({
      destination: '/(tabs)',
      event: 'onb_skip',
    });
    expect((await readLaunchState(storage)).onboardingCompleted).toBe(true);
    expect(values.get(onboardingProgressKeys.choiceEvent)).toBe('onb_skip');
  });

  test('rejects skip outside screen 10', async () => {
    const { storage } = createMemoryStorage();

    await expect(performManifestoAction(storage, 9, 'skip')).rejects.toThrow(
      'Skip is only available on manifesto screen 10',
    );
  });
});
