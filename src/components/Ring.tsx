import { Fragment, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Text as SvgText, type PathProps } from 'react-native-svg';

import { ru } from '../i18n/ru';
import { Glow } from '../light';
import { colors, motion, typography } from '../theme';
import {
  buildHabitSegments,
  buildStateSectors,
  ringGeometry,
  summarizeHabitStatuses,
  type HabitDayStatus,
  type RingCategory,
  type StateRingValues,
} from './ringGeometry';

export type { HabitDayStatus, StateRingValues } from './ringGeometry';

export type RingProps =
  | { mode: 'state'; values: StateRingValues; size?: number; animated?: boolean }
  | { mode: 'habit'; days: readonly HabitDayStatus[]; size?: number; animated?: boolean };

const AnimatedPath = Animated.createAnimatedComponent(Path);

const categoryColors: Readonly<Record<RingCategory, string>> = {
  sleep: colors.catSleep,
  energy: colors.catEnergy,
  movement: colors.catMovement,
  food: colors.catFood,
  water: colors.catWater,
  mind: colors.catMind,
};

type AnimatedRingPathProps = Readonly<{
  d: string;
  length: number;
  stroke: string;
  strokeWidth: number;
  delay: number;
  animated: boolean;
}>;

function AnimatedRingPath({
  d,
  length,
  stroke,
  strokeWidth,
  delay,
  animated,
}: AnimatedRingPathProps) {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animated && !reducedMotion;
  const progress = useSharedValue(shouldAnimate ? 0 : 1);

  useEffect(() => {
    if (!shouldAnimate) {
      progress.value = 1;
      return;
    }

    progress.value = 0;
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: motion.ring.duration,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [d, delay, length, progress, shouldAnimate]);

  const animatedProps = useAnimatedProps<PathProps>(() => ({
    strokeDashoffset: length * (1 - progress.value),
  }));

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      d={d}
      fill="none"
      stroke={stroke}
      strokeDasharray={`${length} ${length}`}
      strokeLinecap="butt"
      strokeWidth={strokeWidth}
    />
  );
}

function stateAccessibilityLabel(values: StateRingValues): string {
  return buildStateSectors(values)
    .map(({ category, value }) => `${ru.categories[category]} ${Math.round(value)}`)
    .join(', ');
}

export function Ring(props: RingProps) {
  const size = props.size ?? ringGeometry.defaultSize;
  const animated = props.animated ?? true;
  const compact = size <= ringGeometry.compactBreakpoint;
  const fontScale = ringGeometry.viewBoxSize / size;
  const habitSummary = props.mode === 'habit' ? summarizeHabitStatuses(props.days) : null;

  return (
    <View
      accessible
      accessibilityLabel={
        props.mode === 'state'
          ? stateAccessibilityLabel(props.values)
          : ru.accessibility.habitRingLabel
      }
      accessibilityRole="image"
      accessibilityValue={
        habitSummary === null
          ? undefined
          : {
              text: ru.accessibility.habitRingSummary(habitSummary),
            }
      }
      style={[styles.container, { height: size, width: size }]}
    >
      <Glow form="halo" level="L2" />
      <Svg
        height={size}
        width={size}
        viewBox={`0 0 ${ringGeometry.viewBoxSize} ${ringGeometry.viewBoxSize}`}
      >
        {props.mode === 'state'
          ? buildStateSectors(props.values).map((sector, index) => {
              const labelPoint = compact ? sector.compactLabelPoint : sector.externalLabelPoint;
              const textAnchor =
                index === 1 ? 'end' : index === 4 ? 'start' : index < 3 ? 'start' : 'end';

              return (
                <Fragment key={sector.category}>
                  <AnimatedRingPath
                    animated={animated}
                    d={sector.path}
                    delay={index * motion.ring.stagger}
                    length={sector.length}
                    stroke={categoryColors[sector.category]}
                    strokeWidth={ringGeometry.stateStrokeWidth}
                  />
                  {compact ? (
                    <SvgText
                      alignmentBaseline="middle"
                      fill={categoryColors[sector.category]}
                      fontFamily={typography.fonts.regular}
                      fontFeatureSettings="'tnum'"
                      fontSize={ringGeometry.compactLabelFontSize * fontScale}
                      textAnchor="middle"
                      transform={`rotate(${sector.compactLabelRotation} ${labelPoint.x} ${labelPoint.y})`}
                      x={labelPoint.x}
                      y={labelPoint.y}
                    >
                      {`${ru.categories[sector.category]} ${Math.round(sector.value)}`}
                    </SvgText>
                  ) : (
                    <SvgText
                      fill={categoryColors[sector.category]}
                      fontFamily={typography.fonts.regular}
                      fontFeatureSettings="'tnum'"
                      fontSize={typography.caption.fontSize * fontScale}
                      textAnchor={textAnchor}
                      x={labelPoint.x}
                      y={labelPoint.y}
                    >
                      {`${ru.categories[sector.category]} ${Math.round(sector.value)}`}
                    </SvgText>
                  )}
                </Fragment>
              );
            })
          : buildHabitSegments(props.days).map((segment) => (
              <AnimatedRingPath
                key={segment.day}
                animated={animated}
                d={segment.path}
                delay={0}
                length={segment.length}
                stroke={segment.status === 'pending' ? colors.border : colors.accentBright}
                strokeWidth={segment.strokeWidth}
              />
            ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
