import { Inter_400Regular, Inter_500Medium, useFonts } from '@expo-google-fonts/inter';
import { useAssets } from 'expo-asset';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import appConfig from '../app.json';
import '../src/db/client';
import { manifestoAudioSource } from '../src/onboarding/audio';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });
  const [manifestoAssets, manifestoAssetError] = useAssets(manifestoAudioSource);

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded || (manifestoAssets === undefined && manifestoAssetError === undefined)) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: appConfig.expo.backgroundColor },
        }}
      />
      <StatusBar style="light" />
    </>
  );
}
