import type { OnboardingStep } from './steps';

export type ManifestoStep = Extract<OnboardingStep, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>;
export type ManifestoPresentation =
  | 'narrative'
  | 'cycle'
  | 'broken-cycle'
  | 'positive-list'
  | 'negative-list'
  | 'categories'
  | 'statement'
  | 'grace-graph'
  | 'commit';

export type ManifestoScreenConfig = Readonly<{
  step: ManifestoStep;
  presentation: ManifestoPresentation;
}>;

export type ManifestoAudioPolicy = Readonly<{
  controlVisibleAtMs: number;
  downloadFirst: boolean;
  playsInSilentMode: boolean;
}>;

export const manifestoRevealIntervalMs = 400;
export const manifestoActionDelayMs = 4_000;
export const manifestoScreenOneLineCuesMs = [
  0, 2_368, 6_431, 11_336, 16_578, 19_883, 22_563, 24_918,
] as const;

export const manifestoScreens = [
  { step: 1, presentation: 'narrative' },
  { step: 2, presentation: 'cycle' },
  { step: 3, presentation: 'broken-cycle' },
  { step: 4, presentation: 'positive-list' },
  { step: 5, presentation: 'negative-list' },
  { step: 6, presentation: 'categories' },
  { step: 7, presentation: 'statement' },
  { step: 8, presentation: 'grace-graph' },
  { step: 9, presentation: 'statement' },
  { step: 10, presentation: 'commit' },
] as const satisfies readonly ManifestoScreenConfig[];

const screenOneAudioPolicy: ManifestoAudioPolicy = {
  controlVisibleAtMs: 0,
  downloadFirst: true,
  playsInSilentMode: false,
};

export function getManifestoScreen(step: ManifestoStep): ManifestoScreenConfig;
export function getManifestoScreen(step: OnboardingStep): ManifestoScreenConfig | null;
export function getManifestoScreen(step: OnboardingStep): ManifestoScreenConfig | null {
  return manifestoScreens.find((screen) => screen.step === step) ?? null;
}

export function getManifestoLineCues(step: ManifestoStep, lineCount: number): number[] {
  if (lineCount <= 0) return [];

  if (step === 1) {
    const finalDocumentedCue = manifestoScreenOneLineCuesMs.at(-1) ?? 0;

    return Array.from({ length: lineCount }, (_, index) => {
      return (
        manifestoScreenOneLineCuesMs[index] ??
        finalDocumentedCue +
          (index - manifestoScreenOneLineCuesMs.length + 1) * manifestoRevealIntervalMs
      );
    });
  }

  return Array.from({ length: lineCount }, (_, index) => index * manifestoRevealIntervalMs);
}

export function getVisibleManifestoLineCount({
  elapsedMs,
  lineCount,
  lineCuesMs,
  reducedMotion = false,
}: Readonly<{
  elapsedMs: number;
  lineCount: number;
  lineCuesMs?: readonly number[];
  reducedMotion?: boolean;
}>): number {
  if (lineCount <= 0) return 0;
  if (reducedMotion) return lineCount;

  if (lineCuesMs !== undefined) {
    return lineCuesMs.slice(0, lineCount).filter((cueMs) => elapsedMs >= cueMs).length;
  }

  return Math.min(lineCount, Math.floor(Math.max(0, elapsedMs) / manifestoRevealIntervalMs) + 1);
}

export function isManifestoActionVisible(elapsedMs: number, reducedMotion = false): boolean {
  return reducedMotion || elapsedMs >= manifestoActionDelayMs;
}

export function splitManifestoBody(body: readonly string[]): string[] {
  return body.flatMap((paragraph) => paragraph.split('\n'));
}

export function getManifestoAudioPolicy(step: OnboardingStep): ManifestoAudioPolicy | null {
  return step === 1 ? screenOneAudioPolicy : null;
}

export function shouldStartManifestoAudio({
  modeConfigured,
  sourceLoaded,
  started,
}: Readonly<{ modeConfigured: boolean; sourceLoaded: boolean; started: boolean }>): boolean {
  return modeConfigured && sourceLoaded && !started;
}
