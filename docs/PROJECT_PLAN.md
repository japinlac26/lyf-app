# Lyf — Project Plan for Claude Code

> **Name:** Lyf
> **One-liner:** A pixel-art MMORPG where your real-life habits level up your character, unlock gear, and evolve a class based on your actual job.
> **Target launch:** App Store + Google Play, ASAP (target: public beta in 10–12 weeks, launch in 14–16 weeks)

---

## 1. How to use this document

This file is the north star. Claude Code should treat it as the source of truth for scope, priorities, and architecture decisions. When anything is ambiguous, default to these rules:

1. **Ship the core loop first.** Habit → XP → Level → Unlock. Everything else is gravy.
2. **Solo experience only for v1.** No social, no guilds, no leaderboards. (Hooks can exist in the data model, but no UI.)
3. **Pixel art, but cheap and consistent.** Use a single limited palette + a defined sprite grid. No per-feature art splurges.
4. **Free with cosmetic IAP.** Never paywall a core mechanic. Never paywall a difficulty setting.
5. **Every feature must be testable on a real phone within the same day it's coded.**

---

## 2. Product vision (the pitch)

Imagine Habitica met Stardew Valley. You wake up, drink water (+3 HP, +5 XP), walk for 15 minutes (+10 XP, chance of Common Loot), and finish a deep work session (+20 XP for your Scholar class). You hit level 12, your Scholar unlocks the "Flow State" perk (2x XP on focus habits from 9–11am), and a common pixel-art satchel drops into your inventory.

The magic is that **your class reflects your actual life**. A nurse picks the Healer class. A developer picks the Artificer. A teacher picks the Sage. The class doesn't just reskin the UI — it biases which habits give bonus XP, what loot drops, and which perks unlock. The app becomes a mirror of who you're trying to become.

### Design pillars (in priority order)

1. **Respect the user's time.** Logging a habit is one tap. No ceremony.
2. **Reward consistency over intensity.** Streaks and daily completion matter more than big single-day wins.
3. **Progress is always visible.** XP bars, level-ups, and loot drops happen with delightful juice (animations, sounds, haptics).
4. **Failure is optional.** Difficulty is a user setting, not a designer decision.
5. **The game serves the habit, not the other way around.** If a game mechanic makes people feel bad about missing, kill it.

---

## 3. MVP scope (v1.0 — the launch build)

### ✅ In scope for v1

- **Onboarding:** pick name, class, starting appearance, 3 starter habits
- **Character:** sprite, class, level, XP bar, HP, stats (STR/INT/VIT/DEX — mapped to habit categories)
- **Classes (6 to start):** Warrior (fitness), Scholar (focus/study), Healer (health/self-care), Artificer (creative/maker), Sage (mindfulness), Ranger (outdoors/nature). Each job-flavored so users can map real professions onto them (dev = Artificer, nurse = Healer, etc.).
- **Habits:** pre-made templates + fully custom. Daily recurrence only for v1 (weekly/custom intervals = v1.1).
- **Habit logging:** one-tap complete, undo within 10 seconds, optional quick-notes
- **XP & leveling:** standard RPG curve (level N → N+1 requires N × 100 XP, tunable)
- **Loot drops:** 5 rarity tiers (Common/Uncommon/Rare/Epic/Legendary), cosmetic-only for v1 (hats, capes, weapons that show on sprite)
- **Inventory & equip screen:** grid of items, tap to equip/unequip
- **Quests:** 3 types — Daily (complete N habits today), Weekly (7-day streak on habit X), Story (long-arc class-specific quests that unlock perks)
- **Perks:** passive bonuses unlocked at milestones (level 5, 10, 15, 20, 25, streak 7/30/100)
- **Pet/companion:** one starter pet per class, gains XP alongside you, evolves at level 10/25/50
- **Difficulty:** four tiers — Zen (no punishment), Standard (streak breaks, no XP loss), Difficult (miss a day = HP damage), Real Life (miss a day = HP damage + possible item loss + level regression on death). Default: Standard.
- **Notifications:** local (no server needed), user-configurable per habit
- **Settings:** sounds, haptics, notifications, difficulty, data export, account deletion
- **Offline-first:** full functionality without internet; cloud sync is v1.1

