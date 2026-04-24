/**
 * xp.ts — Pure XP and levelling math.
 *
 * No React, no database, no side effects.
 * Every function here must be unit-tested in __tests__/xp.test.ts.
 */

import {
  CLASS_AFFINITY_BONUS,
  MAX_LEVEL,
  STREAK_BONUS_CAP,
  STREAK_BONUS_PER_WEEK,
  STREAK_WEEK_LENGTH,
  XP_PER_LEVEL,
  LOOT_DROP_BASE_CHANCE,
  LOOT_DROP_CHANCE_CAP,
  LOOT_DROP_CHANCE_PER_LEVEL,
  LOOT_RARITY_WEIGHTS,
  LootRarity,
} from './balance';

// ---------------------------------------------------------------------------
// Loot drop
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Level curve
// ---------------------------------------------------------------------------

/**
 * Total XP required to reach a given level from level 1.
 * Level 1 requires 0 XP (starting level).
 * Level 2 requires 100 XP, level 3 requires 300 XP, etc.
 * Formula: sum of (n * XP_PER_LEVEL) for n = 1..level-1
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  const clamped = Math.min(level, MAX_LEVEL);
  // Sum of 1..n = n*(n+1)/2, offset by 1
  const n = clamped - 1;
  return ((n * (n + 1)) / 2) * XP_PER_LEVEL;
}

/**
 * XP needed to advance from the current level to the next.
 * e.g. level 1 → 2 costs 100 XP, level 2 → 3 costs 200 XP.
 */
export function xpToNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return 0;
  return level * XP_PER_LEVEL;
}

/**
 * Derives the character's level from their total accumulated XP.
 * Always returns a value between 1 and MAX_LEVEL.
 */
export function levelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  // Solve xpRequiredForLevel(level) <= totalXp for max level
  // xpRequiredForLevel(L) = (L-1)*L/2 * XP_PER_LEVEL
  // Rearranging: L^2 - L - 2*totalXp/XP_PER_LEVEL = 0
  const discriminant = 1 + (8 * totalXp) / XP_PER_LEVEL;
  const level = Math.floor((1 + Math.sqrt(discriminant)) / 2);
  return Math.min(Math.max(level, 1), MAX_LEVEL);
}

/**
 * XP progress within the current level (0 to xpToNextLevel).
 * Useful for rendering the XP bar.
 */
export function xpWithinLevel(totalXp: number): number {
  const level = levelFromXp(totalXp);
  if (level >= MAX_LEVEL) return 0;
  return totalXp - xpRequiredForLevel(level);
}

/**
 * XP progress as a fraction 0–1 for the current level.
 * Returns 1 when at MAX_LEVEL.
 */
export function xpFraction(totalXp: number): number {
  const level = levelFromXp(totalXp);
  if (level >= MAX_LEVEL) return 1;
  return xpWithinLevel(totalXp) / xpToNextLevel(level);
}

// ---------------------------------------------------------------------------
// XP calculation for a habit log
// ---------------------------------------------------------------------------

/**
 * Calculates the XP awarded for completing a habit.
 *
 * @param baseXp       - The habit's base XP value (from balance.ts HABIT_XP)
 * @param streakDays   - Current streak length in days
 * @param hasAffinity  - Whether the habit matches the character's class stat
 */
export function calculateHabitXp(baseXp: number, streakDays: number, hasAffinity: boolean): number {
  const streakWeeks = Math.floor(streakDays / STREAK_WEEK_LENGTH);
  const streakMultiplier = Math.min(streakWeeks * STREAK_BONUS_PER_WEEK, STREAK_BONUS_CAP);
  const affinityMultiplier = hasAffinity ? CLASS_AFFINITY_BONUS : 0;

  const total = baseXp * (1 + streakMultiplier + affinityMultiplier);
  return Math.round(total);
}

/**
 * Calculates the loot drop chance for a given character level.
 */
export function lootDropChance(level: number): number {
  return Math.min(LOOT_DROP_BASE_CHANCE + level * LOOT_DROP_CHANCE_PER_LEVEL, LOOT_DROP_CHANCE_CAP);
}

/**
 * Rolls for a loot drop. Returns the rarity if a drop occurs, or null.
 * Pass a seeded random function in tests for determinism.
 */
export function rollLootDrop(level: number, random: () => number = Math.random): LootRarity | null {
  if (random() > lootDropChance(level)) return null;

  const roll = random();
  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(LOOT_RARITY_WEIGHTS) as [LootRarity, number][]) {
    cumulative += weight;
    if (roll < cumulative) return rarity;
  }
  return 'common'; // fallback
}
