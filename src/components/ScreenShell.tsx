import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Glow, type GlowForm, type GlowLevel } from '../light';
import { colors, spacing } from '../theme';

export interface ScreenShellProps extends PropsWithChildren {
  level: GlowLevel;
  glowForm?: GlowForm;
}

export function ScreenShell({ children, level, glowForm = 'bloom' }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.contentArea}>
        <Glow form={glowForm} level={level} />
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  content: {
    gap: spacing.sectionGap,
    padding: spacing.screen,
  },
});
