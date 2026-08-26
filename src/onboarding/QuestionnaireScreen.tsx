import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnswerOption, ProgressLine, ScreenShell } from '../components';
import type { OnboardingQuestionId } from '../i18n/ru';
import { ru } from '../i18n/ru';
import { colors, spacing, typography } from '../theme';
import type {
  QuestionCursor,
  QuestionnaireDestination,
  QuestionnaireDraft,
  QuestionnaireScreen as QuestionnaireScreenNumber,
} from './questionnaire';
import {
  applyQuestionAnswer,
  formatQuestionValue,
  getFirstUnansweredQuestion,
  getInitialQuestion,
  getNextQuestion,
  getPreviousQuestion,
  getQuestionAnswer,
  getQuestionDefinition,
  getQuestionOptions,
} from './questionnaire';

export type QuestionnaireScreenProps = Readonly<{
  screen: QuestionnaireScreenNumber;
  requestedQuestionId?: OnboardingQuestionId;
  initialDraft: QuestionnaireDraft;
  isNavigationPending?: () => boolean;
  navigationPending?: boolean;
  onNavigate: (destination: QuestionnaireDestination) => void;
  onPendingChange?: (pending: boolean) => void;
  onProgressChange: (
    draft: QuestionnaireDraft,
    destination: QuestionnaireDestination,
  ) => Promise<void>;
}>;

