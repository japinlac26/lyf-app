# Architecture Decision Records

Every non-obvious architectural decision gets one line here: date, decision, reason.

---

| Date       | Decision                                                   | Reason                                                                                                                           |
| ---------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-24 | Chose Expo + React Native for cross-platform + OTA updates | Single codebase for iOS + Android; Expo EAS enables over-the-air JS updates without App Store review cycles                      |
| 2026-04-24 | expo-sqlite + repository layer over direct DB access       | Encapsulates all SQLite calls so swapping to Supabase in v1.1 only requires changing repositories, not feature code              |
| 2026-04-24 | Zustand over Redux for state management                    | Significantly less boilerplate; sufficient for a solo-user, offline-first app with no server state in v1                         |
| 2026-04-24 | src/game/ kept pure (no React, no DB imports)              | Makes game logic unit-testable in isolation without mocking native modules; critical for maintaining correctness of XP/loot math |
| 2026-04-24 | All tunable numbers in balance.ts                          | Prevents magic numbers scattered across the codebase; one-file tuning during playtesting                                         |
| 2026-04-24 | jest-expo as test runner (not raw Jest)                    | jest-expo handles the React Native transform config automatically; avoids manual Babel setup                                     |