### ❌ Out of scope for v1 (parking lot)

Guilds, friends, parties, chat, PvP, leaderboards, trading, multiplayer world, in-game currency (beyond loot), real-money IAP (v1.1), Apple Watch/Wear OS, widgets (v1.1), dark mode for the game screen (menus will have it), voice input, AI coaching, integrations (Apple Health, Google Fit, calendar).

### Why this scope

Cutting social from v1 saves us an entire backend. The app can run with just on-device storage + a tiny optional sync layer. This is the difference between launching in 14 weeks vs. 8 months.

---

## 4. Tech stack

| Layer                | Choice                                                                 | Reason                                            |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| App framework        | **Expo (React Native)**                                                | Cross-platform, OTA updates, fast iteration       |
| Language             | TypeScript (strict mode)                                               | Non-negotiable for a codebase this size           |
| State                | **Zustand** + React Query for any server calls                         | Simple, less boilerplate than Redux               |
| Local DB             | **SQLite via `expo-sqlite`** + a thin repository layer                 | Reliable, queryable, survives app updates         |
| Storage for settings | `expo-secure-store` (sensitive) + `AsyncStorage` (preferences)         | Standard Expo patterns                            |
| Navigation           | **Expo Router** (file-based)                                           | Modern standard, less config                      |
| Animations           | **Reanimated 3** + **Moti** for declarative juice                      | Native-thread animations, critical for game feel  |
| Haptics              | `expo-haptics`                                                         | One-liner for tactile feedback                    |
| Audio                | `expo-audio`                                                           | Level-up sounds, loot drop jingles                |
| Notifications        | `expo-notifications` (local only for v1)                               | No server needed                                  |
| Icons / sprites      | Static PNG sprite sheets, rendered via a custom `<Sprite />` component | Pixel art renders crisp this way                  |
| Testing              | Jest + React Native Testing Library; Detox for a handful of E2E flows  | Don't over-invest in E2E early                    |
| Analytics            | **PostHog** (self-hostable, free tier generous)                        | Product analytics + feature flags in one          |
| Crash reporting      | **Sentry**                                                             | Industry standard, free tier covers indie scale   |
| Backend (v1.1+)      | **Supabase** when we add cloud sync                                    | Postgres + auth + storage in one, lowest friction |

### What we're explicitly NOT using

- Redux (overkill)
- GraphQL (no backend for v1)
- Firebase (Supabase is simpler and not owned by a hyperscaler)
- A custom game engine (React Native + Reanimated is enough; no need for Unity/Phaser)

---

## 5. Architecture

### Folder structure

```
habitquest/
├── app/                         # Expo Router screens (file-based routing)
│   ├── (onboarding)/
│   ├── (tabs)/                  # Main app tabs: home, habits, character, quests, settings
│   └── _layout.tsx
├── src/
│   ├── components/              # Reusable UI (Button, Card, Sprite, XPBar, etc.)
│   ├── features/                # Feature-sliced logic
│   │   ├── habits/              # Habit CRUD, logging, scheduling
│   │   ├── character/           # Stats, level, equipment, class perks
│   │   ├── quests/              # Quest engine, rewards
│   │   ├── loot/                # Drop tables, rarity roll, inventory
│   │   ├── pets/                # Pet state, evolution
│   │   └── onboarding/
│   ├── game/                    # Pure game logic (no UI, no side effects)
│   │   ├── xp.ts                # Level curves, XP math
│   │   ├── loot-tables.ts       # Rarity tables per class/level
│   │   ├── perks.ts             # Perk definitions, triggers
│   │   ├── classes.ts           # Class definitions, stat biases
│   │   └── __tests__/           # Heavy unit test coverage here — this is the heart of the game
│   ├── db/
│   │   ├── schema.ts            # SQLite schema + migrations
│   │   ├── repositories/        # One per domain (habits, character, loot, quests)
│   │   └── seed.ts              # Starter habits, classes, perks
│   ├── store/                   # Zustand stores
│   ├── theme/                   # Colors, typography, spacing, pixel grid constants
│   ├── assets/
│   │   ├── sprites/             # Character, equipment, pets, enemies (decorative)
│   │   ├── audio/
│   │   └── fonts/
│   └── utils/
├── assets/                      # Expo-managed static assets
├── docs/
│   ├── PROJECT_PLAN.md          # This file
│   ├── GAME_DESIGN.md           # XP curves, loot tables, perks (living doc)
│   └── DECISIONS.md             # ADRs — every non-obvious decision gets a line
└── __tests__/
```

