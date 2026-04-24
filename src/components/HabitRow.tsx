import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { HabitWithState } from '../store/habitsStore';

interface HabitRowProps {
  habit: HabitWithState;
  onPress: () => void;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#4caf50',
  medium: '#ff9800',
  hard: '#f44336',
};

export function HabitRow({ habit, onPress }: HabitRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (habit.completedToday) return;
    scale.value = withSequence(withSpring(0.93), withSpring(1));
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.row, habit.completedToday && styles.completed]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.checkbox}>
          {habit.completedToday && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <Text style={styles.icon}>{habit.icon}</Text>

        <View style={styles.info}>
          <Text style={[styles.title, habit.completedToday && styles.titleDone]}>
            {habit.title}
          </Text>
          {habit.streakDays > 0 && (
            <Text style={styles.streak}>🔥 {habit.streakDays} day streak</Text>
          )}
        </View>

        <View
          style={[styles.dot, { backgroundColor: DIFFICULTY_COLOR[habit.difficulty] ?? '#999' }]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  completed: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#6c63ff',
    fontWeight: '700',
    fontSize: 14,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  streak: {
    fontSize: 11,
    color: '#ff7043',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
