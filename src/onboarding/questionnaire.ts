import type { OnboardingAnswers } from '../domain/scoring';
import { ru, type OnboardingQuestionId } from '../i18n/ru';

export type QuestionnaireScreen = 11 | 12 | 13 | 14 | 15 | 16 | 17;
export type QuestionnaireDraft = Partial<OnboardingAnswers>;
export type QuestionCursor = Readonly<{
  id: OnboardingQuestionId;
  screen: QuestionnaireScreen;
}>;

type SliderQuestionDefinition = QuestionCursor &
  Readonly<{
    control: 'number' | 'time';
    defaultValue: number;
    minimumValue: number;
    maximumValue: number;
    step: number;
  }>;

type SingleQuestionDefinition = QuestionCursor &
  Readonly<{
    control: 'single';
    values: readonly unknown[];
  }>;

export type QuestionDefinition = SliderQuestionDefinition | SingleQuestionDefinition;

export type QuestionOption = Readonly<{
  label: string;
  value: unknown;
}>;

export type QuestionnaireDestination = QuestionCursor | 'before-questionnaire' | 'complete';

export type QuestionnaireHref = Readonly<{
  pathname: '/onboarding/[step]';
  params: Readonly<{ step: string; question?: string }>;
}>;

export function isQuestionnaireScreen(step: number): step is QuestionnaireScreen {
  return step >= 11 && step <= 17;
}

export function parseQuestionnaireQuestionId(
  value: string | string[] | undefined,
): OnboardingQuestionId | null {
  if (typeof value !== 'string' || !/^(?:[1-9]|1[0-6])$/.test(value)) return null;

  return Number(value) as OnboardingQuestionId;
}

export function getQuestionnaireDestinationHref(
  destination: QuestionnaireDestination,
): QuestionnaireHref {
  if (destination === 'before-questionnaire') {
    return { pathname: '/onboarding/[step]', params: { step: '10' } };
  }

  if (destination === 'complete') {
    return { pathname: '/onboarding/[step]', params: { step: '18' } };
  }

  return {
    pathname: '/onboarding/[step]',
    params: { question: String(destination.id), step: String(destination.screen) },
  };
}

const questionSequence: readonly QuestionCursor[] = [
  { id: 1, screen: 11 },
  { id: 2, screen: 11 },
  { id: 3, screen: 11 },
  { id: 4, screen: 12 },
  { id: 5, screen: 12 },
  { id: 6, screen: 12 },
  { id: 7, screen: 13 },
  { id: 8, screen: 13 },
  { id: 9, screen: 14 },
  { id: 10, screen: 14 },
  { id: 11, screen: 14 },
  { id: 12, screen: 15 },
  { id: 13, screen: 15 },
  { id: 14, screen: 15 },
  { id: 15, screen: 16 },
  { id: 16, screen: 17 },
];

const questionFields: Record<OnboardingQuestionId, keyof OnboardingAnswers> = {
  1: 'bedtimeMinutes',
  2: 'sleepHours',
  3: 'unrestedFrequency',
  4: 'energyPeak',
  5: 'caffeineServings',
  6: 'lastCaffeineMinutes',
  7: 'movementFrequency',
  8: 'sittingHours',
  9: 'rushedMealFrequency',
  10: 'firstMealMinutes',
  11: 'waterGlasses',
  12: 'focusBlocker',
  13: 'bedtimeThoughtFrequency',
  14: 'morningAction',
  15: 'priority',
  16: 'budgetMinutes',
};

const questionDefinitions: Record<OnboardingQuestionId, QuestionDefinition> = {
  1: {
    id: 1,
    screen: 11,
    control: 'time',
    defaultValue: 23 * 60,
    minimumValue: 21 * 60,
    maximumValue: 27 * 60,
    step: 15,
  },
  2: {
    id: 2,
    screen: 11,
    control: 'number',
    defaultValue: 7,
    minimumValue: 4,
    maximumValue: 10,
    step: 0.5,
  },
  3: {
    id: 3,
    screen: 11,
    control: 'single',
    values: ['daily', 'weekly', 'rarely', 'almost_never'],
  },
  4: {
    id: 4,
    screen: 12,
    control: 'single',
    values: ['morning', 'day', 'evening', 'night', 'none'],
  },
  5: {
    id: 5,
    screen: 12,
    control: 'single',
    values: ['none', 'one_two', 'three_four', 'five_plus'],
  },
  6: {
    id: 6,
    screen: 12,
    control: 'time',
    defaultValue: 15 * 60,
    minimumValue: 8 * 60,
    maximumValue: 24 * 60,
    step: 15,
  },
  7: {
    id: 7,
    screen: 13,
    control: 'single',
    values: ['zero', 'one_two', 'three_four', 'five_plus'],
  },
  8: {
    id: 8,
    screen: 13,
    control: 'single',
    values: ['under_four', 'four_seven', 'eight_eleven', 'over_eleven'],
  },
  9: {
    id: 9,
    screen: 14,
    control: 'single',
    values: ['almost_always', 'often', 'sometimes', 'rarely'],
  },
  10: {
    id: 10,
    screen: 14,
    control: 'time',
    defaultValue: 9 * 60,
    minimumValue: 6 * 60,
    maximumValue: 16 * 60,
    step: 15,
  },
  11: {
    id: 11,
    screen: 14,
    control: 'single',
    values: ['under_one', 'two_three', 'four_six', 'over_six'],
  },
  12: {
    id: 12,
    screen: 15,
    control: 'single',
    values: ['racing_thoughts', 'phone', 'fatigue', 'others', 'none'],
  },
  13: {
    id: 13,
    screen: 15,
    control: 'single',
    values: ['daily', 'weekly', 'rarely', 'almost_never'],
  },
  14: {
    id: 14,
    screen: 15,
    control: 'single',
    values: ['phone', 'shower', 'food', 'light', 'other'],
  },
  15: {
    id: 15,
    screen: 16,
    control: 'single',
    values: ['sleep', 'focus', 'energy', 'anxiety', 'fitness', 'procrastination'],
  },
  16: { id: 16, screen: 17, control: 'single', values: [5, 15, 30, 'more'] },
};