### Key architectural rules

- **`src/game/` is pure.** No React, no imports from `src/features/`, no database. Just math and rules. This is what we unit-test to 90%+ coverage. Everything else is a thin shell around it.
- **Repositories are the only thing that touches SQLite.** Features call repositories, not the database directly. Easier to swap to Supabase later.
- **Features don't import from other features.** Cross-feature logic lives in `src/game/` or in a shared store.
- **Every screen is dumb.** Screens read from stores and dispatch actions. Logic lives in hooks or game modules.

---

## 6. Data model (v1)

Conceptual — actual schema lives in `src/db/schema.ts`.

```
users                    -- single row for v1 (no auth yet)
  id, display_name, class_id, created_at, difficulty,
  sound_enabled, haptics_enabled, notifications_enabled

characters
  id, user_id, level, xp, hp, max_hp,
  str, int_, vit, dex,                    -- stats
  equipped_head, equipped_body, equipped_weapon, equipped_pet,
  sprite_base                              -- base character sprite variant

classes
  id, name, description, stat_bias_json, perk_list_json, starter_pet_id

habits
  id, user_id, title, description, icon, category,
  stat_affinity,                           -- which stat gains XP (STR/INT/VIT/DEX)
  base_xp, recurrence, target_time_of_day,
  difficulty_multiplier, created_at, archived_at

habit_logs
  id, habit_id, completed_at, xp_awarded, loot_dropped_id nullable, notes

loot_items
  id, name, rarity, slot (head/body/weapon/cosmetic),
  sprite_key, class_restriction nullable, flavor_text

inventory
  id, user_id, loot_item_id, acquired_at, equipped

quests
  id, type (daily/weekly/story), title, description,
  criteria_json, rewards_json,
  status (available/active/completed/claimed),
  class_id nullable, started_at, completed_at

perks
  id, name, description, trigger_json (level X, streak Y, quest Z),
  effect_json, class_id nullable,
  unlocked_at nullable

pets
  id, user_id, species, level, xp, evolution_stage, nickname
```

### Migration strategy

Every schema change ships a migration in `src/db/migrations/`. Never edit an old migration. Test migrations by running them against a seeded v1.0 database before release.

---

## 7. Game design math (first-pass, tunable)

Put these in `src/game/xp.ts` as constants and adjust after playtesting.

| Concept                           | Value                                                                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| XP to next level                  | `level * 100` (so 100 → 200 → 300...)                                                                                                                            |
| Level cap (v1)                    | 50                                                                                                                                                               |
| Base habit XP                     | 10 (easy) / 20 (medium) / 40 (hard)                                                                                                                              |
| Streak bonus                      | +10% XP per 7-day streak, capped at +50%                                                                                                                         |
| Class affinity bonus              | +25% XP when habit matches class stat                                                                                                                            |
| Loot drop chance                  | 15% base per habit completion, +1% per level, cap 40%                                                                                                            |
| Rarity distribution               | C: 70% / U: 20% / R: 8% / E: 1.8% / L: 0.2%                                                                                                                      |
| HP damage (Difficult / Real Life) | Difficult: 10 HP per missed habit, death = respawn at full HP. Real Life: 15 HP per missed habit, death = lose 1 level + chance to lose a random unequipped item |
| Perk unlock cadence               | Every 5 levels + streak milestones (7/30/100 days)                                                                                                               |

**These are guesses. We measure and tune.** Add an analytics event on every level-up and every loot drop so we can see real distributions.

---

## 8. UX flows (v1)

