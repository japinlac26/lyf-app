/**
 * schema.ts — SQLite schema definitions and migration runner.
 *
 * Rules:
 * - Never edit an existing migration. Always add a new one.
 * - Migrations run in order and are tracked in the `migrations` meta-table.
 * - Only this file and repositories/ touch expo-sqlite directly.
 */

import * as SQLite from 'expo-sqlite';

export type DB = SQLite.SQLiteDatabase;

// ---------------------------------------------------------------------------
// Migration definitions
// ---------------------------------------------------------------------------

interface Migration {
  version: number;
  up: string[];
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: [
      // Meta table — tracks which migrations have run
      `CREATE TABLE IF NOT EXISTS migrations (
        version   INTEGER PRIMARY KEY,
        run_at    TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

      // Single user row for v1 (no auth)
      `CREATE TABLE IF NOT EXISTS users (
        id                    INTEGER PRIMARY KEY DEFAULT 1,
        display_name          TEXT NOT NULL DEFAULT 'Hero',
        class_id              TEXT NOT NULL DEFAULT 'warrior',
        difficulty            TEXT NOT NULL DEFAULT 'standard',
        sound_enabled         INTEGER NOT NULL DEFAULT 1,
        haptics_enabled       INTEGER NOT NULL DEFAULT 1,
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        created_at            TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

      // Character stats & equipment
      `CREATE TABLE IF NOT EXISTS characters (
        id               INTEGER PRIMARY KEY DEFAULT 1,
        user_id          INTEGER NOT NULL DEFAULT 1 REFERENCES users(id),
        level            INTEGER NOT NULL DEFAULT 1,
        xp               INTEGER NOT NULL DEFAULT 0,
        hp               INTEGER NOT NULL DEFAULT 100,
        max_hp           INTEGER NOT NULL DEFAULT 100,
        str              INTEGER NOT NULL DEFAULT 5,
        int_             INTEGER NOT NULL DEFAULT 5,
        vit              INTEGER NOT NULL DEFAULT 5,
        dex              INTEGER NOT NULL DEFAULT 5,
        equipped_head    INTEGER REFERENCES loot_items(id),
        equipped_body    INTEGER REFERENCES loot_items(id),
        equipped_weapon  INTEGER REFERENCES loot_items(id),
        equipped_pet     INTEGER REFERENCES loot_items(id),
        sprite_base      TEXT NOT NULL DEFAULT 'default'
      )`,

      // Habits
      `CREATE TABLE IF NOT EXISTS habits (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id               INTEGER NOT NULL DEFAULT 1 REFERENCES users(id),
        title                 TEXT NOT NULL,
        description           TEXT,
        icon                  TEXT NOT NULL DEFAULT '⭐',
        category              TEXT NOT NULL DEFAULT 'general',
        stat_affinity         TEXT NOT NULL DEFAULT 'vit',
        difficulty            TEXT NOT NULL DEFAULT 'medium',
        recurrence            TEXT NOT NULL DEFAULT 'daily',
        target_time_of_day    TEXT,
        notify_enabled        INTEGER NOT NULL DEFAULT 0,
        notify_time           TEXT,
        created_at            TEXT NOT NULL DEFAULT (datetime('now')),
        archived_at           TEXT
      )`,

      // Habit completion logs
      `CREATE TABLE IF NOT EXISTS habit_logs (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id         INTEGER NOT NULL REFERENCES habits(id),
        completed_at     TEXT NOT NULL DEFAULT (datetime('now')),
        xp_awarded       INTEGER NOT NULL DEFAULT 0,
        loot_dropped_id  INTEGER REFERENCES loot_items(id),
        notes            TEXT
      )`,

      // Loot item definitions (shared catalogue)
      `CREATE TABLE IF NOT EXISTS loot_items (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        name             TEXT NOT NULL,
        rarity           TEXT NOT NULL DEFAULT 'common',
        slot             TEXT NOT NULL DEFAULT 'cosmetic',
        sprite_key       TEXT NOT NULL DEFAULT 'placeholder',
        class_restriction TEXT,
        flavor_text      TEXT
      )`,

      // User's inventory
      `CREATE TABLE IF NOT EXISTS inventory (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       INTEGER NOT NULL DEFAULT 1 REFERENCES users(id),
        loot_item_id  INTEGER NOT NULL REFERENCES loot_items(id),
        source        TEXT NOT NULL DEFAULT 'loot',
        acquired_at   TEXT NOT NULL DEFAULT (datetime('now')),
        equipped      INTEGER NOT NULL DEFAULT 0
      )`,

      // Quest definitions and state
      `CREATE TABLE IF NOT EXISTS quests (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        type          TEXT NOT NULL DEFAULT 'daily',
        title         TEXT NOT NULL,
        description   TEXT,
        criteria_json TEXT NOT NULL DEFAULT '{}',
        rewards_json  TEXT NOT NULL DEFAULT '{}',
        status        TEXT NOT NULL DEFAULT 'available',
        class_id      TEXT,
        started_at    TEXT,
        completed_at  TEXT
      )`,

      // Perk definitions and unlock state
      `CREATE TABLE IF NOT EXISTS perks (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL,
        description  TEXT,
        trigger_json TEXT NOT NULL DEFAULT '{}',
        effect_json  TEXT NOT NULL DEFAULT '{}',
        class_id     TEXT,
        unlocked_at  TEXT
      )`,

      // Pets
      `CREATE TABLE IF NOT EXISTS pets (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER NOT NULL DEFAULT 1 REFERENCES users(id),
        species         TEXT NOT NULL,
        level           INTEGER NOT NULL DEFAULT 1,
        xp              INTEGER NOT NULL DEFAULT 0,
        evolution_stage INTEGER NOT NULL DEFAULT 0,
        nickname        TEXT
      )`,

      // Seed the single default user and character rows
      `INSERT OR IGNORE INTO users (id) VALUES (1)`,
      `INSERT OR IGNORE INTO characters (id, user_id) VALUES (1, 1)`,
    ],
  },
];

// ---------------------------------------------------------------------------
// Migration runner
// ---------------------------------------------------------------------------

export async function runMigrations(db: DB): Promise<void> {
  // Ensure the migrations meta-table exists first
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      run_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  );

  const applied = await db.getAllAsync<{ version: number }>('SELECT version FROM migrations');
  const appliedVersions = new Set(applied.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (appliedVersions.has(migration.version)) continue;

    await db.withTransactionAsync(async () => {
      for (const statement of migration.up) {
        await db.execAsync(statement);
      }
      await db.runAsync('INSERT INTO migrations (version) VALUES (?)', migration.version);
    });
  }
}

// ---------------------------------------------------------------------------
// Database singleton
// ---------------------------------------------------------------------------

let _db: DB | null = null;

export async function getDb(): Promise<DB> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('lyf.db');
  await runMigrations(_db);
  return _db;
}
