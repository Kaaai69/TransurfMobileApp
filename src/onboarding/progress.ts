import { launchStateKeys, type KeyValueStorage } from '../launch/state';
import {
  getQuestionDefinition,
  getQuestionnaireResumeDestination,
  isQuestionnaireScreen,
  parseQuestionnaireQuestionId,
  sanitizeQuestionnaireDraft,
  type QuestionnaireDestination,
  type QuestionnaireDraft,
} from './questionnaire';
import type { OnboardingStep } from './steps';

export type OnboardingChoiceEvent = 'onb_commit' | 'onb_skip';

export const onboardingProgressKeys = {
  choiceEvent: 'onboarding.choiceEvent',
  questionnaireDraft: 'onboarding.questionnaireDraft',
} as const;

export type QuestionnaireProgress = Readonly<{
  draft: QuestionnaireDraft;
  destination: QuestionnaireDestination | undefined;
}>;

export type QuestionnaireEntryProgress = Readonly<{
  draft: QuestionnaireDraft;
  destination: QuestionnaireDestination;
}>;

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

export function saveQuestionnaireProgress(
  storage: KeyValueStorage,
  progress: QuestionnaireProgress,
): Promise<void> {
  return storage.setItem(onboardingProgressKeys.questionnaireDraft, JSON.stringify(progress));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseQuestionnaireDestination(value: unknown): QuestionnaireDestination | undefined {
  if (value === 'before-questionnaire' || value === 'complete') return value;
  if (!isRecord(value) || !isQuestionnaireScreen(Number(value.screen))) return undefined;

  const id = parseQuestionnaireQuestionId(String(value.id));
  const screen = Number(value.screen);

  if (id === null || getQuestionDefinition(id).screen !== screen) return undefined;

  return { id, screen: screen as ReturnType<typeof getQuestionDefinition>['screen'] };
}

export async function readQuestionnaireProgress(
  storage: KeyValueStorage,
): Promise<QuestionnaireProgress> {
  const stored = await storage.getItem(onboardingProgressKeys.questionnaireDraft);

  if (stored === null) return { draft: {}, destination: undefined };

  try {
    const parsed: unknown = JSON.parse(stored);

    if (!isRecord(parsed)) return { draft: {}, destination: undefined };

    if ('draft' in parsed) {
      return {
        draft: sanitizeQuestionnaireDraft(parsed.draft),
        destination: parseQuestionnaireDestination(parsed.destination),
      };
    }

    return { draft: sanitizeQuestionnaireDraft(parsed), destination: undefined };
  } catch {
    return { draft: {}, destination: undefined };
  }
}

export async function prepareQuestionnaireEntry(
  storage: KeyValueStorage,
): Promise<QuestionnaireEntryProgress> {
  const storedProgress = await readQuestionnaireProgress(storage);
  const progress: QuestionnaireEntryProgress = {
    draft: storedProgress.draft,
    destination: getQuestionnaireResumeDestination(undefined, storedProgress.draft),
  };

  await saveQuestionnaireProgress(storage, progress);
  return progress;
}
