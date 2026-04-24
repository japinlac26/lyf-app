import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { seedHabits } from '@/src/db/seed';
import { useCharacterStore } from '@/src/store/characterStore';
import { useHabitsStore } from '@/src/store/habitsStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const loadCharacter = useCharacterStore((s) => s.load);
  const loadHabits = useHabitsStore((s) => s.load);

  useEffect(() => {
    // Boot sequence: seed DB then load stores
    seedHabits()
      .then(() => Promise.all([loadCharacter(), loadHabits()]))
      .catch(console.error);
  }, [loadCharacter, loadHabits]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="level-up"
          options={{ presentation: 'transparentModal', headerShown: false }}
        />
        <Stack.Screen
          name="add-habit"
          options={{ presentation: 'modal', title: 'Add Habit', headerShown: true }}
        />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
