import AsyncStorage from 'expo-sqlite/kv-store';
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../../src/components';
import { ru } from '../../src/i18n/ru';
import { ManifestoScreen } from '../../src/onboarding/ManifestoScreen';
import { QuestionnaireScreen } from '../../src/onboarding/QuestionnaireScreen';
import { getManifestoScreen } from '../../src/onboarding/manifesto';
import {
  performManifestoAction,
  type ManifestoActionKind,
} from '../../src/onboarding/manifestoActions';
import {
  prepareQuestionnaireEntry,
  readQuestionnaireProgress,
  saveOnboardingStep,
  saveQuestionnaireProgress,
  type QuestionnaireProgress,
} from '../../src/onboarding/progress';
import {
  getInitialQuestion,
  getPreviousQuestion,
  getQuestionnaireDestinationHref,
  getQuestionnaireResumeDestination,
  isQuestionnaireScreen,
  parseQuestionnaireQuestionId,
  type QuestionnaireDestination,
  type QuestionnaireDraft,
} from '../../src/onboarding/questionnaire';
import {
  getNextOnboardingRoute,
  getPreviousOnboardingRoute,
  parseOnboardingStep,
} from '../../src/onboarding/routing';
import { getOnboardingShellLight, onboardingStepNumbers } from '../../src/onboarding/steps';
import { colors, spacing, typography } from '../../src/theme';