function getVisibleQuestions(answers: QuestionnaireDraft): readonly QuestionCursor[] {
  return answers.caffeineServings === 'none'
    ? questionSequence.filter(({ id }) => id !== 6)
    : questionSequence;
}

export function getFirstUnansweredQuestion(answers: QuestionnaireDraft): QuestionCursor | null {
  return (
    getVisibleQuestions(answers).find((question) => {
      const answer = getQuestionAnswer(answers, question.id);
      return answer === undefined || answer === null;
    }) ?? null
  );
}

export function getQuestionnaireResumeDestination(
  persistedDestination: QuestionnaireDestination | undefined,
  answers: QuestionnaireDraft,
): QuestionnaireDestination {
  if (persistedDestination === 'before-questionnaire') return persistedDestination;

  if (typeof persistedDestination === 'object') {
    const persistedQuestion = getVisibleQuestions(answers).find(
      ({ id, screen }) => id === persistedDestination.id && screen === persistedDestination.screen,
    );

    if (persistedQuestion !== undefined) return persistedQuestion;
  }

  return getFirstUnansweredQuestion(answers) ?? 'complete';
}

export function getQuestionDefinition(questionId: OnboardingQuestionId): QuestionDefinition {
  return questionDefinitions[questionId];
}

export function sanitizeQuestionnaireDraft(value: unknown): QuestionnaireDraft {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};

  const stored = value as Record<string, unknown>;
  let sanitized: QuestionnaireDraft = {};

  for (const { id } of questionSequence) {
    if (id === 6 && sanitized.caffeineServings === 'none') continue;

    const definition = getQuestionDefinition(id);
    const answer = stored[questionFields[id]];
    const validAnswer =
      definition.control === 'single'
        ? definition.values.some((allowedValue) => Object.is(answer, allowedValue))
        : typeof answer === 'number' &&
          Number.isFinite(answer) &&
          answer >= definition.minimumValue &&
          answer <= definition.maximumValue &&
          Math.abs(
            (answer - definition.minimumValue) / definition.step -
              Math.round((answer - definition.minimumValue) / definition.step),
          ) < 1e-9;

    if (validAnswer) sanitized = applyQuestionAnswer(sanitized, id, answer);
  }

  return sanitized;
}

export function getQuestionOptions(questionId: OnboardingQuestionId): readonly QuestionOption[] {
  const definition = getQuestionDefinition(questionId);

  if (definition.control !== 'single') return [];

  const copy = ru.onboarding.questions.find(({ id }) => id === questionId);
  const labels = copy !== undefined && 'options' in copy ? copy.options : [];
  return labels.map((label, index) => ({ label, value: definition.values[index] }));
}

export function formatQuestionValue(questionId: OnboardingQuestionId, value: number): string {
  if (getQuestionDefinition(questionId).control === 'number') {
    return `${String(value).replace('.', ',')} ч`;
  }

  const normalizedMinutes = ((value % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function applyQuestionAnswer(
  answers: QuestionnaireDraft,
  questionId: OnboardingQuestionId,
  value: unknown,
): QuestionnaireDraft {
  if (questionId === 5) {
    const caffeineServings = value as OnboardingAnswers['caffeineServings'];

    return {
      ...answers,
      caffeineServings,
      ...(caffeineServings === 'none' ? { lastCaffeineMinutes: null } : {}),
    };
  }

  return { ...answers, [questionFields[questionId]]: value } as QuestionnaireDraft;
}

export function getQuestionAnswer(
  answers: QuestionnaireDraft,
  questionId: OnboardingQuestionId,
): unknown {
  return answers[questionFields[questionId]];
}

export function getQuestionsForScreen(
  screen: QuestionnaireScreen,
  answers: QuestionnaireDraft,
): readonly QuestionCursor[] {
  return getVisibleQuestions(answers).filter((question) => question.screen === screen);
}

export function getNextQuestion(
  questionId: OnboardingQuestionId,
  answers: QuestionnaireDraft,
): QuestionCursor | null {
  const questions = getVisibleQuestions(answers);
  const index = questions.findIndex(({ id }) => id === questionId);

  return questions[index + 1] ?? null;
}

export function getPreviousQuestion(
  questionId: OnboardingQuestionId,
  answers: QuestionnaireDraft,
): QuestionCursor | null {
  const questions = getVisibleQuestions(answers);
  const index = questions.findIndex(({ id }) => id === questionId);

  return questions[index - 1] ?? null;
}

export function getInitialQuestion(
  screen: QuestionnaireScreen,
  requestedQuestionId: OnboardingQuestionId | undefined,
  answers: QuestionnaireDraft,
): QuestionCursor {
  const questions = getQuestionsForScreen(screen, answers);
  const requestedQuestion = questions.find(({ id }) => id === requestedQuestionId);

  if (requestedQuestion !== undefined) return requestedQuestion;

  return (
    questions.find(({ id }) => getQuestionAnswer(answers, id) === undefined) ??
    questions[questions.length - 1]
  );
}
