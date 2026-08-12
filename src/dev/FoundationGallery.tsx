import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ru } from '../i18n/ru';
import { Glow, type GlowForm, type GlowLevel } from '../light';
import { colors, spacing, typography } from '../theme';

const levels: readonly GlowLevel[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
const formRows: readonly (readonly GlowForm[])[] = [
  ['bloom', 'halo'],
  ['edge', 'core'],
];

export function FoundationGallery() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sectionGap,
    gap: spacing.sectionGap,
  },
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
});
