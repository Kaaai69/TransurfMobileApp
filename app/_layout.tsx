import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import appConfig from '../app.json';

export default function RootLayout() {
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
