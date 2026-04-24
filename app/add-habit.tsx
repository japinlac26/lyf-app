import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useHabitsStore } from '@/src/store/habitsStore';

const STAT_OPTIONS = [
  { value: 'str', label: 'STR — Fitness' },
  { value: 'int', label: 'INT — Focus / Learning' },
  { value: 'vit', label: 'VIT — Health / Self-care' },
  { value: 'dex', label: 'DEX — Craft / Precision' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', xp: 10, color: '#4caf50' },
  { value: 'medium', label: 'Medium', xp: 20, color: '#ff9800' },
  { value: 'hard', label: 'Hard', xp: 40, color: '#f44336' },
] as const;

const ICON_OPTIONS = ['⭐', '💪', '📖', '💧', '🎯', '🧘', '🛠️', '✍️', '😴', '🥦', '🚶', '🎸'];

export default function AddHabitScreen() {
  const addHabit = useHabitsStore((s) => s.addHabit);

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [statAffinity, setStatAffinity] = useState('vit');

  const canSave = title.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    await addHabit({
      title: title.trim(),
      description: null,
      icon,
      category: 'general',
      stat_affinity: statAffinity,
      difficulty,
      recurrence: 'daily',
      target_time_of_day: null,
      notify_enabled: 0,
      notify_time: null,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <Text style={styles.label}>Habit name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Walk 10 minutes"
          value={title}
          onChangeText={setTitle}
          autoFocus
          returnKeyType="done"
          maxLength={60}
        />

        {/* Icon picker */}
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICON_OPTIONS.map((em) => (
            <TouchableOpacity
              key={em}
              style={[styles.iconOption, icon === em && styles.iconSelected]}
              onPress={() => setIcon(em)}
            >
              <Text style={styles.iconText}>{em}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Difficulty */}
        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.row}>
          {DIFFICULTY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                difficulty === opt.value && { backgroundColor: opt.color, borderColor: opt.color },
              ]}
              onPress={() => setDifficulty(opt.value)}
            >
              <Text style={[styles.chipText, difficulty === opt.value && styles.chipTextSelected]}>
                {opt.label}
              </Text>
              <Text style={[styles.chipXp, difficulty === opt.value && styles.chipTextSelected]}>
                +{opt.xp} XP
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stat affinity */}
        <Text style={styles.label}>Stat type</Text>
        {STAT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.statRow, statAffinity === opt.value && styles.statRowSelected]}
            onPress={() => setStatAffinity(opt.value)}
          >
            <View style={[styles.radio, statAffinity === opt.value && styles.radioSelected]} />
            <Text style={styles.statLabel}>{opt.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveText}>Add Habit</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  content: {
    padding: 20,
    gap: 8,
    paddingBottom: 60,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  iconSelected: {
    borderColor: '#6c63ff',
    backgroundColor: '#ede7ff',
  },
  iconText: {
    fontSize: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  chipXp: {
    fontSize: 11,
    color: '#888',
  },
  chipTextSelected: {
    color: '#fff',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginBottom: 6,
  },
  statRowSelected: {
    borderColor: '#6c63ff',
    backgroundColor: '#ede7ff',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  radioSelected: {
    borderColor: '#6c63ff',
    backgroundColor: '#6c63ff',
  },
  statLabel: {
    fontSize: 14,
    color: '#1a1a2e',
  },
  saveButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#c5c1f5',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
