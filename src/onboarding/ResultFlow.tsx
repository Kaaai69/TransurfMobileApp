import AsyncStorage from 'expo-sqlite/kv-store';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { databaseReady, sqlite } from '../db/client';
import { ensureCoreUserTask, saveUserProfile } from '../db/repo';
import { today } from '../domain/dates';
import type { OnboardingAnswers } from '../domain/scoring';
import { ru } from '../i18n/ru';
import { CalculationScreen } from './CalculationScreen';
import { FirstTaskScreen } from './FirstTaskScreen';
import { OnboardingFooter } from './OnboardingFooter';
import { getFirstUnansweredQuestion, type QuestionnaireDraft } from './questionnaire';
import { markOnboardingComplete, readQuestionnaireProgress } from './progress';
import {
  readOnboardingResult,
  runCalculation,
  saveOnboardingResult,
  type OnboardingResult,
} from './result';
import { ProfileResultScreen } from './ProfileResultScreen';
import { SourcesScreen } from './SourcesScreen';
import { WeakestLinkScreen } from './WeakestLinkScreen';

export type ResultStep = 18 | 19 | 20 | 21 | 22;

export type ResultFlowProps = Readonly<{
  step: ResultStep;
}>;

const resultSteps = new Set<ResultStep>([18, 19, 20, 21, 22]);

export function ResultFlow({ step }: ResultFlowProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<QuestionnaireDraft | null>(null);
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Error | null>(null);
  const calculatedAnswersRef = useRef<OnboardingAnswers | null>(null);

  useEffect(() => {
    let active = true;

    void Promise.all([readQuestionnaireProgress(AsyncStorage), readOnboardingResult(AsyncStorage)])
      .then(async ([progress, storedResult]) => {
        if (!active) return;

        const answers = progress.draft;

        setDraft(answers);

        let effectiveResult = storedResult;

        if (effectiveResult === null && getFirstUnansweredQuestion(answers) === null) {
          // Возобновление после убийства процесса между экранами:
          // досчитываем по сохранённым ответам без показа экрана расчёта.
          effectiveResult = await runCalculation(answers as OnboardingAnswers);
          await saveOnboardingResult(AsyncStorage, effectiveResult);
          await persistProfile(effectiveResult, answers as OnboardingAnswers);
        }

        if (!active) return;

        setResult(effectiveResult);
        setLoaded(true);
      })
      .catch((error: unknown) => {
        if (active) setFailure(asError(error));
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCalculated = useCallback(
    async (calculated: OnboardingResult) => {
      await saveOnboardingResult(AsyncStorage, calculated);
      await persistProfile(calculated, calculatedAnswersRef.current);
      setResult(calculated);
      router.replace('/onboarding/19');
    },
    [router],
  );

  if (failure !== null) throw failure;

  if (!resultSteps.has(step)) return null;
  if (!loaded || draft === null) return null;

  if (getFirstUnansweredQuestion(draft) !== null) {
    return <Redirect href="/onboarding/10" />;
  }

  const answers = draft as OnboardingAnswers;

  if (step === 18) {
    if (result !== null) return <Redirect href="/onboarding/19" />;

    return (
      <CalculationScreen
        answers={answers}
        onCalculated={(calculated) => {
          calculatedAnswersRef.current = answers;

          return handleCalculated(calculated);
        }}
      />
    );
  }

  if (result === null) return <Redirect href="/onboarding/18" />;

  if (step === 19) {
    return (
      <ProfileResultScreen
        footer={
          <OnboardingFooter
            onBack={null}
            onPrimary={() => router.replace('/onboarding/20')}
            primaryLabel={ru.common.continue}
          />
        }
        result={result}
      />
    );
  }

  if (step === 20) {
    return (
      <WeakestLinkScreen
        footer={
          <OnboardingFooter
            onBack={null}
            onPrimary={() => router.replace('/onboarding/21')}
            primaryLabel={ru.onboarding.screens[20].primaryAction ?? ''}
          />
        }
        result={result}
      />
    );
  }

  if (step === 21) {
    return (
      <FirstTaskScreen
        busy={busy}
        result={result}
        onAccept={() => {
          if (busy) return;

          setBusy(true);

          void databaseReady
            .then(() => ensureCoreUserTask(sqlite, result.firstTaskTemplateId, today()))
            .then(() => {
              setBusy(false);
              router.replace('/onboarding/22');
            })
            .catch((error: unknown) => {
              setBusy(false);
              setFailure(asError(error));
            });
        }}
      />
    );
  }

  return (
    <SourcesScreen
      footer={
        <OnboardingFooter
          busy={busy}
          onBack={null}
          onPrimary={() => {
            if (busy) return;

            setBusy(true);

            void markOnboardingComplete(AsyncStorage)
              .then(() => {
                router.replace('/(tabs)');
              })
              .catch((error: unknown) => {
                setBusy(false);
                setFailure(asError(error));
              });
          }}
          primaryLabel={ru.onboarding.screens[22].primaryAction ?? ''}
        />
      }
      result={result}
    />
  );
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

async function persistProfile(result: OnboardingResult, answers: OnboardingAnswers | null) {
  if (answers === null) return;

  await databaseReady;
  await saveUserProfile(sqlite, {
    baseline: result.baseline,
    scores: result.scores,
    budgetMinutes: answers.budgetMinutes,
    today: today(),
  });
}
