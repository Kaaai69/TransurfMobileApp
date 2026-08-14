import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';

import { Glow } from '../light';
import { ru, type CategoryKey } from '../i18n/ru';
import { colors, motion, spacing, typography } from '../theme';
import { manifestoRevealIntervalMs, type ManifestoPresentation } from './manifesto';

const lineEntering = FadeInDown.duration(manifestoRevealIntervalMs)
  .easing(Easing.bezier(...motion.screen.easing))
  .reduceMotion(ReduceMotion.System);

const categoryItems = [
  { key: 'sleep', icon: 'bed-outline', color: colors.catSleep },
  { key: 'energy', icon: 'sunny-outline', color: colors.catEnergy },
  { key: 'movement', icon: 'walk-outline', color: colors.catMovement },
  { key: 'food', icon: 'restaurant-outline', color: colors.catFood },
  { key: 'water', icon: 'water-outline', color: colors.catWater },
  { key: 'mind', icon: 'bulb-outline', color: colors.catMind },
] as const satisfies readonly Readonly<{
  key: CategoryKey;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
}>[];

type ManifestoVisualsProps = Readonly<{
  presentation: ManifestoPresentation;
  visibleLines: readonly string[];
  onSourcePress: () => void;
}>;

type RevealLineProps = Readonly<{
  children: string;
  index: number;
  style?: StyleProp<TextStyle>;
}>;

function RevealLine({ children, index, style }: RevealLineProps) {
  return (
    <Animated.Text entering={lineEntering} key={`${index}-${children}`} style={style}>
      {children}
    </Animated.Text>
  );
}

