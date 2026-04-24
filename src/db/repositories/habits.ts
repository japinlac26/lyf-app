/**
 * habits.ts — Repository for habits and habit_logs.
 * Only this file (and other repositories) may import from expo-sqlite.
 */

import { getDb } from '../schema';

export interface HabitRow {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  icon: string;
  category: string;
  stat_affinity: string;
  difficulty: 'easy' | 'medium' | 'hard';
  recurrence: string;
  target_time_of_day: string | null;
  notify_enabled: number;
  notify_time: string | null;
  created_at: string;
  archived_at: string | null;
}

export interface HabitLogRow {
  id: number;
  habit_id: number;
  completed_at: string;
  xp_awarded: number;
  loot_dropped_id: number | null;
  notes: string | null;
}

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

export async function getActiveHabits(): Promise<HabitRow[]> {
  const db = await getDb();
  return db.getAllAsync<HabitRow>(
    'SELECT * FROM habits WHERE archived_at IS NULL ORDER BY created_at ASC',
  );
}

export async function createHabit(
  data: Omit<HabitRow, 'id' | 'user_id' | 'created_at' | 'archived_at'>,
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO habits
      (title, description, icon, category, stat_affinity, difficulty, recurrence,
       target_time_of_day, notify_enabled, notify_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.title,
    data.description ?? null,
    data.icon,
    data.category,
    data.stat_affinity,
    data.difficulty,
    data.recurrence,
    data.target_time_of_day ?? null,
    data.notify_enabled,
    data.notify_time ?? null,
  );
  return result.lastInsertRowId;
}

export async function archiveHabit(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE habits SET archived_at = datetime('now') WHERE id = ?", id);
}

// ---------------------------------------------------------------------------
// Habit logs
// ---------------------------------------------------------------------------

/** Returns all logs for a habit on a given calendar date (YYYY-MM-DD) */
export async function getLogsForDate(habitId: number, date: string): Promise<HabitLogRow[]> {
  const db = await getDb();
  return db.getAllAsync<HabitLogRow>(
    'SELECT * FROM habit_logs WHERE habit_id = ? AND date(completed_at) = date(?)',
    habitId,
    date,
  );
}

/** Returns all logs for today for every habit (used by home screen) */
export async function getTodayLogs(): Promise<HabitLogRow[]> {
  const db = await getDb();
  return db.getAllAsync<HabitLogRow>(
    "SELECT * FROM habit_logs WHERE date(completed_at) = date('now')",
  );
}

export async function logHabit(
  habitId: number,
  xpAwarded: number,
  lootDroppedId?: number,
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO habit_logs (habit_id, xp_awarded, loot_dropped_id) VALUES (?, ?, ?)',
    habitId,
    xpAwarded,
    lootDroppedId ?? null,
  );
  return result.lastInsertRowId;
}

export async function deleteLog(logId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM habit_logs WHERE id = ?', logId);
}

/** Returns the current streak in days for a habit (consecutive days with at least one log) */
export async function getStreak(habitId: number): Promise<number> {
  const db = await getDb();

  // Walk backwards day by day from yesterday until a gap is found
  // (today's log may not be complete yet, so we don't count it in the streak)
  const rows = await db.getAllAsync<{ day: string }>(
    `SELECT DISTINCT date(completed_at) as day
     FROM habit_logs
     WHERE habit_id = ?
     ORDER BY day DESC`,
    habitId,
  );

  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < rows.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);

    if (rows[i].day === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
