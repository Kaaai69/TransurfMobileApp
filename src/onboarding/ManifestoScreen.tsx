import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';

import { ScreenShell } from '../components';
import { ru, type CopyBlock } from '../i18n/ru';
import { colors, motion, spacing, typography } from '../theme';
import { ManifestoAudio } from './ManifestoAudio';
import { ManifestoVisuals } from './ManifestoVisuals';
import {
  getManifestoAudioPolicy,
  getManifestoLineCues,
  getManifestoScreen,
  getVisibleManifestoLineCount,
  isManifestoActionVisible,
  manifestoActionDelayMs,
  manifestoRevealIntervalMs,
  splitManifestoBody,
  type ManifestoStep,
} from './manifesto';
import { getOnboardingShellLight, onboardingStepNumbers } from './steps';

const lallyDoiUrl = 'https://doi.org/10.1002/ejsp.674';
const titleEntering = FadeInDown.duration(motion.screen.duration)
  .easing(Easing.bezier(...motion.screen.easing))
  .reduceMotion(ReduceMotion.System);

export type ManifestoScreenProps = Readonly<{
  step: ManifestoStep;
  busy?: boolean;
  onBack: (() => void) | null;
  onPrimary: () => void;
  onSkip: () => void;
}>;

export function ManifestoScreen({
  step,
  busy = false,
  onBack,
  onPrimary,
  onSkip,
}: ManifestoScreenProps) {
  const reducedMotion = useReducedMotion() === true;
  const [elapsedMs, setElapsedMs] = useState(0);
  const copy: CopyBlock = ru.onboarding.screens[step];
  const config = getManifestoScreen(step);
  const light = getOnboardingShellLight(step);
  const bodyLines = useMemo(() => splitManifestoBody(copy.body), [copy.body]);
  const lineCuesMs = useMemo(
    () => getManifestoLineCues(step, bodyLines.length),
    [bodyLines.length, step],
  );
  const revealDuration = Math.max(
    manifestoActionDelayMs,
    (lineCuesMs.at(-1) ?? 0) + manifestoRevealIntervalMs,
  );

  useEffect(() => {
    if (reducedMotion) {
      setElapsedMs(revealDuration);
      return;
    }

    const startedAt = Date.now();
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      const nextElapsed = Math.min(Date.now() - startedAt, revealDuration);
      setElapsedMs(nextElapsed);

      if (nextElapsed >= revealDuration && timer !== undefined) {
        clearInterval(timer);
      }
    };

    setElapsedMs(0);
    update();
    timer = setInterval(update, 100);

    return () => {
      if (timer !== undefined) {
        clearInterval(timer);
      }
    };
  }, [reducedMotion, revealDuration, step]);

  const visibleLineCount = getVisibleManifestoLineCount({
    elapsedMs,
    lineCount: bodyLines.length,
    lineCuesMs,
    reducedMotion,
  });
  const actionVisible = isManifestoActionVisible(elapsedMs, reducedMotion);
  const audioPolicy = getManifestoAudioPolicy(step);

  return (
    <ScreenShell
      glowTemperature={light.temperature}
      level={light.level}
      footer={
        <View style={styles.footer}>
          <Text style={styles.progress}>
            {ru.onboarding.stepProgress(step, onboardingStepNumbers.length)}
          </Text>
          <View style={styles.actions}>
            {onBack === null ? null : (
              <Pressable
                accessibilityLabel={ru.common.back}
                accessibilityRole="button"
                disabled={busy}
                onPress={onBack}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed ? styles.secondaryButtonPressed : null,
                  busy ? styles.disabled : null,
                ]}
              >
                <Ionicons color={colors.textPrimary} name="arrow-back" size={22} />
              </Pressable>
            )}
            {actionVisible ? (
              <Animated.View entering={titleEntering} style={styles.primarySlot}>
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={onPrimary}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed ? styles.primaryButtonPressed : null,
                    busy ? styles.disabled : null,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>{copy.primaryAction}</Text>
                </Pressable>
              </Animated.View>
            ) : (
              <View style={styles.primarySlot} />
            )}
          </View>
          {step === 10 && actionVisible ? (
            <Animated.View entering={titleEntering}>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={onSkip}
                style={({ pressed }) => [
                  styles.skipButton,
                  pressed ? styles.skipButtonPressed : null,
                  busy ? styles.disabled : null,
                ]}
              >
                <Text style={styles.skipButtonText}>{copy.secondaryAction}</Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      }
    >
      <View key={step} style={styles.content}>
        {audioPolicy === null || elapsedMs < audioPolicy.controlVisibleAtMs ? null : (
          <ManifestoAudio policy={audioPolicy} />
        )}
        {copy.title === undefined ? null : (
          <Animated.Text entering={titleEntering} style={styles.title}>
            {copy.title}
          </Animated.Text>
        )}
        <ManifestoVisuals
          onSourcePress={() => {
            void WebBrowser.openBrowserAsync(lallyDoiUrl).catch(() => {});
          }}
          presentation={config.presentation}
          visibleLines={bodyLines.slice(0, visibleLineCount)}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.cardGap,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderRadius: spacing.radii.button,
    borderWidth: spacing.hairline,
    height: spacing.heights.button,
    justifyContent: 'center',
    width: spacing.heights.button,
  },
  content: {
    gap: spacing.sectionGap,
    minHeight: 360,
  },
  disabled: {
    opacity: 0.5,
  },
  footer: {
    gap: spacing.cardGap,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: spacing.radii.button,
    height: spacing.heights.button,
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
  },
  primaryButtonPressed: {
    backgroundColor: colors.accentDeep,
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.onAccent,
  },
  primarySlot: {
    flex: 1,
    height: spacing.heights.button,
  },
  progress: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: colors.surface3,
  },
  skipButton: {
    alignItems: 'center',
    minHeight: spacing.heights.minTouch,
    justifyContent: 'center',
  },
  skipButtonPressed: {
    opacity: 0.7,
  },
  skipButtonText: {
    ...typography.caption,
    color: colors.accentBright,
    textAlign: 'center',
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
});
