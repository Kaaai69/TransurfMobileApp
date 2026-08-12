import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';

import { spacing } from '../theme';
import {
  glowForms,
  glowGradientStops,
  glowViewBox,
  resolveGlowPalette,
  type GlowForm,
  type GlowLevel,
  type GlowTemperature,
} from './levels';

type GlowProps = Readonly<{
  level: GlowLevel;
  form: GlowForm;
  temperature?: GlowTemperature;
  color?: string;
}>;

export function Glow({ level, form, temperature = 'cool', color }: GlowProps) {
  const id = useId().replace(/:/g, '');
  const palette = resolveGlowPalette(level, temperature, color);

  if (palette === null) {
    return null;
  }

  const geometry = glowForms[form];

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
        <RadialGradient id={id} gradientUnits="userSpaceOnUse" cx={50} cy={50} r={50}>
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
      {geometry.shape === 'ellipse' ? (
        <Ellipse
          cx={geometry.cx}
          cy={geometry.cy}
          rx={geometry.rx}
          ry={geometry.ry}
          fill={`url(#${id})`}
        />
      ) : geometry.shape === 'circle' ? (
        <Circle cx={geometry.cx} cy={geometry.cy} r={geometry.r} fill={`url(#${id})`} />
      ) : (
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
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  fill: StyleSheet.absoluteFillObject,
});
