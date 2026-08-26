import type { Category } from '../db/schema';
import type { CoreTaskCopyKey } from '../i18n/ru';
import type { OnboardingAnswers } from './scoring';

/**
 * Первая задача = пересечение слабого звена, приоритета и бюджета (в.15/в.16).
 * Особое правило из docs/task-library.md §3 (Ум, тир 1): при бюджете 5 минут
 * первой задачей становится дыхание — независимо от слабого звена.
 */
export function selectFirstTaskTemplateId(
  weakestLink: Category,
  answers: Pick<OnboardingAnswers, 'budgetMinutes'>,
): CoreTaskCopyKey {
  if (answers.budgetMinutes === 5) return 'mind-1';

  return `${weakestLink}-1`;
}
