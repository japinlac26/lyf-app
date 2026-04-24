import {
  calculateHabitXp,
  levelFromXp,
  lootDropChance,
  rollLootDrop,
  xpFraction,
  xpRequiredForLevel,
  xpToNextLevel,
  xpWithinLevel,
} from '../xp';
import {
  CLASS_AFFINITY_BONUS,
  LOOT_DROP_BASE_CHANCE,
  LOOT_DROP_CHANCE_CAP,
  MAX_LEVEL,
  XP_PER_LEVEL,
} from '../balance';

// ---------------------------------------------------------------------------
// xpRequiredForLevel
// ---------------------------------------------------------------------------

describe('xpRequiredForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
  });

  it('returns 0 for level 0 and below', () => {
    expect(xpRequiredForLevel(0)).toBe(0);
    expect(xpRequiredForLevel(-5)).toBe(0);
  });

  it('returns XP_PER_LEVEL for level 2', () => {
    expect(xpRequiredForLevel(2)).toBe(XP_PER_LEVEL); // 100
  });

  it('returns 300 for level 3', () => {
    expect(xpRequiredForLevel(3)).toBe(300); // 100 + 200
  });

  it('returns 600 for level 4', () => {
    expect(xpRequiredForLevel(4)).toBe(600); // 100 + 200 + 300
  });

  it('clamps to MAX_LEVEL', () => {
    expect(xpRequiredForLevel(MAX_LEVEL + 10)).toBe(xpRequiredForLevel(MAX_LEVEL));
  });
});

// ---------------------------------------------------------------------------
// xpToNextLevel
// ---------------------------------------------------------------------------

