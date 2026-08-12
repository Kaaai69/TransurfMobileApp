import { useId, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';

import { spacing } from '../theme';
import {
  glowGradientStops,
  resolveGlowRenderPlan,
  resolveGlowPalette,
  type GlowLayout,
  type GlowForm,
  type GlowLevel,
  type GlowTemperature,
} from './levels';

export interface GlowProps {
  level: GlowLevel;
  form?: GlowForm;
  temperature?: GlowTemperature;
  color?: string;
}

export function Glow({ level, form = 'bloom', temperature = 'cool', color }: GlowProps) {
  const id = useId().replace(/:/g, '');
  const [layout, setLayout] = useState<GlowLayout | null>(null);
  const palette = resolveGlowPalette(level, temperature, color);

  if (palette === null) {
    return null;
  }

  const plan = layout === null ? null : resolveGlowRenderPlan(level, form, layout);

  function handleLayout({ nativeEvent }: LayoutChangeEvent) {
    const { height, width } = nativeEvent.layout;

    if (width > 0 && height > 0) {
      setLayout({ width, height });
    }
  }

  return (
    <View pointerEvents="none" style={styles.fill} onLayout={handleLayout}>
      {plan === null ? null : (
        <Svg
          style={[styles.svg, { left: plan.viewport.x, top: plan.viewport.y }]}
          viewBox={plan.viewport.viewBox}
          width={plan.viewport.width}
          height={plan.viewport.height}
        >
          <Defs>
            <RadialGradient
              id={id}
              gradientUnits="userSpaceOnUse"
              cx={plan.gradient.cx}
              cy={plan.gradient.cy}
              r={plan.gradient.r}
              gradientTransform={plan.gradient.transform}
            >
              <Stop
                offset={glowGradientStops.core}
                stopColor={palette.core}
                stopOpacity={palette.coreAlpha}
              />
              <Stop
                offset={glowGradientStops.transition}
                stopColor={palette.transition}
                stopOpacity={palette.alpha}
              />
              <Stop
                offset={glowGradientStops.halo}
                stopColor={palette.halo}
                stopOpacity={palette.alpha}
              />
              <Stop offset={glowGradientStops.fade} stopColor={palette.halo} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {plan.geometry.shape === 'ellipse' && plan.falloff.geometry.shape === 'ellipse' ? (
            <>
              <Ellipse
                cx={plan.falloff.geometry.cx}
                cy={plan.falloff.geometry.cy}
                rx={plan.falloff.geometry.rx}
                ry={plan.falloff.geometry.ry}
                fill={`url(#${id})`}
              />
              <Ellipse
                cx={plan.geometry.cx}
                cy={plan.geometry.cy}
                rx={plan.geometry.rx}
                ry={plan.geometry.ry}
                fill={`url(#${id})`}
              />
            </>
          ) : plan.geometry.shape === 'circle' && plan.falloff.geometry.shape === 'circle' ? (
            <>
              <Circle
                cx={plan.falloff.geometry.cx}
                cy={plan.falloff.geometry.cy}
                r={plan.falloff.geometry.r}
                fill={`url(#${id})`}
              />
              <Circle
                cx={plan.geometry.cx}
                cy={plan.geometry.cy}
                r={plan.geometry.r}
                fill={`url(#${id})`}
              />
            </>
          ) : plan.geometry.shape === 'rect' && plan.falloff.geometry.shape === 'rect' ? (
            <>
              <Rect
                x={plan.falloff.geometry.x}
                y={plan.falloff.geometry.y}
                width={plan.falloff.geometry.width}
                height={plan.falloff.geometry.height}
                rx={plan.falloff.geometry.rx}
                fill="none"
                stroke={`url(#${id})`}
                strokeWidth={plan.falloff.geometry.strokeWidth}
              />
              <Rect
                x={plan.geometry.x}
                y={plan.geometry.y}
                width={plan.geometry.width}
                height={plan.geometry.height}
                rx={plan.geometry.rx}
                fill="none"
                stroke={`url(#${id})`}
                strokeWidth={spacing.hairline}
              />
            </>
          ) : null}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, overflow: 'visible' },
  svg: { position: 'absolute' },
});
