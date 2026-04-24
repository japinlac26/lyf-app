/**
 * notifications.ts — Local notification helpers.
 *
 * Rules (from CLAUDE.md):
 * - Max 3 notifications per day by default
 * - Always easy to disable per habit
 * - No shame copy — gentle reminders only
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { MAX_DAILY_NOTIFICATIONS } from '../game/balance';

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ---------------------------------------------------------------------------
// Schedule a daily reminder for a habit
// ---------------------------------------------------------------------------

/**
 * Schedules a daily local notification for a habit.
 * Returns the notification identifier so it can be cancelled later.
 *
 * @param habitId   - Used to tag the notification for later cancellation
 * @param title     - Habit title shown in the notification
 * @param hour      - Hour of day (0–23) to fire
 * @param minute    - Minute (0–59) to fire
 */
export async function scheduleHabitReminder(
  habitId: number,
  title: string,
  hour: number,
  minute: number,
): Promise<string> {
  // Cancel any existing notification for this habit first
  await cancelHabitReminder(habitId);

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: notificationId(habitId),
    content: {
      title: 'Your hero misses you 🗡️',
      body: `Time to log: ${title}`,
      data: { habitId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return identifier;
}

export async function cancelHabitReminder(habitId: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId(habitId));
}

function notificationId(habitId: number): string {
  return `habit-${habitId}`;
}

// ---------------------------------------------------------------------------
// Setup notification handler (call once at app startup)
// ---------------------------------------------------------------------------

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Re-export the cap so callers can reference it
export { MAX_DAILY_NOTIFICATIONS };
