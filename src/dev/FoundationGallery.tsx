import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnswerOption, Chip, ProgressLine, ScreenShell } from '../components';
import { ru } from '../i18n/ru';
import { Glow, type GlowForm, type GlowLevel } from '../light';
import { colors, spacing, typography } from '../theme';

const levels: readonly GlowLevel[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
const formRows: readonly (readonly GlowForm[])[] = [
  ['bloom', 'halo'],
  ['edge', 'core'],
];

export function FoundationGallery() {
  const [selectedPreview, setSelectedPreview] = useState(true);

  return (
    <ScreenShell level="L0">
      <Text style={styles.title}>{ru.foundation.title}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{ru.foundation.levels}</Text>
        <View style={styles.levelList}>
          {levels.map((level) => (
            <View key={level} style={styles.levelRow}>
              <Glow level={level} form="bloom" />
              <Text style={styles.levelName}>{level}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{ru.foundation.forms}</Text>
        <View style={styles.formGrid}>
          {formRows.map((row) => (
            <View key={row.join()} style={styles.formRow}>
              {row.map((form) => (
                <View key={form} style={styles.formCell}>
                  <Glow level="L3" form={form} />
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{ru.foundation.components}</Text>
        <View style={styles.componentList}>
          <AnswerOption label={ru.common.continue} onPress={() => undefined} selected={false} />
          <AnswerOption
            label={ru.foundation.selected}
            onPress={() => setSelectedPreview((current) => !current)}
            selected={selectedPreview}
          />
          <AnswerOption
            disabled
            label={ru.common.later}
            onPress={() => undefined}
            selected={false}
          />
          <ProgressLine progress={0.25} />
          <ProgressLine progress={0.75} />
          <View style={styles.chipList}>
            <Chip label={ru.foundation.components} />
            <Chip label={ru.foundation.selected} tone="accent" />
            <Chip label={ru.common.later} tone="warm" />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  section: {
    gap: spacing.cardGap,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
  },
  levelList: {
    gap: spacing.cardGap,
  },
  levelRow: {
    minHeight: spacing.heights.row,
    justifyContent: 'center',
    paddingHorizontal: spacing.rhythm * 2,
    overflow: 'hidden',
    borderRadius: spacing.radii.field,
    borderWidth: spacing.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface1,
  },
  levelName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  formGrid: {
    gap: spacing.cardGap,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.cardGap,
  },
  formCell: {
    flex: 1,
    height: spacing.heights.row * 2,
    overflow: 'hidden',
    borderRadius: spacing.radii.field,
    borderWidth: spacing.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface1,
  },
  componentList: {
    gap: spacing.cardGap,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.rhythm,
  },
});
