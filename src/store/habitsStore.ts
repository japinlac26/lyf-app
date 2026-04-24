/**
 * habitsStore.ts — Zustand store for habits and today's completion state.
 */

import { create } from 'zustand';
import {
  HabitRow,
  archiveHabit,
  createHabit,
  deleteLog,
  getActiveHabits,
  getStreak,
  getTodayLogs,
  logHabit,
} from '../db/repositories/habits';
import { HABIT_XP } from '../game/balance';
import { calculateHabitXp } from '../game/xp';
import { useCharacterStore } from './characterStore';

export interface HabitWithState extends HabitRow {
  completedToday: boolean;
  logIdToday: number | null;
  streakDays: number;
}

interface HabitsState {
  habits: HabitWithState[];
  isLoading: boolean;

  // Undo state
  pendingUndo: { logId: number; habitId: number; xpAwarded: number } | null;

  // Actions
  load: () => Promise<void>;
  logHabit: (habitId: number, classAffinity: string) => Promise<{ xpAwarded: number }>;
  undoLog: () => Promise<void>;
  clearUndo: () => void;
  addHabit: (
    data: Omit<HabitRow, 'id' | 'user_id' | 'created_at' | 'archived_at'>,
  ) => Promise<void>;
  removeHabit: (id: number) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  isLoading: true,
  pendingUndo: null,

  load: async () => {
    const [rows, todayLogs] = await Promise.all([getActiveHabits(), getTodayLogs()]);

    const logMap = new Map<number, number>(); // habitId → logId
    for (const log of todayLogs) {
      logMap.set(log.habit_id, log.id);
    }

    const habits = await Promise.all(
      rows.map(async (row) => {
        const streakDays = await getStreak(row.id);
        return {
          ...row,
          completedToday: logMap.has(row.id),
          logIdToday: logMap.get(row.id) ?? null,
          streakDays,
        };
      }),
    );

    set({ habits, isLoading: false });
  },

  logHabit: async (habitId: number, classAffinity: string) => {
    const { habits } = get();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit || habit.completedToday) return { xpAwarded: 0 };

    const baseXp = HABIT_XP[habit.difficulty];
    const hasAffinity = habit.stat_affinity === classAffinity;
    const xpAwarded = calculateHabitXp(baseXp, habit.streakDays, hasAffinity);

    const logId = await logHabit(habitId, xpAwarded);

    // Optimistic UI update
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId
          ? { ...h, completedToday: true, logIdToday: logId, streakDays: h.streakDays + 1 }
          : h,
      ),
      pendingUndo: { logId, habitId, xpAwarded },
    }));

    // Award XP to character
    await useCharacterStore.getState().addXp(xpAwarded);

    return { xpAwarded };
  },

  undoLog: async () => {
    const { pendingUndo } = get();
    if (!pendingUndo) return;

    const { logId, habitId, xpAwarded } = pendingUndo;
    await deleteLog(logId);

    // Reverse the XP (subtract)
    await useCharacterStore.getState().addXp(-xpAwarded);

    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completedToday: false,
              logIdToday: null,
              streakDays: Math.max(0, h.streakDays - 1),
            }
          : h,
      ),
      pendingUndo: null,
    }));
  },

  clearUndo: () => set({ pendingUndo: null }),

  addHabit: async (data) => {
    const id = await createHabit(data);
    const newHabit: HabitWithState = {
      ...data,
      id,
      user_id: 1,
      created_at: new Date().toISOString(),
      archived_at: null,
      completedToday: false,
      logIdToday: null,
      streakDays: 0,
    };
    set((state) => ({ habits: [...state.habits, newHabit] }));
  },

  removeHabit: async (id: number) => {
    await archiveHabit(id);
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
  },
}));
