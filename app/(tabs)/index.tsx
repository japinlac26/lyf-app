import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { HabitRow } from '@/src/components/HabitRow';
import { XPBar } from '@/src/components/XPBar';
import { HABIT_UNDO_WINDOW_MS } from '@/src/game/balance';
import { useCharacterStore } from '@/src/store/characterStore';
import { useHabitsStore } from '@/src/store/habitsStore';

export default function HomeScreen() {
  const {
    level,
    xpPercent,
    xpIntoLevel,
    xpNeededForLevel,
    isLoading: charLoading,
    pendingLevelUp,
    acknowledgeLevelUp,
  } = useCharacterStore();
  const {
    habits,
    isLoading: habitsLoading,
    logHabit,
    undoLog,
    clearUndo,
    pendingUndo,
  } = useHabitsStore();

  const [xpPopText, setXpPopText] = useState<string | null>(null);
  const xpPopY = useSharedValue(0);
  const xpPopOpacity = useSharedValue(0);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Navigate to level-up modal when triggered
  useEffect(() => {
    if (pendingLevelUp) {
      acknowledgeLevelUp();
      router.push('/level-up');
    }
  }, [pendingLevelUp, acknowledgeLevelUp]);

  // Auto-dismiss undo after window
  useEffect(() => {
    if (pendingUndo) {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => clearUndo(), HABIT_UNDO_WINDOW_MS);
    }
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, [pendingUndo, clearUndo]);

  const xpPopStyle = useAnimatedStyle(() => ({
    opacity: xpPopOpacity.value,
    transform: [{ translateY: xpPopY.value }],
  }));

  const handleHabitPress = async (habitId: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { xpAwarded } = await logHabit(habitId, 'vit'); // TODO: use real class affinity

    if (xpAwarded > 0) {
      setXpPopText(`+${xpAwarded} XP`);
      xpPopY.value = 0;
      xpPopOpacity.value = 1;
      xpPopY.value = withSequence(
        withSpring(-40, { damping: 12 }),
        withTiming(-60, { duration: 400 }),
      );
      xpPopOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 600 }),
      );
    }
  };

  const handleUndo = async () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    await undoLog();
  };

  const isLoading = charLoading || habitsLoading;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  const completed = habits.filter((h) => h.completedToday).length;
  const total = habits.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{"Today's quests"}</Text>
        <Text style={styles.progress}>
          {completed}/{total} done
        </Text>
      </View>

      {/* XP Bar */}
      <View style={styles.xpContainer}>
        <XPBar
          level={level}
          xpPercent={xpPercent}
          xpIntoLevel={xpIntoLevel}
          xpNeededForLevel={xpNeededForLevel}
        />
        {/* XP pop animation */}
        <Animated.Text style={[styles.xpPop, xpPopStyle]}>{xpPopText}</Animated.Text>
      </View>

      {/* Habit list */}
      <FlatList
        data={habits}
        keyExtractor={(h) => String(h.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <HabitRow habit={item} onPress={() => handleHabitPress(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No habits yet. Add one! 👇</Text>
          </View>
        }
      />

      {/* Undo toast */}
      {pendingUndo && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.undoToast}>
          <Text style={styles.undoText}>Habit logged!</Text>
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.undoButton}>Undo</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* FAB — add habit */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-habit')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  progress: {
    fontSize: 14,
    color: '#888',
  },
  xpContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    position: 'relative',
  },
  xpPop: {
    position: 'absolute',
    right: 20,
    top: -10,
    fontSize: 16,
    fontWeight: '700',
    color: '#6c63ff',
  },
  list: {
    padding: 16,
    gap: 10,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  undoToast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  undoText: {
    color: '#fff',
    fontSize: 14,
  },
  undoButton: {
    color: '#b39ddb',
    fontWeight: '700',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6c63ff',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
  },
});
