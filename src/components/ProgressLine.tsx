import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Glow } from '../light';
import { colors, motion, spacing } from '../theme';

export interface ProgressLineProps {
  progress: number;
  color?: string;
  accessibilityLabel?: string;
}

export function ProgressLine({
  progress,
  color = colors.accent,
  accessibilityLabel,
}: ProgressLineProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const reducedMotion = useReducedMotion();
  const animatedProgress = useSharedValue(clampedProgress);

  useEffect(() => {
    animatedProgress.value = reducedMotion
      ? clampedProgress
      : withTiming(clampedProgress, {
          duration: motion.progress.duration,
          easing: Easing.linear,
        });
  }, [animatedProgress, clampedProgress, reducedMotion]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 1, now: clampedProgress }}
      style={styles.track}
    >
      <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]}>
        <Glow color={color} form="edge" level="L2" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    borderRadius: spacing.radii.button,
    height: (spacing.hairline * spacing.grid) / 1,
    overflow: 'visible',
    width: '100%',
  },
  fill: {
    borderRadius: spacing.radii.button,
    height: '100%',
    overflow: 'visible',
  },
});