export function QuestionnaireScreen({
  screen,
  requestedQuestionId,
  initialDraft,
  isNavigationPending,
  navigationPending = false,
  onNavigate,
  onPendingChange,
  onProgressChange,
}: QuestionnaireScreenProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [question, setQuestion] = useState(() =>
    getInitialQuestion(screen, requestedQuestionId, initialDraft),
  );
  const definition = getQuestionDefinition(question.id);
  const copy = ru.onboarding.questions.find(({ id }) => id === question.id);
  const storedValue = getQuestionAnswer(draft, question.id);
  const [sliderValue, setSliderValue] = useState(() =>
    definition.control === 'single' || typeof storedValue !== 'number'
      ? definition.control === 'single'
        ? 0
        : definition.defaultValue
      : storedValue,
  );
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Error | null>(null);
  const controlsDisabled = busy || navigationPending;

  if (failure !== null) throw failure;
  if (copy === undefined) throw new Error(`Missing copy for onboarding question ${question.id}`);

  function showQuestion(destination: QuestionCursor, sourceDraft = draft) {
    const nextDefinition = getQuestionDefinition(destination.id);
    const nextValue = getQuestionAnswer(sourceDraft, destination.id);

    if (nextDefinition.control !== 'single') {
      setSliderValue(typeof nextValue === 'number' ? nextValue : nextDefinition.defaultValue);
    }

    setQuestion(destination);
  }

  async function persistAndNavigate(
    updatedDraft: QuestionnaireDraft,
    destination: QuestionnaireDestination,
  ) {
    setBusy(true);
    onPendingChange?.(true);

    try {
      await onProgressChange(updatedDraft, destination);
      setDraft(updatedDraft);

      if (typeof destination === 'object' && destination.screen === screen) {
        showQuestion(destination, updatedDraft);
      }

      onNavigate(destination);
    } catch (error: unknown) {
      setFailure(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setBusy(false);
      onPendingChange?.(false);
    }
  }

  async function commitAnswer(value: unknown) {
    if (controlsDisabled || isNavigationPending?.()) return;

    const updatedDraft = applyQuestionAnswer(draft, question.id, value);
    const destination =
      getNextQuestion(question.id, updatedDraft) ??
      getFirstUnansweredQuestion(updatedDraft) ??
      'complete';

    await persistAndNavigate(updatedDraft, destination);
  }

  async function goBack() {
    if (controlsDisabled || isNavigationPending?.()) return;

    const destination = getPreviousQuestion(question.id, draft) ?? 'before-questionnaire';
    await persistAndNavigate(draft, destination);
  }

  return (
    <ScreenShell
      level="L1"
      footer={
        <View style={styles.footer}>
          {definition.control === 'single' ? null : (
            <Pressable
              accessibilityRole="button"
              disabled={controlsDisabled}
              onPress={() => void commitAnswer(sliderValue)}
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed ? styles.primaryButtonPressed : null,
                controlsDisabled ? styles.disabled : null,
              ]}
            >
              <Text style={styles.primaryButtonText}>{ru.common.continue}</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={controlsDisabled}
            onPress={() => void goBack()}
            style={({ pressed }) => [
              styles.button,
              styles.backButton,
              pressed ? styles.backButtonPressed : null,
              controlsDisabled ? styles.disabled : null,
            ]}
          >
            <Text style={styles.backButtonText}>{ru.common.back}</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.header}>
        <View style={styles.headerLabels}>
          <Text style={styles.category}>{ru.onboarding.screens[screen].title}</Text>
          <Text style={styles.progressText}>{ru.onboarding.progress(question.id)}</Text>
        </View>
        <ProgressLine
          accessibilityLabel={ru.onboarding.progress(question.id)}
          progress={question.id / ru.onboarding.totalQuestions}
        />
      </View>

      <View style={styles.questionArea}>
        <Text accessibilityRole="header" style={styles.prompt}>
          {copy.prompt}
        </Text>

        {definition.control === 'single' ? (
          <View accessibilityRole="radiogroup" style={styles.options}>
            {getQuestionOptions(question.id).map((option) => (
              <AnswerOption
                disabled={controlsDisabled}
                key={`${question.id}-${String(option.value)}`}
                label={option.label}
                onPress={() => void commitAnswer(option.value)}
                selected={Object.is(storedValue, option.value)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.sliderCard}>
            <Text style={styles.sliderValue}>{formatQuestionValue(question.id, sliderValue)}</Text>
            <Slider
              accessible
              accessibilityLabel={copy.prompt}
              accessibilityRole="adjustable"
              accessibilityValue={{
                max: definition.maximumValue,
                min: definition.minimumValue,
                now: sliderValue,
                text: formatQuestionValue(question.id, sliderValue),
              }}
              disabled={controlsDisabled}
              maximumTrackTintColor={colors.border}
              maximumValue={definition.maximumValue}
              minimumTrackTintColor={colors.accent}
              minimumValue={definition.minimumValue}
              onValueChange={setSliderValue}
              step={definition.step}
              style={styles.slider}
              thumbTintColor={colors.accentBright}
              value={sliderValue}
            />
            <View style={styles.sliderLimits}>
              <Text style={styles.sliderLimit}>
                {formatQuestionValue(question.id, definition.minimumValue)}
              </Text>
              <Text style={styles.sliderLimit}>
                {formatQuestionValue(question.id, definition.maximumValue)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.cardGap,
  },
  headerLabels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    ...typography.label,
    color: colors.accentBright,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  questionArea: {
    gap: spacing.sectionGap,
  },
  prompt: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    maxWidth: 520,
  },
  options: {
    gap: spacing.cardGap,
  },
  sliderCard: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderRadius: spacing.radii.card,
    borderWidth: spacing.hairline,
    gap: spacing.rhythm,
    padding: spacing.screen,
  },
  sliderValue: {
    ...typography.metric,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  slider: {
    height: spacing.heights.row,
    width: '100%',
  },
  sliderLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLimit: {
    ...typography.caption,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    gap: spacing.cardGap,
  },
  button: {
    alignItems: 'center',
    borderRadius: spacing.radii.button,
    height: spacing.heights.button,
    justifyContent: 'center',
    width: '100%',
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
  backButton: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderWidth: spacing.hairline,
  },
  backButtonPressed: {
    backgroundColor: colors.surface3,
  },
  backButtonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  disabled: {
    opacity: 0.6,
  },
});
