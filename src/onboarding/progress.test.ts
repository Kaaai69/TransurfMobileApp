import { readLaunchState, type KeyValueStorage } from '../launch/state';
import {
  onboardingProgressKeys,
  prepareQuestionnaireEntry,
  readQuestionnaireProgress,
  saveOnboardingStep,
  saveQuestionnaireProgress,
} from './progress';

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

  test('persists questionnaire answers and cursor as one recoverable record', async () => {
    const storage = createMemoryStorage();
    const draft = {
      bedtimeMinutes: 23 * 60,
      caffeineServings: 'none',
      lastCaffeineMinutes: null,
    } as const;
    const progress = { draft, destination: { id: 5, screen: 12 } as const };

    await saveQuestionnaireProgress(storage, progress);

    expect(await readQuestionnaireProgress(storage)).toEqual(progress);
  });

  test('recovers legacy answer-only drafts without losing answers', async () => {
    const storage = createMemoryStorage();
    await storage.setItem(
      onboardingProgressKeys.questionnaireDraft,
      JSON.stringify({ bedtimeMinutes: 23 * 60 }),
    );

    await expect(readQuestionnaireProgress(storage)).resolves.toEqual({
      draft: { bedtimeMinutes: 23 * 60 },
      destination: undefined,
    });
  });

  test('recovers with empty progress when stored questionnaire data is malformed', async () => {
    const storage = createMemoryStorage();
    await storage.setItem(onboardingProgressKeys.questionnaireDraft, '{not-json');

    await expect(readQuestionnaireProgress(storage)).resolves.toEqual({
      draft: {},
      destination: undefined,
    });
  });

  test('drops invalid stored answers while preserving valid questionnaire data', async () => {
    const storage = createMemoryStorage();
    await storage.setItem(
      onboardingProgressKeys.questionnaireDraft,
      JSON.stringify({
        draft: {
          bedtimeMinutes: 'late',
          caffeineServings: 'none',
          energyPeak: 'dawn',
          lastCaffeineMinutes: 15 * 60,
          sleepHours: 7,
        },
        destination: { id: 6, screen: 12 },
      }),
    );

    await expect(readQuestionnaireProgress(storage)).resolves.toEqual({
      draft: {
        caffeineServings: 'none',
        lastCaffeineMinutes: null,
        sleepHours: 7,
      },
      destination: { id: 6, screen: 12 },
    });
  });

  test('resets the before-questionnaire boundary before entering from screen 10', async () => {
    const storage = createMemoryStorage();
    await saveQuestionnaireProgress(storage, {
      draft: { bedtimeMinutes: 23 * 60 },
      destination: 'before-questionnaire',
    });

    await expect(prepareQuestionnaireEntry(storage)).resolves.toEqual({
      draft: { bedtimeMinutes: 23 * 60 },
      destination: { id: 2, screen: 11 },
    });
    await expect(readQuestionnaireProgress(storage)).resolves.toEqual({
      draft: { bedtimeMinutes: 23 * 60 },
      destination: { id: 2, screen: 11 },
    });
  });
});
