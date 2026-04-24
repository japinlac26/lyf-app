/**
 * balance.ts — Single source of truth for every tunable number in the game.
 *
 * Rules:
 * - Never hardcode a game value anywhere else in the codebase.
 * - To tweak the feel of the game, change numbers here only.
 * - All difficulty-dependent values are parameterised by the Difficulty enum.
 */

// ---------------------------------------------------------------------------
// Difficulty
// ---------------------------------------------------------------------------

export enum Difficulty {
  Zen = 'zen',
  Standard = 'standard',
  Difficult = 'difficult',
  RealLife = 'real_life',
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.Zen]: 'Zen',
  [Difficulty.Standard]: 'Standard',
  [Difficulty.Difficult]: 'Difficult',
  [Difficulty.RealLife]: 'Real Life',
};

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  [Difficulty.Zen]: 'Relax and build habits at your own pace — no penalties, ever.',
  [Difficulty.Standard]: 'Miss a habit and your streak resets, but your character is safe.',
  [Difficulty.Difficult]: 'Miss a habit and your hero takes HP damage. Death means respawn.',
  [Difficulty.RealLife]: 'Miss a habit, take HP damage. Die and risk losing a level or an item.',
};

export const DEFAULT_DIFFICULTY = Difficulty.Standard;

// ---------------------------------------------------------------------------
// Levelling
// ---------------------------------------------------------------------------

/** XP required to go from level N to N+1 = N * XP_PER_LEVEL */
export const XP_PER_LEVEL = 100;

/** Maximum level a character can reach in v1 */
export const MAX_LEVEL = 50;

// ---------------------------------------------------------------------------
// Habit XP
// ---------------------------------------------------------------------------

export const HABIT_XP: Record<'easy' | 'medium' | 'hard', number> = {
  easy: 10,
  medium: 20,
  hard: 40,
};

/** Bonus XP multiplier when the habit matches the character's class stat (+25%) */
export const CLASS_AFFINITY_BONUS = 0.25;

// ---------------------------------------------------------------------------
// Streak bonuses
// ---------------------------------------------------------------------------

/** Extra XP multiplier per completed 7-day streak period */
export const STREAK_BONUS_PER_WEEK = 0.1;

/** Maximum streak bonus multiplier (capped at +50%) */
export const STREAK_BONUS_CAP = 0.5;

/** How many days constitute one streak "week" for bonus purposes */
export const STREAK_WEEK_LENGTH = 7;

// ---------------------------------------------------------------------------
// Loot
// ---------------------------------------------------------------------------

/** Base chance (0–1) of a loot drop on any habit completion */
export const LOOT_DROP_BASE_CHANCE = 0.15;

/** Extra drop chance per character level */
export const LOOT_DROP_CHANCE_PER_LEVEL = 0.01;

/** Maximum drop chance regardless of level */
export const LOOT_DROP_CHANCE_CAP = 0.4;

/** Rarity weights — must sum to 1 */
export const LOOT_RARITY_WEIGHTS = {
  common: 0.7,
  uncommon: 0.2,
  rare: 0.08,
  epic: 0.018,
  legendary: 0.002,
} as const;

export type LootRarity = keyof typeof LOOT_RARITY_WEIGHTS;

// ---------------------------------------------------------------------------
// HP & combat (Difficult / Real Life only)
// ---------------------------------------------------------------------------

export const MAX_HP: Record<Difficulty, number> = {
  [Difficulty.Zen]: 0, // HP not used in Zen
  [Difficulty.Standard]: 0, // HP not used in Standard
  [Difficulty.Difficult]: 100,
  [Difficulty.RealLife]: 100,
};

/** HP lost per missed habit per difficulty mode */
export const HP_DAMAGE_PER_MISS: Record<Difficulty, number> = {
  [Difficulty.Zen]: 0,
  [Difficulty.Standard]: 0,
  [Difficulty.Difficult]: 10,
  [Difficulty.RealLife]: 15,
};

/** In Real Life mode, chance (0–1) to lose a random unequipped item on death */
export const REAL_LIFE_ITEM_LOSS_CHANCE = 0.25;

// ---------------------------------------------------------------------------
// Perks
// ---------------------------------------------------------------------------

/** Character levels at which a new perk slot unlocks */
export const PERK_UNLOCK_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

/** Streak milestone days at which a perk unlocks */
export const PERK_UNLOCK_STREAK_DAYS = [7, 30, 100];

// ---------------------------------------------------------------------------
// Pets
// ---------------------------------------------------------------------------

/** Pet levels at which the pet evolves to the next stage */
export const PET_EVOLUTION_LEVELS = [10, 25];

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

/** Maximum number of habit reminders that can fire per day (default, user can lower) */
export const MAX_DAILY_NOTIFICATIONS = 3;

// ---------------------------------------------------------------------------
// Undo window
// ---------------------------------------------------------------------------

/** Milliseconds after logging a habit during which the user can undo */
export const HABIT_UNDO_WINDOW_MS = 10_000;