export default function OnboardingStepScreen() {
  const { question: routeQuestion, step: routeStep } = useLocalSearchParams<{
    question?: string | string[];
    step?: string | string[];
  }>();
  const router = useRouter();
  const step = parseOnboardingStep(routeStep);
  const requestedQuestionId = parseQuestionnaireQuestionId(routeQuestion) ?? undefined;
  const [failure, setFailure] = useState<Error | null>(null);
  const [navigationPending, setNavigationPending] = useState(false);
  const [questionnaireProgress, setQuestionnaireProgress] = useState<QuestionnaireProgress | null>(
    null,
  );
  const [questionnaireNavigationPending, setQuestionnaireNavigationPendingState] = useState(false);
  const questionnairePendingRef = useRef(false);
  const setQuestionnaireNavigationPending = useCallback((pending: boolean) => {
    questionnairePendingRef.current = pending;
    setQuestionnaireNavigationPendingState(pending);
  }, []);
  const isQuestionnaireNavigationPending = useCallback(() => questionnairePendingRef.current, []);
  const resumeDestination =
    questionnaireProgress === null
      ? undefined
      : getQuestionnaireResumeDestination(
          questionnaireProgress.destination,
          questionnaireProgress.draft,
        );
  const persistedQuestionId =
    typeof resumeDestination === 'object' && resumeDestination.screen === step
      ? resumeDestination.id
      : undefined;
  const activeQuestionId = requestedQuestionId ?? persistedQuestionId;

  useEffect(() => {
    if (step === null) return;

    let active = true;

    void saveOnboardingStep(AsyncStorage, step).catch((error: unknown) => {
      if (active) {
        setFailure(error instanceof Error ? error : new Error(String(error)));
      }
    });

    return () => {
      active = false;
    };
  }, [step]);

  useEffect(() => {
    if (step === null || !isQuestionnaireScreen(step)) return;

    let active = true;

    void readQuestionnaireProgress(AsyncStorage)
      .then((progress) => {
        if (active) setQuestionnaireProgress(progress);
      })
      .catch((error: unknown) => {
        if (active) setFailure(error instanceof Error ? error : new Error(String(error)));
      });

    return () => {
      active = false;
    };
  }, [step]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (questionnairePendingRef.current) return true;

        if (step !== null) {
          if (isQuestionnaireScreen(step) && questionnaireProgress !== null) {
            const currentQuestion = getInitialQuestion(
              step,
              activeQuestionId,
              questionnaireProgress.draft,
            );
            const previousQuestion = getPreviousQuestion(
              currentQuestion.id,
              questionnaireProgress.draft,
            );
            const destination = previousQuestion ?? 'before-questionnaire';
            const progress: QuestionnaireProgress = {
              draft: questionnaireProgress.draft,
              destination,
            };

            setQuestionnaireNavigationPending(true);
            void saveQuestionnaireProgress(AsyncStorage, progress)
              .then(() => {
                setQuestionnaireProgress(progress);
                router.replace(getQuestionnaireDestinationHref(destination));
              })
              .catch((error: unknown) => {
                setFailure(error instanceof Error ? error : new Error(String(error)));
              })
              .finally(() => {
                setQuestionnaireNavigationPending(false);
              });
            return true;
          }

          const previousRoute = getPreviousOnboardingRoute(step);

          if (previousRoute !== null) {
            router.replace(previousRoute);
          }
        }

        return true;
      });

      return () => subscription.remove();
    }, [activeQuestionId, questionnaireProgress, router, setQuestionnaireNavigationPending, step]),
  );

  if (failure !== null) throw failure;
  if (step === null) return <Redirect href="/onboarding/1" />;

  const light = getOnboardingShellLight(step);
  const previousRoute = getPreviousOnboardingRoute(step);
  const nextRoute = getNextOnboardingRoute(step);
  const manifestoConfig = getManifestoScreen(step);

  async function handleManifestoAction(action: ManifestoActionKind) {
    const entersQuestionnaire = manifestoConfig?.step === 10 && action === 'primary';

    if (
      manifestoConfig === null ||
      navigationPending ||
      (entersQuestionnaire && questionnairePendingRef.current)
    )
      return;

    setNavigationPending(true);
    if (entersQuestionnaire) setQuestionnaireNavigationPending(true);

    try {
      const result = await performManifestoAction(AsyncStorage, manifestoConfig.step, action);

      if (entersQuestionnaire) {
        const progress = await prepareQuestionnaireEntry(AsyncStorage);
        setQuestionnaireProgress(progress);
        router.replace(getQuestionnaireDestinationHref(progress.destination));
      } else {
        router.replace(result.destination);
      }
    } catch (error: unknown) {
      setFailure(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setNavigationPending(false);
      if (entersQuestionnaire) setQuestionnaireNavigationPending(false);
    }
  }

  if (manifestoConfig !== null) {
    return (
      <ManifestoScreen
        busy={navigationPending}
        onBack={previousRoute === null ? null : () => router.replace(previousRoute)}
        onPrimary={() => void handleManifestoAction('primary')}
        onSkip={() => void handleManifestoAction('skip')}
        step={manifestoConfig.step}
      />
    );
  }

  async function handleQuestionnaireProgressChange(
    draft: QuestionnaireDraft,
    destination: QuestionnaireDestination,
  ) {
    const progress: QuestionnaireProgress = { draft, destination };
    await saveQuestionnaireProgress(AsyncStorage, progress);
    setQuestionnaireProgress(progress);
  }

  function handleQuestionnaireNavigation(destination: QuestionnaireDestination) {
    router.replace(getQuestionnaireDestinationHref(destination));
  }

  if (isQuestionnaireScreen(step)) {
    if (questionnaireProgress === null) {
      return (
        <ScreenShell level={light.level} glowTemperature={light.temperature}>
          <View />
        </ScreenShell>
      );
    }

    if (
      requestedQuestionId === undefined &&
      resumeDestination !== undefined &&
      (typeof resumeDestination !== 'object' || resumeDestination.screen !== step)
    ) {
      return <Redirect href={getQuestionnaireDestinationHref(resumeDestination)} />;
    }

    return (
      <QuestionnaireScreen
        initialDraft={questionnaireProgress.draft}
        isNavigationPending={isQuestionnaireNavigationPending}
        key={`${step}-${activeQuestionId ?? 'auto'}`}
        navigationPending={questionnaireNavigationPending}
        onNavigate={handleQuestionnaireNavigation}
        onPendingChange={setQuestionnaireNavigationPending}
        onProgressChange={handleQuestionnaireProgressChange}
        requestedQuestionId={activeQuestionId}
        screen={step}
      />
    );
  }

  return (
    <ScreenShell
      level={light.level}
      glowTemperature={light.temperature}
      footer={
        <View style={styles.footer}>
          <Text style={styles.progress}>
            {ru.onboarding.stepProgress(step, onboardingStepNumbers.length)}
          </Text>
          <View style={styles.actions}>
            {previousRoute === null ? null : (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace(previousRoute)}
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  pressed ? styles.secondaryButtonPressed : null,
                ]}
              >
                <Text style={styles.secondaryButtonText}>{ru.common.back}</Text>
              </Pressable>
            )}
            {nextRoute === null ? null : (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace(nextRoute)}
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  pressed ? styles.primaryButtonPressed : null,
                ]}
              >
                <Text style={styles.primaryButtonText}>{ru.common.continue}</Text>
              </Pressable>
            )}
          </View>
        </View>
      }
    >
      <View />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.cardGap,
  },
  progress: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.cardGap,
  },
  button: {
    alignItems: 'center',
    borderRadius: spacing.radii.button,
    flex: 1,
    height: spacing.heights.button,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  primaryButtonPressed: {
    backgroundColor: colors.accentDeep,
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.onAccent,
  },
  secondaryButton: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderWidth: spacing.hairline,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.surface3,
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
