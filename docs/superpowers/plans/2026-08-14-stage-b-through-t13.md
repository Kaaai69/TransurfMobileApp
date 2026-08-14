# Stage B Through T13 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the accepted Glow device check, the Stage B persistence/domain foundation, and the T13 launch experience.

**Architecture:** SQLite is the persisted source of truth, Drizzle owns typed schema and queries, and pure domain modules own scoring, drift, grace, tiers, and XP rules. The launch coordinator reads SQLite-backed flags while `expo-video` renders the approved first/repeat asset, then routes to minimal destination shells that later BUILD tasks replace.

**Tech Stack:** Expo SDK 54, Expo Router 6, Expo SQLite, Drizzle ORM, Expo Video, TypeScript, Jest.

**Spec:** `docs/superpowers/specs/2026-08-12-transurf-v1-design.md`

## Global Constraints

- Execute BUILD tasks in order and keep a focused commit for each task.
- Read `CLAUDE.md` and `DESIGN.md` before every BUILD task.
- Use the exact Expo SDK 54 documentation at `https://docs.expo.dev/versions/v54.0.0/`.
- New behavior follows RED, observed failure, GREEN, focused verification, BUILD checkbox, commit.
- SQLite remains the source of truth; domain calculations remain pure.
- No Russian application text outside `src/i18n/ru.ts`; no component magic colours or layout values.
- Do not proceed beyond T13.

---

### Task 1: Close T04 manual acceptance

**Files:**
- Modify: `BUILD.md`

- [ ] Mark T04 complete after the accepted physical-device check.
- [ ] Confirm only the intended BUILD line changed.
- [ ] Commit as `T04: complete glow device acceptance`.

### Task 2: T07 database schema and startup migration

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`, `src/db/migrate.ts`, `src/db/DatabaseProvider.tsx`
- Create: `drizzle.config.ts`, `drizzle/` generated migration files
- Modify: `app/_layout.tsx`, `metro.config.js`, `package.json`, `BUILD.md`
- Test: `src/db/schema.test.ts`, `src/db/migrate.test.ts`

- [ ] Add failing schema and migration/smoke tests.
- [ ] Run focused tests and confirm missing-module/contract failures.
- [ ] Install SDK-compatible Expo SQLite plus Drizzle migration dependencies.
- [ ] Define the five documented tables with keys, constraints, JSON tags, nullable source fields, and non-negative XP.
- [ ] Generate/apply the migration at app startup; enable WAL and foreign keys; run a temporary-table write/read smoke check.
- [ ] Run focused tests, typecheck, and full tests.
- [ ] Mark T07 and commit as `T07: add local database schema`.

### Task 3: T08 task seed

**Files:**
- Create: `src/content/tasks.ts`, `src/db/seed.ts`
- Modify: `src/db/migrate.ts`, `BUILD.md`
- Test: `src/content/tasks.test.ts`, `src/db/seed.test.ts`

- [ ] Add failing tests for 30 stable templates, DOI count, nullable sources, and idempotent insertion.
- [ ] Run focused tests and confirm the expected failures.
- [ ] Transcribe all six five-tier ladders exactly and seed them after migration with conflict-ignore semantics.
- [ ] Run focused tests, typecheck, and full tests.
- [ ] Mark T08 and commit as `T08: seed core task templates`.

### Task 4: T09 scoring

**Files:**
- Create: `src/domain/scoring.ts`, `src/domain/scoring.test.ts`
- Modify: `BUILD.md`

- [ ] Add failing literal-fixture tests for best/worst answers, caffeine timing across midnight, tie-break order, and clamping.
- [ ] Implement typed answers, conservative ordinal scales, category weighting, sleep modifiers, and fixed weakest-link priority.
- [ ] Run focused tests, typecheck, and full tests.
- [ ] Mark T09 and commit as `T09: implement onboarding scoring`.

### Task 5: T10 rolling state drift

**Files:**
- Create: `src/domain/drift.ts`, `src/domain/drift.test.ts`
- Modify: `BUILD.md`

- [ ] Add failing tests proving no-entry is gentler than skipped, adjacent weight is 0.3, drift moves toward baseline, and logs outside fourteen days do not affect recalculation.
- [ ] Implement deterministic date-window filtering, slot bases, adjacency, baseline rebuild, and 0–100 clamping.
- [ ] Run focused tests, typecheck, and full tests.
- [ ] Mark T10 and commit as `T10: implement rolling state drift`.

### Task 6: T11 grace days

**Files:**
- Create: `src/domain/grace.ts`, `src/domain/grace.test.ts`
- Modify: `BUILD.md`

- [ ] Add failing tests for automatic use, rolling restoration, exhaustion/downgrade offer, and invariant chain length under miss sequences.
- [ ] Implement a pure rolling-thirty-day grace transition.
- [ ] Run focused tests, typecheck, and full tests.
- [ ] Mark T11 and commit as `T11: implement grace day rules`.

### Task 7: T12 tiers and XP

**Files:**
- Create: `src/domain/tiers.ts`, `src/domain/tiers.test.ts`
- Modify: `BUILD.md`

- [ ] Add failing tests for the 70%/14-day adherence gate, 21 elapsed days, forgiven-day denominator, award amounts, and 500 deterministic random XP sequences.
- [ ] Implement independent tier eligibility and additive non-negative XP awards.
- [ ] Run focused tests, typecheck, and full tests.
- [ ] Mark T12 and commit as `T12: implement tiers and monotonic XP`.

### Task 8: T13 launch video and routing

**Files:**
- Create: `src/launch/state.ts`, `src/launch/destination.ts`, `src/launch/WelcomeVideo.tsx`
- Create: `assets/video/welcome-repeat.mp4`, `assets/video/welcome-final.png`
- Create/Modify: `app/index.tsx`, minimal onboarding/daily destination routes, `src/i18n/ru.ts`
- Modify: `package.json`, `BUILD.md`
- Test: `src/launch/state.test.ts`, `src/launch/destination.test.ts`

- [ ] Add failing tests for first/repeat selection and onboarding/daily destination selection.
- [ ] Install Expo Video using the SDK 54 installer.
- [ ] Derive the approved final 600 ms clip and final frame from the tracked ten-second source.
- [ ] Implement edge-to-edge muted playback, final-frame reduced motion, failure fallback, persisted welcome state, and post-animation routing.
- [ ] Keep initialization parallel to playback and prevent duplicate completion callbacks.
- [ ] Run focused tests, typecheck, lint, format check, full tests, and Expo Doctor.
- [ ] Mark T13 and commit as `T13: add launch video flow`.