### First-run onboarding (target: under 90 seconds)

1. Splash → welcome
2. "What should we call your hero?" → name
3. "Pick your class" → 6-card carousel, short pitch each
4. "Design your hero" → 4 body types, 8 hair/skin palettes (small matrix, scales later)
5. "Pick 3 starter habits" → curated list based on class (e.g., Scholar gets "Read 10 pages", "Deep work 25 min", "Review notes")
6. "How intense do you want this?" → Zen / Standard / Difficult / Real Life (default: Standard; explain each in one line)
7. Tutorial fight: log your first habit, see the juice, get a guaranteed Common drop, equip it.
8. Home screen.

### Home screen (the one the user sees 10x/day)

- Top: character sprite with XP bar + level badge
- Middle: today's habits (checklist with big tap targets)
- Bottom: pet + active quests summary
- FAB: quick-add habit

### Habit log tap (the most-used interaction)

1. Tap checkbox
2. Haptic thump
3. XP number pops out of the habit row ("+15 XP")
4. XP bar fills with animation
5. If loot drops: sprite + rarity flash + "Tap to claim" toast (non-blocking)
6. If level-up: full-screen takeover with stat gains + perk check

### Screens to build (v1)

1. Onboarding (7 steps)
2. Home / Today
3. Habits list + detail + edit
4. Character / Equipment
5. Inventory
6. Quests
7. Pet detail
8. Settings
9. Level-up modal (full-screen overlay)
10. Loot drop modal

That's it. Ten screens. Don't add more.

---

## 9. Art & sound direction

### Visual

- **Style:** 16-bit pixel art, Stardew-adjacent but slightly more saturated
- **Character grid:** 32x32 base sprite, 4-direction walk (animated idle only for v1 to save frames)
- **Palette:** single limited palette (~32 colors) to keep art cohesive
- **UI:** pixel-adjacent but readable — use a modern sans for body text, pixel font for headers and numbers
- **Animations:** sprite squash/stretch on tap, particle bursts for loot, screen shake on level-up

### Asset sourcing plan

1. **v0 (coding):** Use placeholder sprites from a CC0 asset pack (e.g., Kenney.nl) while building logic
2. **v1 launch:** Commission a pixel artist on Fiverr/Upwork for: 6 class base sprites (4 variants each), ~40 loot items, 6 pets + evolutions, UI frames
3. **Budget target:** under $2k for launch art. Tighten scope if needed.

### Sound

- Short, chunky SFX (loot pickup, level up, habit complete, button tap)
- Optional chiptune ambient music toggle (off by default)
- Source from a royalty-free pack (e.g., Leshy SFMaker + a chiptune Humble Bundle)

---

## 10. Monetization (v1: cosmetics only)

Not implementing real-money IAP in v1 — we ship free, build an audience, then add IAP in v1.1. But structure the data model so it's ready:

- `inventory` items can have `source` of `loot`, `quest`, `iap`, `promo`
- Cosmetic skin slots are separate from stat-bearing equipment (v1 equipment is cosmetic-only anyway)
- Plan for: character skins ($2.99), pet skins ($1.99), seasonal bundles ($4.99)
- **No loot boxes. Ever.** Regulatory risk + bad vibes. Random loot from habits is fine; paid random = no.

---

## 11. Launch plan

### Phase 0 — Setup (Week 1)

- Expo project init, TypeScript strict, ESLint/Prettier/Husky
- Folder structure, CI (GitHub Actions: lint + typecheck + test on PR)
- Sentry + PostHog SDKs
- Deploy a TestFlight + Google Play Internal Testing build with a blank screen to confirm pipeline works

### Phase 1 — Core loop (Weeks 2–5)

Goal: a playable habit → XP → level-up cycle on a real phone.

- SQLite schema + migrations + seed
- Game math module with full test coverage
- Home screen + habit logging
- Character screen with XP bar + level-up animation
- Pre-made habit templates + custom habit creation
- Local notifications
- **Gate:** dogfood for 7 days. If logging a habit isn't fun, fix it before moving on.

