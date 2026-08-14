import Ionicons from '@expo/vector-icons/Ionicons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ru } from '../i18n/ru';
import { colors, spacing } from '../theme';
import { manifestoAudioSource } from './audio';
import { shouldStartManifestoAudio, type ManifestoAudioPolicy } from './manifesto';

export type ManifestoAudioProps = Readonly<{
  policy: ManifestoAudioPolicy;
}>;

export function ManifestoAudio({ policy }: ManifestoAudioProps) {
  const player = useAudioPlayer(manifestoAudioSource, {
    downloadFirst: policy.downloadFirst,
  });
  const status = useAudioPlayerStatus(player);
  const started = useRef(false);
  const [modeConfigured, setModeConfigured] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let active = true;
    started.current = false;
    setModeConfigured(false);

    void setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: policy.playsInSilentMode,
      shouldPlayInBackground: false,
    })
      .then(() => {
        if (active) {
          setModeConfigured(true);
        }
      })
      .catch(() => {
        // The complete message remains visible when audio is unavailable.
      });

    return () => {
      active = false;
    };
  }, [policy.playsInSilentMode]);

  useEffect(() => {
    if (
      shouldStartManifestoAudio({
        modeConfigured,
        sourceLoaded: status.isLoaded,
        started: started.current,
      })
    ) {
      started.current = true;
      player.play();
    }
  }, [modeConfigured, player, status.isLoaded]);

  useEffect(
    () => () => {
      player.pause();
    },
    [player],
  );

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  return (
    <Pressable
      accessibilityLabel={
        muted ? ru.onboarding.manifesto.audioOffLabel : ru.onboarding.manifesto.audioOnLabel
      }
      accessibilityRole="button"
      accessibilityState={{ checked: muted }}
      hitSlop={spacing.cardGap}
      onPress={() => setMuted((current) => !current)}
      style={({ pressed }) => [styles.control, pressed ? styles.controlPressed : null]}
    >
      <Ionicons
        color={colors.textSecondary}
        name={muted ? 'volume-mute-outline' : 'volume-high-outline'}
        size={22}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderRadius: spacing.radii.button,
    borderWidth: spacing.hairline,
    height: spacing.heights.minTouch,
    justifyContent: 'center',
    width: spacing.heights.minTouch,
  },
  controlPressed: {
    backgroundColor: colors.surface3,
  },
});
