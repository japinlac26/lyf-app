/**
 * characterStore.ts — Zustand store for character state (level, XP, HP).
 *
 * The store is the single source of truth during a session.
 * It loads from SQLite on boot and writes back after every mutation.
 */

import { create } from 'zustand';
import { getCharacter, updateHp, updateXp } from '../db/repositories/character';
import { levelFromXp, xpFraction, xpToNextLevel, xpWithinLevel } from '../game/xp';

interface CharacterState {
  // Persisted
  level: number;
  totalXp: number;
  hp: number;
  maxHp: number;
  str: number;
  int_: number;
  vit: number;
  dex: number;
  spriteBase: string;

  // Derived (computed on load/update)
  xpIntoLevel: number;
  xpNeededForLevel: number;
  xpPercent: number; // 0–1 for XP bar

  // UI state
  isLoading: boolean;
  pendingLevelUp: boolean; // triggers level-up modal

  // Actions
  load: () => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  takeDamage: (amount: number) => Promise<void>;
  acknowledgeLevelUp: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  level: 1,
  totalXp: 0,
  hp: 100,
  maxHp: 100,
  str: 5,
  int_: 5,
  vit: 5,
  dex: 5,
  spriteBase: 'default',
  xpIntoLevel: 0,
  xpNeededForLevel: 100,
  xpPercent: 0,
  isLoading: true,
  pendingLevelUp: false,

  load: async () => {
    const row = await getCharacter();
    const level = levelFromXp(row.xp);
    set({
      level,
      totalXp: row.xp,
      hp: row.hp,
      maxHp: row.max_hp,
      str: row.str,
      int_: row.int_,
      vit: row.vit,
      dex: row.dex,
      spriteBase: row.sprite_base,
      xpIntoLevel: xpWithinLevel(row.xp),
      xpNeededForLevel: xpToNextLevel(level),
      xpPercent: xpFraction(row.xp),
      isLoading: false,
    });
  },

  addXp: async (amount: number) => {
    const { totalXp, level } = get();
    const newTotalXp = totalXp + amount;
    const newLevel = levelFromXp(newTotalXp);
    const didLevelUp = newLevel > level;

    await updateXp(newTotalXp, newLevel);

    set({
      totalXp: newTotalXp,
      level: newLevel,
      xpIntoLevel: xpWithinLevel(newTotalXp),
      xpNeededForLevel: xpToNextLevel(newLevel),
      xpPercent: xpFraction(newTotalXp),
      pendingLevelUp: didLevelUp,
    });
  },

  takeDamage: async (amount: number) => {
    const { hp } = get();
    const newHp = Math.max(0, hp - amount);
    await updateHp(newHp);
    set({ hp: newHp });
  },

  acknowledgeLevelUp: () => set({ pendingLevelUp: false }),
}));
