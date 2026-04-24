# CLAUDE.md

> This is the main instruction file for **Lyf**, a pixel-art habit-tracking MMORPG. Claude Code reads this automatically at the start of every session. The full product spec lives in `docs/PROJECT_PLAN.md` — treat it as the source of truth for scope and requirements.

---

## Working agreement

You are the primary developer on this project. The human product owner is **non-technical**. That shapes everything about how we work together:

1. **Explain before you code.** Before starting any non-trivial task, post a short plan in chat (3–8 bullets: what you'll build, what files you'll touch, what could go wrong). Wait for a go-ahead on the first few tasks; once we've established rhythm, proceed on routine work and only pause on architectural choices.
2. **Show progress in plain English.** After completing a task, summarize what changed, how to see it working on the phone, and anything I need to know. No unexplained jargon.
3. **Flag dependencies before adding them.** Any new npm package → mention it, why, and what it costs (bundle size, maintenance).
4. **Prefer deleting code over adding code.** If something can be simpler, make it simpler.
5. **Never silently change scope.** If a task reveals hidden work, stop and flag it. Don't just expand the PR.
6. **Ask when stuck.** If a requirement is ambiguous, ask one clear question. Don't guess.

---

## Project north star

Read `docs/PROJECT_PLAN.md` end-to-end before your first task. Everything in this file assumes you have. When anything here conflicts with that plan, the plan wins.

**Core loop (memorize this):** Log habit → gain XP → level up / drop loot → equip / unlock perk → repeat.

**Design pillars (in priority order):**

1. Respect the user's time — one-tap logging.
2. Reward consistency over intensity.
3. Progress is always visible (XP, levels, loot, animations).
4. Failure is optional — difficulty is a user setting.
5. The game serves the habit, not the other way around.

---

## Tech stack (locked)

- **Expo (managed workflow)** + React Native + TypeScript strict
- **Expo Router** (file-based routing)
- **Zustand** for state
- **expo-sqlite** for local DB (no server in v1)
- **Reanimated 3 + Moti** for animation
- **expo-haptics, expo-audio, expo-notifications**
- **Jest + React Native Testing Library**; Detox only for 2–3 E2E smoke tests
- **Sentry** (crash reporting) + **PostHog** (product analytics)

Do not introduce Redux, GraphQL, Firebase, a game engine, or any backend until v1.1.

---

## Non-negotiable rules

### Code

- TypeScript `strict: true`. No `any` without a comment explaining why.
- `src/game/` is pure TypeScript. No React, no database, no side effects. This is the heart of the game and must be testable in isolation.
- Only repositories (`src/db/repositories/`) touch SQLite. Features import repositories, never `expo-sqlite` directly.
- Features don't import from other features. Shared logic lives in `src/game/` or `src/store/`.
- Every tunable number (XP values, drop rates, perk effects, damage amounts) lives in `src/game/balance.ts`. Nowhere else.
- Every non-obvious architectural decision gets one line in `docs/DECISIONS.md` (date, decision, reason).
- Tests are required for everything in `src/game/`. UI tests only for the core flows (onboarding, habit logging, level up).

### Product

- Never paywall a core mechanic. v1 has zero IAP.
- Never ship a loot box (even a free one from shops — loot only comes from habits, quests, and level-ups).
- Notifications: max 3/day default, always easy to disable per-habit.
- No shame copy. Reminders are gentle ("Your hero misses you") not punitive ("You broke your streak, loser").
- Account deletion must wipe local DB and reset to onboarding. Must be accessible in Settings.
- Data export must produce a JSON file of all user data, shareable via the OS share sheet.

### Art & sound

- 16-bit pixel style, Stardew-adjacent, slightly more saturated. 32x32 base character sprite.
- Placeholder art during development comes from Kenney.nl (CC0). Commissioned art replaces it before launch.
- Never mix CC0 and commissioned art in the same shipped screen.
- One limited palette for the whole game.

---

## Scope boundary (v1)

**In scope:**
Onboarding, character (class, level, stats, equipment), pre-made + custom habits (daily recurrence only), one-tap logging, XP & leveling (cap 50), loot drops (5 rarities, cosmetic-only), inventory & equip, quests (daily/weekly/story), perks, one pet per class with one evolution stage, four difficulty modes, local notifications, settings, offline-first.

**Out of scope (parking lot — do not build without explicit go-ahead):**
Cloud sync, accounts, guilds, friends, chat, PvP, leaderboards, trading, in-game currency, real-money IAP, Apple Watch, widgets, voice input, AI coaching, Apple Health / Google Fit integration, weekly/custom recurrence.

If a task requires something in the parking lot, stop and ask.

---

## The four difficulty modes

These are user-selectable at onboarding and changeable in Settings. Implement as a single enum `Difficulty` in `src/game/balance.ts` with all tuning values parameterized by it.

