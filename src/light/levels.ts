import { colors, motion } from '../theme';

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

export type GlowTransitionPlan = Readonly<{
  opacity: 0 | 1;
  duration: number;
  easing: 'ease-in' | 'ease-out';
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

export type GlowLayout = Readonly<{
  width: number;
  height: number;
}>;

type PixelGlowGeometry =
  | Readonly<{ shape: 'ellipse'; cx: number; cy: number; rx: number; ry: number }>
  | Readonly<{ shape: 'circle'; cx: number; cy: number; r: number }>
  | Readonly<{
      shape: 'rect';
      x: number;
      y: number;
      width: number;
      height: number;
      rx: number;
      strokeWidth?: number;
    }>;

export type GlowRenderPlan = Readonly<{
  viewport: Readonly<{
    padding: number;
    x: number;
    y: number;
    width: number;
    height: number;
    viewBox: string;
  }>;
  geometry: PixelGlowGeometry;
  gradient: Readonly<{
    cx: number;
    cy: number;
    r: number;
    transform?: string;
  }>;
  falloff: Readonly<{
    extent: number;
    geometry: PixelGlowGeometry;
  }>;
}>;

export function resolveGlowRenderPlan(
  level: GlowLevel,
  form: GlowForm,
  layout: GlowLayout,
): GlowRenderPlan {
  const formGeometry = glowForms[form];
  const blur = glowLevels[level].blur;
  const scaleX = layout.width / glowViewBox.width;
  const scaleY = layout.height / glowViewBox.height;
  const minScale = Math.min(scaleX, scaleY);
  const baseGeometry =
    formGeometry.shape === 'ellipse'
      ? {
          shape: 'ellipse' as const,
          cx: layout.width / 2,
          cy: layout.height,
          rx: formGeometry.rx * scaleX,
          ry: formGeometry.ry * scaleY,
        }
      : formGeometry.shape === 'circle'
        ? {
            shape: 'circle' as const,
            cx: layout.width / 2,
            cy: layout.height / 2,
            r: formGeometry.r * minScale,
          }
        : {
            shape: 'rect' as const,
            x: 0,
            y: 0,
            width: layout.width,
            height: layout.height,
            rx: formGeometry.rx * minScale,
          };
  const bloomOverflow =
    baseGeometry.shape === 'ellipse' ? Math.max(baseGeometry.rx - layout.width / 2, 0) : 0;
  const padding = Math.max(blur, bloomOverflow + blur);
  const viewport = {
    padding,
    x: -padding,
    y: -padding,
    width: layout.width + padding * 2,
    height: layout.height + padding * 2,
    viewBox: `0 0 ${layout.width + padding * 2} ${layout.height + padding * 2}`,
  };
  const geometry =
    baseGeometry.shape === 'ellipse'
      ? { ...baseGeometry, cx: baseGeometry.cx + padding, cy: baseGeometry.cy + padding }
      : baseGeometry.shape === 'circle'
        ? { ...baseGeometry, cx: baseGeometry.cx + padding, cy: baseGeometry.cy + padding }
        : { ...baseGeometry, x: padding, y: padding };

  if (geometry.shape === 'ellipse') {
    const falloffGeometry = { ...geometry, rx: geometry.rx + blur, ry: geometry.ry + blur };

    return {
      viewport,
      geometry,
      gradient: {
        cx: geometry.cx,
        cy: geometry.cy,
        r: falloffGeometry.rx,
        transform: `translate(${geometry.cx} ${geometry.cy}) scale(1 ${falloffGeometry.ry / falloffGeometry.rx}) translate(${-geometry.cx} ${-geometry.cy})`,
      },
      falloff: { extent: blur, geometry: falloffGeometry },
    };
  }

  if (geometry.shape === 'circle') {
    const falloffGeometry = { ...geometry, r: geometry.r + blur };

    return {
      viewport,
      geometry,
      gradient: { cx: geometry.cx, cy: geometry.cy, r: falloffGeometry.r },
      falloff: { extent: blur, geometry: falloffGeometry },
    };
  }

  const falloffGeometry = {
    ...geometry,
    x: geometry.x - blur / 2,
    y: geometry.y - blur / 2,
    width: geometry.width + blur,
    height: geometry.height + blur,
    rx: geometry.rx + blur / 2,
    strokeWidth: blur,
  };
  const radius = Math.hypot(geometry.width / 2, geometry.height / 2) + blur;

  return {
    viewport,
    geometry,
    gradient: {
      cx: geometry.x + geometry.width / 2,
      cy: geometry.y + geometry.height / 2,
      r: radius,
    },
    falloff: { extent: blur, geometry: falloffGeometry },
  };
}

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

export function resolveGlowTransition(
  visible: boolean,
  reducedMotion: boolean,
): GlowTransitionPlan {
  const transition = visible ? motion.light.appear : motion.light.recede;

  return {
    opacity: visible ? 1 : 0,
    duration: reducedMotion ? 0 : transition.duration,
    easing: transition.easing,
  };
}
