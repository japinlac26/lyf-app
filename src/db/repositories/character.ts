/**
 * character.ts — Repository for reading and writing character data.
 * Only this file (and other repositories) may import from expo-sqlite.
 */

import { getDb } from '../schema';

export interface CharacterRow {
  id: number;
  user_id: number;
  level: number;
  xp: number;
  hp: number;
  max_hp: number;
  str: number;
  int_: number;
  vit: number;
  dex: number;
  equipped_head: number | null;
  equipped_body: number | null;
  equipped_weapon: number | null;
  equipped_pet: number | null;
  sprite_base: string;
}

export async function getCharacter(): Promise<CharacterRow> {
  const db = await getDb();
  const row = await db.getFirstAsync<CharacterRow>('SELECT * FROM characters WHERE id = 1');
  if (!row) throw new Error('Character row missing — was seed run?');
  return row;
}

export async function updateXp(xp: number, level: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE characters SET xp = ?, level = ? WHERE id = 1', xp, level);
}

export async function updateHp(hp: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE characters SET hp = ? WHERE id = 1', hp);
}

export async function equipItem(
  slot: 'equipped_head' | 'equipped_body' | 'equipped_weapon' | 'equipped_pet',
  itemId: number | null,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE characters SET ${slot} = ? WHERE id = 1`, itemId);
}
