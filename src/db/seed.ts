/**
 * seed.ts — Starter habit templates inserted on first run.
 *
 * Each template is tied to a stat_affinity (str/int/vit/dex) so
 * class affinity XP bonuses apply naturally.
 * Templates are only inserted if the habits table is empty.
 */

import { getDb } from './schema';

interface HabitTemplate {
  title: string;
  description: string;
  icon: string;
  category: string;
  stat_affinity: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const HABIT_TEMPLATES: HabitTemplate[] = [
  // STR — Warrior / physical
  {
    title: 'Work out',
    description: 'Any form of exercise for 20+ minutes.',
    icon: '💪',
    category: 'fitness',
    stat_affinity: 'str',
    difficulty: 'medium',
  },
  {
    title: 'Walk 10 minutes',
    description: 'A short walk outside or on a treadmill.',
    icon: '🚶',
    category: 'fitness',
    stat_affinity: 'str',
    difficulty: 'easy',
  },
  {
    title: 'Stretch or mobility work',
    description: '10 minutes of stretching or yoga.',
    icon: '🧘',
    category: 'fitness',
    stat_affinity: 'str',
    difficulty: 'easy',
  },

  // INT — Scholar / focus
  {
    title: 'Deep work session',
    description: 'At least 25 minutes of focused, distraction-free work.',
    icon: '🎯',
    category: 'focus',
    stat_affinity: 'int',
    difficulty: 'hard',
  },
  {
    title: 'Read 10 pages',
    description: 'Any book — fiction, non-fiction, textbook.',
    icon: '📖',
    category: 'learning',
    stat_affinity: 'int',
    difficulty: 'easy',
  },
  {
    title: 'Review notes or study',
    description: 'Review what you learned today or study something new.',
    icon: '📝',
    category: 'learning',
    stat_affinity: 'int',
    difficulty: 'medium',
  },
  {
    title: 'No social media before noon',
    description: 'Keep your morning for deep work, not scrolling.',
    icon: '📵',
    category: 'focus',
    stat_affinity: 'int',
    difficulty: 'medium',
  },

  // VIT — Healer / health & self-care
  {
    title: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day.',
    icon: '💧',
    category: 'health',
    stat_affinity: 'vit',
    difficulty: 'easy',
  },
  {
    title: 'Sleep 7+ hours',
    description: 'Get to bed on time and sleep at least 7 hours.',
    icon: '😴',
    category: 'health',
    stat_affinity: 'vit',
    difficulty: 'medium',
  },
  {
    title: 'Eat a vegetable with every meal',
    description: 'Add some colour to each meal.',
    icon: '🥦',
    category: 'health',
    stat_affinity: 'vit',
    difficulty: 'easy',
  },
  {
    title: 'Take your supplements',
    description: 'Daily vitamins or prescribed medication.',
    icon: '💊',
    category: 'health',
    stat_affinity: 'vit',
    difficulty: 'easy',
  },

  // DEX — Ranger / Artificer / precision & craft
  {
    title: 'Work on a creative project',
    description: "Code, design, write, draw — anything you're building.",
    icon: '🛠️',
    category: 'craft',
    stat_affinity: 'dex',
    difficulty: 'hard',
  },
  {
    title: 'Practice a skill for 20 minutes',
    description: 'Deliberate practice on anything you want to improve.',
    icon: '🎸',
    category: 'craft',
    stat_affinity: 'dex',
    difficulty: 'medium',
  },
  {
    title: 'Journal for 5 minutes',
    description: 'Write anything — thoughts, goals, gratitude.',
    icon: '✍️',
    category: 'mindfulness',
    stat_affinity: 'dex',
    difficulty: 'easy',
  },
  {
    title: 'Meditate',
    description: 'At least 5 minutes of quiet, focused breathing.',
    icon: '🧘',
    category: 'mindfulness',
    stat_affinity: 'vit',
    difficulty: 'easy',
  },
];

export async function seedHabits(): Promise<void> {
  const db = await getDb();

  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habits',
  );
  if (existing && existing.count > 0) return; // already seeded

  for (const template of HABIT_TEMPLATES) {
    await db.runAsync(
      `INSERT INTO habits
        (title, description, icon, category, stat_affinity, difficulty, recurrence)
       VALUES (?, ?, ?, ?, ?, ?, 'daily')`,
      template.title,
      template.description,
      template.icon,
      template.category,
      template.stat_affinity,
      template.difficulty,
    );
  }
}
