import type { Category } from '../db/schema';
import { selectFirstTaskTemplateId } from '../domain/firstTask';
import {
  calculateScores,
  findWeakestLink,
  type CategoryScores,
  type OnboardingAnswers,
} from '../domain/scoring';
import type { CoreTaskCopyKey } from '../i18n/ru';
import type { KeyValueStorage } from '../launch/state';

export type CalculationStageId = 'scores' | 'weakest' | 'task';

export const calculationStageIds: readonly CalculationStageId[] = ['scores', 'weakest', 'task'];

export type OnboardingResult = Readonly<{
  baseline: CategoryScores;
  scores: CategoryScores;
  weakestLink: Category;
  firstTaskTemplateId: CoreTaskCopyKey;
  calcMs: number;
  calculatedAt: string;
}>;

const resultStorageKey = 'onboarding.result';

const scoreKeys = ['sleep', 'energy', 'movement', 'food', 'water', 'mind'] as const;

function isScores(value: unknown): value is CategoryScores {
  if (typeof value !== 'object' || value === null) return false;

  return scoreKeys.every((key) => {
    const entry = (value as Record<string, unknown>)[key];

    return typeof entry === 'number' && Number.isFinite(entry);
  });
}

function isCategory(value: unknown): value is Category {
  return (
    value === 'sleep' ||
    value === 'energy' ||
    value === 'movement' ||
    value === 'food' ||
    value === 'water' ||
    value === 'mind'
  );
}

export function sanitizeOnboardingResult(value: unknown): OnboardingResult | null {
  if (typeof value !== 'object' || value === null) return null;

  const candidate = value as Record<string, unknown>;

  if (!isScores(candidate.baseline) || !isScores(candidate.scores)) return null;
  if (!isCategory(candidate.weakestLink)) return null;
  if (typeof candidate.firstTaskTemplateId !== 'string') return null;
  if (typeof candidate.calcMs !== 'number' || !Number.isFinite(candidate.calcMs)) return null;
  if (typeof candidate.calculatedAt !== 'string') return null;

  const templateId = candidate.firstTaskTemplateId;
  const [templateCategory, templateTier] = templateId.split('-');
  const isKnownTemplate =
    (isCategory(templateCategory) &&
      templateCategory === candidate.weakestLink &&
      templateTier === '1') ||
    templateId === 'mind-1';

  if (!isKnownTemplate) return null;

  return {
    baseline: candidate.baseline,
    scores: candidate.scores,
    weakestLink: candidate.weakestLink,
    firstTaskTemplateId: templateId as CoreTaskCopyKey,
    calcMs: Math.max(0, Math.round(candidate.calcMs)),
    calculatedAt: candidate.calculatedAt,
  };
}

export function saveOnboardingResult(
  storage: KeyValueStorage,
  result: OnboardingResult,
): Promise<void> {
  return storage.setItem(resultStorageKey, JSON.stringify(result));
}

export async function readOnboardingResult(
  storage: KeyValueStorage,
): Promise<OnboardingResult | null> {
  const stored = await storage.getItem(resultStorageKey);

  if (stored === null) return null;

  try {
    return sanitizeOnboardingResult(JSON.parse(stored));
  } catch {
    return null;
  }
}

export type CalculationOptions = Readonly<{
  tick?: () => Promise<void>;
  now?: () => number;
  onStageComplete?: (stage: CalculationStageId) => void;
}>;

/**
 * Реальный расчёт по этапам. Галочка этапа появляется только после того,
 * как этап действительно выполнен — никаких таймеров.
 */
export async function runCalculation(
  answers: OnboardingAnswers,
  options: CalculationOptions = {},
): Promise<OnboardingResult> {
  const tick = options.tick ?? (() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
  const now = options.now ?? Date.now;
  const startedAt = now();

  const { scores } = calculateScores(answers);
  await tick();
  options.onStageComplete?.('scores');

  const weakestLink = findWeakestLink(scores);
  await tick();
  options.onStageComplete?.('weakest');

  const firstTaskTemplateId = selectFirstTaskTemplateId(weakestLink, answers);
  await tick();
  options.onStageComplete?.('task');

  return {
    baseline: scores,
    scores,
    weakestLink,
    firstTaskTemplateId,
    calcMs: Math.max(0, Math.round(now() - startedAt)),
    calculatedAt: new Date(now()).toISOString(),
  };
}
