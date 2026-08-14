import { useEventListener } from 'expo';
import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import AsyncStorage from 'expo-sqlite/kv-store';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { databaseReady } from '../db/client';
import { colors } from '../theme';
import {
  getLaunchDestination,
  markWelcomeSeen,
  readLaunchState,
  selectWelcomeMode,
  type LaunchDestination,
  type LaunchState,
  type WelcomeMode,
} from './state';

const fullVideo = require('../../Light_arc_expanding_in_void_202608031404.mp4');
const repeatVideo = require('../../assets/video/welcome-repeat.mp4');
const finalFrame = require('../../assets/video/welcome-final.png');

function asError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function FinalFrame({ onPresented }: Readonly<{ onPresented?: () => void }>) {
  useEffect(() => {
    if (!onPresented) return;

    const frame = requestAnimationFrame(onPresented);
    return () => cancelAnimationFrame(frame);
  }, [onPresented]);

  return <Image contentFit="contain" source={finalFrame} style={styles.media} />;
}

function VideoSequence({
  mode,
  onComplete,
}: Readonly<{ mode: Exclude<WelcomeMode, 'final-frame'>; onComplete: () => void }>) {
  const [failed, setFailed] = useState(false);
  const source: VideoSource = mode === 'full' ? fullVideo : repeatVideo;
  const player = useVideoPlayer(source, (createdPlayer) => {
    createdPlayer.loop = false;
    createdPlayer.muted = true;
    createdPlayer.play();
  });

  useEventListener(player, 'playToEnd', onComplete);
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') setFailed(true);
  });

  if (failed) return <FinalFrame onPresented={onComplete} />;

  return (
    <VideoView
      allowsPictureInPicture={false}
      allowsVideoFrameAnalysis={false}
      contentFit="contain"
      fullscreenOptions={{ enable: false }}
      nativeControls={false}
      player={player}
      requiresLinearPlayback
      style={styles.media}
      surfaceType="textureView"
    />
  );
}

export function WelcomeScreen() {
  const mounted = useRef(true);
  const completing = useRef(false);
  const [launchState, setLaunchState] = useState<LaunchState | null>(null);
  const [mode, setMode] = useState<WelcomeMode | null>(null);
  const [destination, setDestination] = useState<LaunchDestination | null>(null);
  const [failure, setFailure] = useState<Error | null>(null);

  useEffect(() => {
    mounted.current = true;

    void Promise.all([readLaunchState(AsyncStorage), AccessibilityInfo.isReduceMotionEnabled()])
      .then(([storedState, reducedMotion]) => {
        if (!mounted.current) return;
        setLaunchState(storedState);
        setMode(selectWelcomeMode({ hasSeenWelcome: storedState.hasSeenWelcome, reducedMotion }));
      })
      .catch((error: unknown) => {
        if (mounted.current) setFailure(asError(error));
      });

    return () => {
      mounted.current = false;
    };
  }, []);

  const completeWelcome = useCallback(() => {
    if (completing.current || !launchState) return;
    completing.current = true;

    void Promise.all([databaseReady, markWelcomeSeen(AsyncStorage)])
      .then(() => {
        if (mounted.current) setDestination(getLaunchDestination(launchState));
      })
      .catch((error: unknown) => {
        completing.current = false;
        if (mounted.current) setFailure(asError(error));
      });
  }, [launchState]);

  if (failure) throw failure;
  if (destination) return <Redirect href={destination} withAnchor />;

  return (
    <View style={styles.container}>
      {mode === 'final-frame' ? <FinalFrame onPresented={completeWelcome} /> : null}
      {mode === 'full' || mode === 'repeat' ? (
        <VideoSequence mode={mode} onComplete={completeWelcome} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.canvas,
    mixBlendMode: 'screen',
  },
});