### Phase 2 — Game systems (Weeks 6–9)

- Classes, stat biases, class-specific starter habits
- Loot drops + rarity + inventory + equip
- Quests (daily, weekly, first story quest per class)
- Perks engine + 5 perks per class
- Pets + one evolution
- Difficulty settings (Zen / Standard / Difficult / Real Life)
- **Gate:** friends & family beta via TestFlight / Play Internal. Target 10–20 testers. Iterate 1 week on feedback.

### Phase 3 — Polish (Weeks 10–12)

- Onboarding flow with tutorial
- Animations, sounds, haptics on every core interaction
- Settings, data export, account deletion (required for App Store)
- Privacy policy, terms of service, App Privacy labels
- App Store / Play Store assets (icon, screenshots, preview video)
- Commissioned pixel art drops in

### Phase 4 — Launch (Weeks 13–14)

- Public beta (TestFlight public link + Play Open Testing)
- Submit to App Store + Google Play
- ProductHunt, r/getdisciplined, r/productivity, indie game subreddits
- Press kit

### Phase 5 — Post-launch (ongoing)

v1.1 priorities (post-launch feedback will reshuffle):

1. Cloud sync + account (Supabase)
2. Weekly / custom recurrence for habits
3. Real-money IAP (cosmetics)
4. Apple Health / Google Fit integration (auto-complete walk habits)
5. Home screen widgets
6. Friends (still small-scale, not full MMORPG yet)

---

## 12. Risks & how we'll handle them

| Risk                                     | Mitigation                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Scope creep kills timeline               | This doc. Any new feature requires explicitly writing it into a post-v1 phase.                             |
| Pixel art looks inconsistent             | One commissioned artist, one style guide, no mixing CC0 + commissioned in shipped build                    |
| Core loop isn't fun                      | Phase 1 gate: a week of real-world dogfooding before Phase 2.                                              |
| Notifications get users banned           | Sensible defaults, easy to disable, never more than 3/day out of the box                                   |
| Gamification encourages unhealthy habits | Difficult and Real Life modes are opt-in; Zen is always available; no "streak shame" copy in notifications |
| App Store rejection                      | Follow Apple's HIG early; provide account deletion; no loot boxes; clear privacy labels                    |
| Solo dev burnout                         | Ship small, celebrate each phase gate, keep Phase 5 loose so there's room to rest                          |

---

## 13. What Claude Code should do first

In this order:

1. **Read this doc in full.** Ask me clarifying questions before writing code.
2. **Set up the Expo project** with the stack in §4 and the folder structure in §5.
3. **Build `src/game/`** first — pure TypeScript modules for XP curves, loot rolls, class definitions, perks. Write tests alongside. This is the heart of the game and the easiest thing to build without a UI.
4. **Build the SQLite schema and repositories.** Seed with 6 classes, ~30 habit templates, a starter loot table.
5. **Build the Home screen + habit logging + level-up animation.** Get the core loop on a real phone by end of Week 4.
6. **Stop and let me play it for a week** before adding classes/loot/quests.

### Rules for Claude Code during development

- Every new feature starts with a plan posted in chat before writing code.
- Every non-obvious architectural decision gets a one-line entry in `docs/DECISIONS.md`.
- Every tunable number (XP values, drop rates, perk effects) lives in a single `src/game/balance.ts` file so I can tweak without hunting.
- Write tests for `src/game/` modules — UI tests only for critical flows.
- Don't add dependencies without flagging them first.
- Prefer deleting code over adding code.

---

## 14. Resolved decisions

- **App name:** Lyf
- **Classes:** Warrior, Scholar, Healer, Artificer, Sage, Ranger (6, locked for v1)
- **Difficulty default:** Standard (Zen / Standard / Difficult / Real Life all available from onboarding)
- **Account deletion / data export:** Implement as "wipe local DB + reset to onboarding" for deletion; export = JSON dump of all tables to a shareable file
- **Pet evolution:** Cute → Cuter (not power-creep). Think Stardew > Pokémon.
- **Monetization:** v1 is free with zero IAP. v1.1 will introduce cosmetic-only IAP.
