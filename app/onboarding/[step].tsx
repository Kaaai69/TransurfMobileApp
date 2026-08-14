import AsyncStorage from 'expo-sqlite/kv-store';
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../../src/components';
import { ru } from '../../src/i18n/ru';
import { ManifestoScreen } from '../../src/onboarding/ManifestoScreen';
import { getManifestoScreen } from '../../src/onboarding/manifesto';
import {
  performManifestoAction,
  type ManifestoActionKind,
} from '../../src/onboarding/manifestoActions';
import { saveOnboardingStep } from '../../src/onboarding/progress';
import {
  getNextOnboardingRoute,
  getPreviousOnboardingRoute,
  parseOnboardingStep,
} from '../../src/onboarding/routing';
import { getOnboardingShellLight, onboardingStepNumbers } from '../../src/onboarding/steps';
import { colors, spacing, typography } from '../../src/theme';

export default function OnboardingStepScreen() {
  const { step: routeStep } = useLocalSearchParams<{ step?: string | string[] }>();
  const router = useRouter();
  const step = parseOnboardingStep(routeStep);
  const [failure, setFailure] = useState<Error | null>(null);
  const [navigationPending, setNavigationPending] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (step !== null) {
          const previousRoute = getPreviousOnboardingRoute(step);

          if (previousRoute !== null) {
            router.replace(previousRoute);
          }
        }

        return true;
      });

      return () => subscription.remove();
    }, [router, step]),
  );

  if (failure !== null) throw failure;
  if (step === null) return <Redirect href="/onboarding/1" />;

  const light = getOnboardingShellLight(step);
  const previousRoute = getPreviousOnboardingRoute(step);
  const nextRoute = getNextOnboardingRoute(step);
  const manifestoConfig = getManifestoScreen(step);

  async function handleManifestoAction(action: ManifestoActionKind) {
    if (manifestoConfig === null || navigationPending) return;

    setNavigationPending(true);

    try {
      const result = await performManifestoAction(AsyncStorage, manifestoConfig.step, action);
      setNavigationPending(false);
      router.replace(result.destination);
    } catch (error: unknown) {
      setNavigationPending(false);
      setFailure(error instanceof Error ? error : new Error(String(error)));
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