describe('xpToNextLevel', () => {
  it('costs level * XP_PER_LEVEL to advance', () => {
    expect(xpToNextLevel(1)).toBe(100);
    expect(xpToNextLevel(2)).toBe(200);
    expect(xpToNextLevel(10)).toBe(1000);
  });

  it('returns 0 at MAX_LEVEL (already capped)', () => {
    expect(xpToNextLevel(MAX_LEVEL)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// levelFromXp — round-trip consistency with xpRequiredForLevel
// ---------------------------------------------------------------------------

describe('levelFromXp', () => {
  it('returns 1 for 0 XP', () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it('returns 1 for negative XP', () => {
    expect(levelFromXp(-100)).toBe(1);
  });

  it('returns 2 when XP exactly meets level 2 threshold', () => {
    expect(levelFromXp(xpRequiredForLevel(2))).toBe(2);
  });

  it('returns 1 when 1 XP short of level 2', () => {
    expect(levelFromXp(xpRequiredForLevel(2) - 1)).toBe(1);
  });

  it('round-trips correctly for levels 1–MAX_LEVEL', () => {
    for (let level = 1; level <= MAX_LEVEL; level++) {
      expect(levelFromXp(xpRequiredForLevel(level))).toBe(level);
    }
  });

  it('never exceeds MAX_LEVEL', () => {
    expect(levelFromXp(999_999_999)).toBe(MAX_LEVEL);
  });
});

// ---------------------------------------------------------------------------
// xpWithinLevel
// ---------------------------------------------------------------------------

describe('xpWithinLevel', () => {
  it('returns 0 at the start of a new level', () => {
    expect(xpWithinLevel(xpRequiredForLevel(5))).toBe(0);
  });

  it('returns partial progress mid-level', () => {
    const startOfLevel5 = xpRequiredForLevel(5);
    expect(xpWithinLevel(startOfLevel5 + 50)).toBe(50);
  });

  it('returns 0 at MAX_LEVEL', () => {
    expect(xpWithinLevel(xpRequiredForLevel(MAX_LEVEL))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// xpFraction
// ---------------------------------------------------------------------------

describe('xpFraction', () => {
  it('returns 0 at the start of a level', () => {
    expect(xpFraction(xpRequiredForLevel(3))).toBe(0);
  });

  it('returns 0.5 at the halfway point of a level', () => {
    const start = xpRequiredForLevel(3);
    const cost = xpToNextLevel(3); // 300
    expect(xpFraction(start + cost / 2)).toBe(0.5);
  });

  it('returns 1 at MAX_LEVEL', () => {
    expect(xpFraction(xpRequiredForLevel(MAX_LEVEL))).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// calculateHabitXp
// ---------------------------------------------------------------------------

describe('calculateHabitXp', () => {
  it('returns baseXp with no streak and no affinity', () => {
    expect(calculateHabitXp(20, 0, false)).toBe(20);
  });

  it('applies class affinity bonus', () => {
    const result = calculateHabitXp(20, 0, true);
    expect(result).toBe(Math.round(20 * (1 + CLASS_AFFINITY_BONUS)));
  });

  it('applies streak bonus after 7 days', () => {
    // 1 week = +10%
    expect(calculateHabitXp(20, 7, false)).toBe(Math.round(20 * 1.1));
  });

  it('applies streak bonus after 14 days', () => {
    // 2 weeks = +20%
    expect(calculateHabitXp(20, 14, false)).toBe(Math.round(20 * 1.2));
  });

  it('caps streak bonus at 50%', () => {
    // 100 days = 14 weeks → would be +140%, capped at +50%
    expect(calculateHabitXp(20, 100, false)).toBe(Math.round(20 * 1.5));
  });

  it('stacks streak and affinity bonuses', () => {
    // 7-day streak (+10%) + affinity (+25%) = +35%
    expect(calculateHabitXp(20, 7, true)).toBe(Math.round(20 * 1.35));
  });

  it('caps combined bonuses at streak cap + affinity (not beyond)', () => {
    // Streak at cap (+50%) + affinity (+25%) = +75%
    expect(calculateHabitXp(20, 100, true)).toBe(Math.round(20 * 1.75));
  });
});

// ---------------------------------------------------------------------------
// lootDropChance
// ---------------------------------------------------------------------------

describe('lootDropChance', () => {
  it('returns base chance at level 1', () => {
    expect(lootDropChance(1)).toBeCloseTo(LOOT_DROP_BASE_CHANCE + 0.01);
  });

  it('increases with level', () => {
    expect(lootDropChance(10)).toBeGreaterThan(lootDropChance(1));
  });

  it('never exceeds the cap', () => {
    expect(lootDropChance(999)).toBe(LOOT_DROP_CHANCE_CAP);
  });
});

// ---------------------------------------------------------------------------
// rollLootDrop
// ---------------------------------------------------------------------------

describe('rollLootDrop', () => {
  it('returns null when random is above drop chance', () => {
    // Force random to always return 1 (no drop)
    expect(rollLootDrop(1, () => 1)).toBeNull();
  });

  it('returns a rarity when random is below drop chance', () => {
    // Force drop (first call = 0 → triggers drop), rarity roll = 0 → common
    const calls = [0, 0];
    let i = 0;
    const result = rollLootDrop(1, () => calls[i++] ?? 0);
    expect(result).toBe('common');
  });

  it('rolls legendary when rarity roll is above 0.998', () => {
    const calls = [0, 0.999]; // drop triggers, rarity = 0.999
    let i = 0;
    const result = rollLootDrop(1, () => calls[i++] ?? 0);
    expect(result).toBe('legendary');
  });

  it('distribution roughly matches weights over many rolls', () => {
    const counts: Record<string, number> = {};
    const trials = 10_000;
    let i = 0;

    // Always trigger a drop, vary rarity roll
    const pseudoRandom = () => {
      // First call per roll: 0 (always drops), second: incremental
      const isDropCheck = i % 2 === 0;
      i++;
      return isDropCheck ? 0 : (i / (trials * 2)) % 1;
    };

    for (let t = 0; t < trials; t++) {
      const rarity = rollLootDrop(1, pseudoRandom);
      if (rarity) counts[rarity] = (counts[rarity] ?? 0) + 1;
    }

    // Common should be the most frequent
    const rarities = Object.keys(counts);
    expect(rarities).toContain('common');
    expect(counts['common']).toBeGreaterThan(counts['uncommon'] ?? 0);
  });
});
