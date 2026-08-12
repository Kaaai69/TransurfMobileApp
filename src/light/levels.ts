import { colors } from '../theme';

export type GlowLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type GlowForm = 'bloom' | 'halo' | 'edge' | 'core';
export type GlowTemperature = 'cool' | 'warm';

type GlowLevelPreset = Readonly<{
  alpha: number;
  blur: number;
  coreAlpha: number;
}>;

export type GlowPalette = Readonly<{
  core: string;
  transition: string;
  halo: string;
  alpha: number;
  coreAlpha: number;
}>;

export const glowLevels = {
  L0: { alpha: 0, blur: 0, coreAlpha: 0 },
  L1: { alpha: 0.08, blur: 60, coreAlpha: 0 },
  L2: { alpha: 0.15, blur: 48, coreAlpha: 0 },
  L3: { alpha: 0.25, blur: 36, coreAlpha: 0.15 },
  L4: { alpha: 0.4, blur: 24, coreAlpha: 0.75 },
  L5: { alpha: 0.55, blur: 16, coreAlpha: 1 },
} as const satisfies Record<GlowLevel, GlowLevelPreset>;

export const glowViewBox = {
  width: 100,
  height: 100,
  value: '0 0 100 100',
} as const;

export const glowGradientStops = {
  core: '0%',
  transition: '14%',
  halo: '38%',
  fade: '100%',
} as const;

type GlowGeometry =
  | Readonly<{ shape: 'ellipse'; cx: number; cy: number; rx: number; ry: number }>
  | Readonly<{ shape: 'circle'; cx: number; cy: number; r: number }>
  | Readonly<{ shape: 'rect'; x: number; y: number; width: number; height: number; rx: number }>;

export const glowForms = {
  bloom: { shape: 'ellipse', cx: 50, cy: 100, rx: 74, ry: 24 },
  halo: { shape: 'circle', cx: 50, cy: 50, r: 50 },
  edge: { shape: 'rect', x: 0, y: 0, width: 100, height: 100, rx: 12 },
  core: { shape: 'circle', cx: 50, cy: 50, r: 32 },
} as const satisfies Record<GlowForm, GlowGeometry>;

export function resolveGlowPalette(
  level: GlowLevel,
  temperature: GlowTemperature,
  color?: string,
): GlowPalette | null {
  if (level === 'L0') {
    return null;
  }

  const preset = glowLevels[level];
  const palette =
    temperature === 'warm'
      ? { core: colors.onAccent, transition: colors.warm, halo: colors.warmDim }
      : {
          core: colors.onAccent,
          transition: colors.accentBright,
          halo: color ?? colors.accent,
        };

  return { ...palette, alpha: preset.alpha, coreAlpha: preset.coreAlpha };
}