function CycleDiagram({ broken }: Readonly<{ broken: boolean }>) {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion() === true;

  useEffect(() => {
    if (reducedMotion) {
      progress.value = broken ? 0.72 : 1;
      return;
    }

    progress.value = broken
      ? withTiming(0.72, {
          duration: 1_400,
          easing: Easing.out(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        })
      : withRepeat(
          withTiming(1, {
            duration: 2_000,
            easing: Easing.linear,
            reduceMotion: ReduceMotion.System,
          }),
          -1,
          false,
        );
  }, [broken, progress, reducedMotion]);

  const dotStyle = useAnimatedStyle(() => {
    const angle = progress.value * Math.PI * 2 - Math.PI / 2;

    return {
      transform: [{ translateX: Math.cos(angle) * 72 }, { translateY: Math.sin(angle) * 62 }],
    };
  });
  const cycleNodePositions = [
    styles.cycleNode0,
    styles.cycleNode1,
    styles.cycleNode2,
    styles.cycleNode3,
  ] as const;

  return (
    <View
      accessible
      accessibilityLabel={ru.onboarding.manifesto.cycleAccessibilityLabel}
      accessibilityRole="image"
      style={styles.cycle}
    >
      <View style={[styles.cycleTrack, broken ? styles.cycleTrackBroken : null]} />
      <Animated.View style={[styles.cycleDot, dotStyle]} />
      {broken ? <View style={styles.cycleBreak} /> : null}
      {ru.onboarding.manifesto.cycleNodes.map((node, index) => (
        <View key={node} style={[styles.cycleNode, cycleNodePositions[index]]}>
          <Text style={styles.cycleNodeText}>{node}</Text>
        </View>
      ))}
    </View>
  );
}

function CategoryGrid() {
  return (
    <Animated.View entering={lineEntering} style={styles.categoryGrid}>
      {categoryItems.map((item) => (
        <View key={item.key} style={styles.categoryItem}>
          <View style={styles.categoryIcon}>
            <Glow color={item.color} form="halo" level="L1" />
            <Ionicons color={item.color} name={item.icon} size={24} />
          </View>
          <Text style={styles.categoryLabel}>{ru.categories[item.key]}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

function GraceGraph() {
  return (
    <Animated.View
      accessible
      accessibilityLabel={ru.onboarding.manifesto.graphAccessibilityLabel}
      accessibilityRole="image"
      entering={lineEntering}
      style={styles.graph}
    >
      <View style={styles.graphRow}>
        <Text style={styles.graphLabel}>{ru.onboarding.manifesto.streakLineLabel}</Text>
        <Svg height={52} viewBox="0 0 240 52" width="100%">
          <Line stroke={colors.border} strokeWidth={1} x1={0} x2={240} y1={44} y2={44} />
          <Path
            d="M 0 36 L 38 30 L 76 24 L 114 18 L 152 12 L 174 8 L 176 44 L 240 44"
            fill="none"
            stroke={colors.neutralDown}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
          />
        </Svg>
      </View>
      <View style={styles.graphRow}>
        <Text style={[styles.graphLabel, styles.graphWarmLabel]}>
          {ru.onboarding.manifesto.graceLineLabel}
        </Text>
        <Svg height={52} viewBox="0 0 240 52" width="100%">
          <Line stroke={colors.border} strokeWidth={1} x1={0} x2={240} y1={44} y2={44} />
          <Path
            d="M 0 36 L 38 30 L 76 24 L 114 18 L 152 12 L 176 27 L 204 20 L 240 12"
            fill="none"
            stroke={colors.warm}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
          />
        </Svg>
      </View>
    </Animated.View>
  );
}

function TextLines({
  lines,
  style,
}: Readonly<{ lines: readonly string[]; style?: StyleProp<TextStyle> }>) {
  return (
    <View style={styles.lines}>
      {lines.map((line, index) => (
        <RevealLine index={index} key={`${index}-${line}`} style={style}>
          {line}
        </RevealLine>
      ))}
    </View>
  );
}

export function ManifestoVisuals({
  presentation,
  visibleLines,
  onSourcePress,
}: ManifestoVisualsProps) {
  if (presentation === 'cycle') {
    return (
      <View style={styles.visualStack}>
        {visibleLines.length === 0 ? null : <CycleDiagram broken={false} />}
        <TextLines lines={visibleLines.slice(2)} style={styles.bodyText} />
      </View>
    );
  }

  if (presentation === 'broken-cycle') {
    return (
      <View style={styles.visualStack}>
        {visibleLines.length === 0 ? null : <CycleDiagram broken />}
        <TextLines lines={visibleLines} style={styles.bodyText} />
      </View>
    );
  }

  if (presentation === 'positive-list' || presentation === 'negative-list') {
    const positive = presentation === 'positive-list';

    return (
      <View style={styles.list}>
        {visibleLines.map((line, index) => (
          <Animated.View entering={lineEntering} key={`${index}-${line}`} style={styles.listRow}>
            {positive ? (
              <Ionicons color={colors.accentBright} name="checkmark" size={20} />
            ) : (
              <Text style={styles.listDash}>—</Text>
            )}
            <Text style={styles.listText}>{line}</Text>
          </Animated.View>
        ))}
      </View>
    );
  }

  if (presentation === 'categories') {
    return (
      <View style={styles.visualStack}>
        {visibleLines.length === 0 ? null : <CategoryGrid />}
        <TextLines lines={visibleLines.slice(1)} style={styles.bodyText} />
      </View>
    );
  }

  if (presentation === 'grace-graph') {
    const citation = visibleLines.at(-1) === ru.onboarding.screens[8].body.at(-1);
    const narrativeLines = citation ? visibleLines.slice(0, -1) : visibleLines;

    return (
      <View style={styles.visualStack}>
        <View style={styles.lines}>
          {narrativeLines.map((line, index) => (
            <RevealLine
              index={index}
              key={`${index}-${line}`}
              style={index === 3 ? styles.graphEmphasis : styles.bodyText}
            >
              {line}
            </RevealLine>
          ))}
        </View>
        {visibleLines.length >= 3 ? <GraceGraph /> : null}
        {citation ? (
          <Animated.Text
            accessibilityRole="link"
            entering={lineEntering}
            onPress={onSourcePress}
            style={styles.sourceLink}
          >
            {ru.onboarding.screens[8].body.at(-1)} · {ru.onboarding.manifesto.sourceLink}
          </Animated.Text>
        ) : null}
      </View>
    );
  }

  const textStyle =
    presentation === 'narrative' || presentation === 'statement'
      ? styles.manifestoText
      : styles.bodyText;

  return <TextLines lines={visibleLines} style={textStyle} />;
}

const styles = StyleSheet.create({
  bodyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.cardGap,
  },
  categoryIcon: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  categoryItem: {
    alignItems: 'center',
    gap: spacing.rhythm,
    width: '30%',
  },
  categoryLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cycle: {
    alignSelf: 'center',
    height: 210,
    position: 'relative',
    width: 240,
  },
  cycleBreak: {
    backgroundColor: colors.canvas,
    height: 20,
    left: 106,
    position: 'absolute',
    top: 174,
    transform: [{ rotate: '-20deg' }],
    width: 32,
  },
  cycleDot: {
    backgroundColor: colors.accentBright,
    borderRadius: 4,
    height: 8,
    left: 116,
    position: 'absolute',
    top: 101,
    width: 8,
  },
  cycleNode: {
    alignItems: 'center',
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderRadius: spacing.radii.field,
    borderWidth: spacing.hairline,
    height: spacing.heights.minTouch,
    justifyContent: 'center',
    paddingHorizontal: spacing.rhythm,
    position: 'absolute',
    width: 98,
  },
  cycleNode0: {
    left: 71,
    top: 0,
  },
  cycleNode1: {
    right: 0,
    top: 82,
  },
  cycleNode2: {
    bottom: 0,
    left: 71,
  },
  cycleNode3: {
    left: 0,
    top: 82,
  },
  cycleNodeText: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cycleTrack: {
    borderColor: colors.border,
    borderRadius: 80,
    borderWidth: spacing.hairline,
    height: 130,
    left: 47,
    position: 'absolute',
    top: 40,
    width: 146,
  },
  cycleTrackBroken: {
    borderColor: colors.accentBright,
  },
  graph: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderRadius: spacing.radii.card,
    borderWidth: spacing.hairline,
    gap: spacing.cardGap,
    padding: spacing.cardGap,
  },
  graphEmphasis: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  graphLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  graphRow: {
    gap: spacing.grid,
  },
  graphWarmLabel: {
    color: colors.warm,
  },
  lines: {
    gap: spacing.cardGap,
  },
  list: {
    gap: spacing.cardGap,
  },
  listDash: {
    ...typography.body,
    color: colors.textMuted,
    width: 20,
  },
  listRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.cardGap,
  },
  listText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  manifestoText: {
    ...typography.manifesto,
    color: colors.textPrimary,
  },
  sourceLink: {
    ...typography.caption,
    color: colors.accentBright,
    textDecorationLine: 'underline',
  },
  visualStack: {
    gap: spacing.sectionGap,
  },
});
