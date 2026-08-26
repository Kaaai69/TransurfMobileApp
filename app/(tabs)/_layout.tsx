import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { ru } from '../../src/i18n/ru';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentBright,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_400Regular',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: ru.tabs.day,
          tabBarIcon: ({ color }) => <Ionicons color={color} name="ellipse-outline" size={22} />,
        }}
      />
      <Tabs.Screen
        name="method"
        options={{
          title: ru.tabs.method,
          tabBarIcon: ({ color }) => <Ionicons color={color} name="book-outline" size={22} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: ru.tabs.settings,
          tabBarIcon: ({ color }) => <Ionicons color={color} name="settings-outline" size={22} />,
        }}
      />
    </Tabs>
  );
}