| Mode          | Missed habit consequence | Streak           | Death consequence                                          |
| ------------- | ------------------------ | ---------------- | ---------------------------------------------------------- |
| **Zen**       | Nothing                  | Streak continues | N/A (can't die)                                            |
| **Standard**  | Streak breaks            | Resets to 0      | N/A (can't die)                                            |
| **Difficult** | -10 HP per miss          | Resets to 0      | Respawn at full HP, no loss                                |
| **Real Life** | -15 HP per miss          | Resets to 0      | Lose 1 level + 25% chance to lose a random unequipped item |

Default: Standard. Explain each mode in one short line during onboarding.

---

## The six classes

Each class has: a stat bias, flavor pitch, starter habit suggestions, a starter pet, and a perk tree. Define all of this declaratively in `src/game/classes.ts`.

| Class         | Stat bias | Real-life fit                            | Starter pet direction                     |
| ------------- | --------- | ---------------------------------------- | ----------------------------------------- |
| **Warrior**   | STR       | Athletes, trainers, physical jobs        | Small cute beast (fox kit, pup)           |
| **Scholar**   | INT       | Students, researchers, writers           | Owlet                                     |
| **Healer**    | VIT       | Nurses, doctors, caregivers, therapists  | Bunny                                     |
| **Artificer** | DEX + INT | Developers, designers, makers, engineers | Mechanical pet (tiny clockwork companion) |
| **Sage**      | VIT + INT | Monks, meditators, teachers, counselors  | Fae / spirit-pet                          |
| **Ranger**    | DEX       | Outdoor workers, hikers, gardeners       | Hatchling hawk or fawn                    |

Classes are **flavor**, not hard restrictions — any user can log any habit. Class affects: XP bonus on matching habits (+25%), loot drop cosmetic flavor, starter pet, class-specific story quests.

---

## Pet evolution direction

**Cute → Cuter, always.** Never scary, never edgy, never power-creeped into dragons. Three stages for v1 (Hatchling → Young → Companion), unlocking at pet level 10 and 25. All evolutions should look like the same creature, just more endearing and with a few more visual flourishes (bigger eyes, a little accessory, a gentle glow). Think Stardew Valley slimes and chickens, not Pokémon.

---

## How we work — phased execution

Work through the phases in `docs/PROJECT_PLAN.md` §11 in order. Don't skip ahead. Within each phase, work in small PRs.

### Phase 0 — Setup (Week 1)

Your first tasks, in order:

1. Post a plan in chat for the full Phase 0, then wait for go-ahead.
2. `npx create-expo-app lyf -t default` with TypeScript template. Configure `tsconfig.json` for strict mode.
3. Install core deps per the tech stack. Flag anything that isn't in the stack list before adding.
4. Set up ESLint + Prettier + Husky + lint-staged. Lint and typecheck must pass on every commit.
5. Set up the folder structure from `docs/PROJECT_PLAN.md` §5. Create placeholder `index.ts` files so the structure is visible in git.
6. Initialize `docs/DECISIONS.md` with the first entry: "Chose Expo + React Native for cross-platform + OTA updates."
7. Set up GitHub Actions: lint, typecheck, and test on every PR.
8. Add Sentry and PostHog SDKs with env-var-driven DSNs (but no-op in dev).
9. Get a blank-screen build running on TestFlight + Play Internal Testing. Post screenshots in chat.
10. Check in. We review before Phase 1.

### Phase 1 — Core loop (Weeks 2–5)

Goal: Log a habit → see XP → level up → feel the juice. On a real phone. No classes, loot, or quests yet.

After Phase 0 sign-off, post a Phase 1 plan and wait for go-ahead. Build order:

1. `src/game/xp.ts` + tests (XP curve, level from XP, XP to next level)
2. `src/game/balance.ts` (all tunable numbers, typed)
3. SQLite schema + migrations for `users`, `characters`, `habits`, `habit_logs`
4. Repository layer for the above
5. Seed data: 1 default user, 1 default character, ~15 habit templates
6. Home screen (list of today's habits + character XP bar at top)
7. Habit creation flow (pick from templates or custom)
8. One-tap habit logging with optimistic UI + haptic + XP number animation
9. Level-up modal with full-screen takeover, sound, screen shake
10. Local notifications (per-habit, configurable time)

At the end of Phase 1, I will dogfood the app for 7 days. We do not start Phase 2 until I confirm the core loop feels good.

### Phase 2+ — see `docs/PROJECT_PLAN.md` §11.

---

## Communication protocol

### Before starting a task

Post in chat:

- **What I'm building:** one sentence
- **Files I'll create or change:** bullet list
- **Approach:** 2–4 sentences on the how
- **Open questions:** anything ambiguous
- **Estimated complexity:** Small (< 30 min) / Medium (30 min – 2 hours) / Large (> 2 hours)

For Small tasks in familiar territory, skip this and just do it.

### After completing a task

Post in chat:

- **What changed:** plain English summary
- **How to see it:** "Open the app, tap X, you'll see Y"
- **What I didn't do:** anything deferred, with a reason
- **Next suggested step:** one sentence

### When stuck

Post in chat:

- **What I was trying to do**
- **What went wrong** (error message verbatim, not a summary)
- **What I tried**
- **One specific question I need answered to move forward**

Don't thrash silently for more than ~15 minutes before asking.

---

## File-by-file priorities for the first two weeks

If you have to cut corners to hit the Week 1 and Week 4 gates, here's what matters most:

**Must-be-bulletproof (tested, reviewed, high polish):**

- `src/game/xp.ts`, `src/game/balance.ts`, `src/game/classes.ts`
- `src/db/schema.ts` and its migrations
- Habit logging interaction (the single most-used flow)

**Can be scrappy for now (we'll polish in Phase 3):**

- Visual design of screens (use a default RN component library look; pixel art comes later)
- Settings screen (a bare list is fine)
- Animations beyond habit-log and level-up

**Do not build yet:**

- Anything in the v1 parking lot
- Anything past Phase 1's checklist

---

## When in doubt

1. Re-read `docs/PROJECT_PLAN.md`.
2. Pick the smallest version of the feature that delivers the core value.
3. If still unclear, ask me one focused question.

Let's build Lyf. Start by confirming you've read this file and `docs/PROJECT_PLAN.md`, then post your Phase 0 plan.
