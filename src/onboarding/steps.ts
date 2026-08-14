import type { GlowLevel, GlowTemperature } from '../light';

export const onboardingStepNumbers = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
] as const;

export type OnboardingStep = (typeof onboardingStepNumbers)[number];

type OnboardingLightConfig = Readonly<{
  startLevel: GlowLevel;
  endLevel?: GlowLevel;
  temperature: GlowTemperature;
}>;

type OnboardingStepConfig = Readonly<{
  step: OnboardingStep;
  light: OnboardingLightConfig;
}>;

export const onboardingSteps = [
  { step: 1, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 2, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 3, light: { startLevel: 'L2', temperature: 'cool' } },
  { step: 4, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 5, light: { startLevel: 'L0', temperature: 'cool' } },
  { step: 6, light: { startLevel: 'L2', temperature: 'cool' } },
  { step: 7, light: { startLevel: 'L0', temperature: 'cool' } },
  { step: 8, light: { startLevel: 'L3', temperature: 'warm' } },
  { step: 9, light: { startLevel: 'L2', temperature: 'cool' } },
  { step: 10, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 11, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 12, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 13, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 14, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 15, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 16, light: { startLevel: 'L1', temperature: 'cool' } },
  { step: 17, light: { startLevel: 'L1', temperature: 'cool' } },
  {
    step: 18,
    light: { startLevel: 'L1', endLevel: 'L3', temperature: 'cool' },
  },
  { step: 19, light: { startLevel: 'L4', temperature: 'cool' } },
  { step: 20, light: { startLevel: 'L3', temperature: 'cool' } },
  { step: 21, light: { startLevel: 'L4', temperature: 'cool' } },
  { step: 22, light: { startLevel: 'L1', temperature: 'cool' } },
] as const satisfies readonly OnboardingStepConfig[];

export function getOnboardingShellLight(
  step: OnboardingStep,
): Readonly<{ level: GlowLevel; temperature: GlowTemperature }> {
  const light = onboardingSteps[step - 1].light;

  return { level: light.startLevel, temperature: light.temperature };
}
