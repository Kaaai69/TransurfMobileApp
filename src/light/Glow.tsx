import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { spacing } from '../theme';
import {
  glowGradientStops,
  glowViewBox,
  resolveGlowGeometry,
  resolveGlowPalette,
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
  const palette = resolveGlowPalette(level, temperature, color);

  if (palette === null) {
    return null;
  }

  const resolved = resolveGlowGeometry(level, form);
  const { geometry, gradient, filter } = resolved;
  const filterId = `${id}-falloff`;

  return (
    <Svg
      pointerEvents="none"
      style={styles.fill}
      viewBox={glowViewBox.value}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
    >
      <Defs>
        <RadialGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          cx={gradient.cx}
          cy={gradient.cy}
          r={gradient.r}
          gradientTransform={gradient.transform}
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
        <Filter
          id={filterId}
          x={filter.x}
          y={filter.y}
          width={filter.width}
          height={filter.height}
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
        >
          <FeGaussianBlur stdDeviation={filter.stdDeviation} />
        </Filter>
      </Defs>
      {geometry.shape === 'ellipse' ? (
        <>
          <Ellipse
            cx={geometry.cx}
            cy={geometry.cy}
            rx={geometry.rx}
            ry={geometry.ry}
            fill={`url(#${id})`}
            filter={`url(#${filterId})`}
          />
          <Ellipse
            cx={geometry.cx}
            cy={geometry.cy}
            rx={geometry.rx}
            ry={geometry.ry}
            fill={`url(#${id})`}
          />
        </>
      ) : geometry.shape === 'circle' ? (
        <>
          <Circle
            cx={geometry.cx}
            cy={geometry.cy}
            r={geometry.r}
            fill={`url(#${id})`}
            filter={`url(#${filterId})`}
          />
          <Circle cx={geometry.cx} cy={geometry.cy} r={geometry.r} fill={`url(#${id})`} />
        </>
      ) : (
        <>
          <Rect
            x={geometry.x}
            y={geometry.y}
            width={geometry.width}
            height={geometry.height}
            rx={geometry.rx}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={spacing.hairline}
            filter={`url(#${filterId})`}
          />
          <Rect
            x={geometry.x}
            y={geometry.y}
            width={geometry.width}
            height={geometry.height}
            rx={geometry.rx}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={spacing.hairline}
          />
        </>
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, overflow: 'visible' },
});
