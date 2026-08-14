import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Glow, type GlowForm, type GlowLevel, type GlowTemperature } from '../light';
import { colors, spacing } from '../theme';

export interface ScreenShellProps extends PropsWithChildren {
  level: GlowLevel;
  glowForm?: GlowForm;
  glowTemperature?: GlowTemperature;
  footer?: ReactNode;
}

export function ScreenShell({
  children,
  footer,
  level,
  glowForm = 'bloom',
  glowTemperature = 'cool',
}: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.contentArea}>
        <Glow form={glowForm} level={level} temperature={glowTemperature} />
        <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
          {children}
        </ScrollView>
        {footer == null ? null : <View style={styles.footer}>{footer}</View>}
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
  footer: {
    paddingBottom: spacing.screen,
    paddingHorizontal: spacing.screen,
  },
  scroll: {
    flex: 1,
  },
});
