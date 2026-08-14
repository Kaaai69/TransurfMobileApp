# BUILD.md

Ordered task list. This is the work plan for the agent.

---

## How to use this file

**One task at a time.** Read the task, read the referenced docs, implement, verify against the acceptance criteria, commit, report, stop. Do not chain tasks.

**Before every task:** read `CLAUDE.md` and `DESIGN.md`. Never improvise design values.

**Definition of done for every task:**

- `npm run typecheck` passes with zero errors
- `npm test` passes (if the task has tests)
- No `console.log` in committed code
- No hardcoded colours, sizes or Russian strings in components
- Committed with a message like `T04: glow component with L0–L5 presets`

**If blocked or a task conflicts with an invariant in `CLAUDE.md` — stop and ask.** Do not work around it.

**Progress:** mark tasks `[x]` as they land.

---

# Stage A — Foundation

Goal: the design system exists as code, before any screen is built.

### [x] T01 — Project hygiene

Configure TypeScript strict mode. Add `npm run typecheck` script. Set up jest with `jest-expo`. Add `.prettierrc` and ESLint. Create `docs/` and move all reference `.md` files there except `CLAUDE.md`, `DESIGN.md`, `BUILD.md`.

**Acceptance:** `npm run typecheck` and `npm test` both run and pass on the empty project.

---

### [x] T02 — Theme tokens

Create `src/theme/colors.ts`, `typography.ts`, `spacing.ts`, `motion.ts`. Mirror `DESIGN.md` §1, §3, §5, §7 exactly. Export typed objects, no magic strings.

Load Inter via `@expo-google-fonts/inter`, weights 400 and 500 only.

**Acceptance:** every value in `DESIGN.md` §1 exists as a named export. Importing `colors.accent` returns `#4361FF`. No other weights of Inter are loaded.

---

### [x] T03 — Russian strings file

Create `src/i18n/ru.ts` with a typed nested object. Seed with strings already written in `docs/onboarding-brief.md` (screens 1–22) and `docs/day1-14-and-goals.md` (day 3, 7, 11, 14 texts).

**Acceptance:** no Russian text appears anywhere outside this file. Keys are typed.

---

### [x] T04 — Glow component ⭐

`src/light/Glow.tsx` + `src/light/levels.ts`.

Six presets L0–L5 per `DESIGN.md` §2. Implement with `react-native-svg` `RadialGradient` — core warmer than halo, per the signature construction. Props: `level`, `form` (`bloom | halo | edge | core`), `temperature` (`cool | warm`), `color` (optional override for category colours).

`bloom` is the most-used form: wide soft glow rising from the bottom edge, 15–25% of screen height.

**Acceptance:** a demo screen renders all six levels side by side, plus all four forms. Verified on a physical device in a dark room — L1 must be barely visible, not a visible blob.

**Manual acceptance pending:** verify L1 brightness and reduced-motion behavior on a physical Android/OLED device in a dark room.

**This is the identity layer. Nothing else in the app draws glow.**

---

### [x] T05 — Base components

`src/components/`: `AnswerOption.tsx`, `ProgressLine.tsx`, `Chip.tsx`, `ScreenShell.tsx`.

`ScreenShell` takes a `level` prop and renders the black canvas plus the correct `Glow` for that screen. Every screen uses it.

`ProgressLine` is strictly linear — never accelerates or decelerates.

**Acceptance:** components render with tokens only. A storybook-style demo route shows each in its states.

---

### [x] T06 — Ring component ⭐

`src/components/Ring.tsx` with `react-native-svg`.

Two modes:
- `state` — six 60° sectors, 4° gaps, arc radius = category value mapped 0→35, 100→105. Order clockwise from top, FIXED: Sleep → Energy → Movement → Food → Water → Mind.
- `habit` — 60 segments of 6°, one per day. `forgiven` days render on the same path at 2.5px instead of 6px.

Draw-on animation with `react-native-reanimated`: 900ms, 80ms stagger per sector.

**Acceptance:** ring renders from mock data and changes when values change. A forgiven day is visibly thinner but the line has **no gap**. Verified at 320px width — if labels don't fit outside, implement the compact mode with labels inside.

---

# Stage B — Data and domain

Goal: all the rules exist and are tested, before any screen depends on them.

### [x] T07 — Database schema

`src/db/schema.ts` with drizzle + `expo-sqlite`. Tables per `docs/task-library.md` §7: `task_template`, `user_task`, `task_log`, `user_state`, `user_flags`.

`source_doi` is nullable. `xp` is an integer that only ever grows.

**Acceptance:** migrations run on app start. A smoke test writes and reads a row.

---

### [ ] T08 — Task content seed

`src/content/tasks.ts`. Import the 30 core tasks (six ladders × five tiers) from `docs/task-library.md` §3. Seed into `task_template` on first launch.

Tasks without a research source get `sourceDoi: null` — this is valid, do not invent DOIs.

**Acceptance:** 30 core templates in the DB after first launch. Count of templates with `sourceDoi != null` matches the doc.

---

### [ ] T09 — Scoring ⭐

`src/domain/scoring.ts`. Implements `docs/onboarding-brief.md` part 4: 16 answers → six category values 0–100, plus weakest link selection with the fixed tie-break order.

**Acceptance:** unit tests covering — all-best answers, all-worst answers, the caffeine/bedtime modifier, tie-break order. Values always clamp to 0–100.

---

### [ ] T10 — State drift ⭐

`src/domain/drift.ts`. Per `docs/task-library.md` §2:

```
done       → +base × weight
skipped    → −base × weight
no entry   → −0.25 drift toward baseline, NOT a penalty
```

Adjacent categories get weight 0.3: sleep↔energy, movement↔energy, mind↔sleep, food↔energy.

**Acceptance:** unit test proving a missing checkmark produces smaller movement than an explicit "skipped". Test that state recalculates over a 14-day window rather than accumulating forever.

---

### [ ] T11 — Grace days ⭐

`src/domain/grace.ts`. 2 per rolling 30 days. Consumed automatically on a miss.

**When grace days run out, the chain still does not reset.** Only the message changes, and `downgradeOffered` is set.

**Acceptance:** unit tests — consumption, rolling window restore, and a test asserting `chainLength` never resets to zero under any sequence of misses.

---

### [ ] T12 — Tiers and XP ⭐

`src/domain/tiers.ts`. Unlock when adherence ≥ 70% over 14 days **AND** ≥ 21 days elapsed. Per category independently.

XP per `docs/task-library.md` §2. **XP never decreases.**

**Acceptance:** a property-style test running 500 random event sequences and asserting XP is monotonically non-decreasing. This test must exist.

---

# Stage C — Onboarding

### [ ] T13 — Splash screen

`app/index.tsx`. On first launch, plays the complete `Light_arc_expanding_in_void_202608031404.mp4` via `expo-video`, composited with `mixBlendMode` screen-equivalent over black (the video's background is true `#000000`).

Falls through to onboarding or daily screen depending on stored state. Repeat launches use a derived final 600 ms clip of the same source video.

**Acceptance:** cold start shows the animation, then routes correctly. Second launch on the same day is shortened.

---

### [ ] T14 — Onboarding shell and routing

`app/onboarding/[step].tsx`. 22 steps, back navigation, progress persisted so a killed app resumes where it left off.

Each screen declares its light level from the map in `docs/identity-and-motion.md` §6. **Screen 5 and screen 7 are L0 — no glow at all.**

**Acceptance:** all 22 routes reachable, progress survives app restart, the light level map matches the doc exactly.

---

### [ ] T15 — Manifesto screens (1–10)

Text screens per `docs/onboarding-brief.md` part 3. Line-by-line text reveal, 400ms per line. Button appears at 4s — before the text finishes.

Screen 1 has audio: **never autoplay if the device is in silent mode**, mute control visible from the first second, and the text must carry full meaning without sound.

Screen 8 is the first warm light in the entire product.

**Acceptance:** readable with sound off. Screen 10's "Пропустить" link works and is tracked separately.

---

### [ ] T16 — Questions (11–17)

16 questions per `docs/onboarding-brief.md` part 4. Sliders and single-select. Conditional display for Q6 (only if Q5 ≠ "нет").

Progress bar shows honest `current / 16`, strictly linear.

**Acceptance:** all answers persist, back navigation preserves them, Q6 hides correctly.

---

### [ ] T17 — Calculation and result (18–20)

Screen 18 runs the **real** calculation. Checkmarks tick as stages actually complete — no timers. If it takes 200ms, show it for 200ms.

Screen 19: ring at L4 with six values. Screen 20: weakest link, other sectors dimmed to `#4A5058`.

Mandatory small print under the ring: `Значения рассчитаны по вашим ответам и не являются медицинской оценкой.`

**Acceptance:** `calcMs` reflects real duration. No fake progress. No comparison to an "average user".

---

### [ ] T18 — First task and sources (21–22)

Screen 21: first task card at L4, if-then format, with source attribution when present.

Screen 22: source cards — study name, journal, year, tappable DOI. **Text only, no logos, no journal covers.**

**Acceptance:** DOI links open in browser. Tasks without a source render no info button.

---

# Stage D — Daily loop

### [ ] T19 — Daily screen ⭐

`app/(tabs)/index.tsx`. Three slots per `docs/task-library.md` §1: core (bottom sheet, one line visible), support, today.

Ring at L2, task card at L4. **One L4 element on screen, no more.**

**Acceptance:** marking a task updates state and XP, ring reflects it, works offline.

---

### [ ] T20 — Missed day screen ⭐

Per `docs/day1-14-and-goals.md` day 11. L2, warm.

**No red. No illustration. No broken-chain graphic. No mention of what was lost.** Tone: as if nothing notable happened.

**Acceptance:** a reviewer reading the screen cold cannot tell it is a "failure" state.

---

### [ ] T21 — Day 7 recalculation

Six rows, before → after, arrows. Up = `accent`, down = `neutralDown`, unchanged = dash. One explanation line per change.

**Acceptance:** at least one category can fall. If the algorithm produces all-up for a typical user, the calculation is wrong — flag it.

---

### [ ] T22 — Day 14 summary and tier offer

Summary, then next-tier offer with a `Остаться на этой ещё на неделю` option that must work.

**Acceptance:** postponing keeps the current task and re-offers in 7 days.

---

### [ ] T23 — Notifications

`expo-notifications`, schedule per `docs/day1-14-and-goals.md` push map. Max two per day, never at night.

Throttle: no evening push after 3 days inactive; one per week after 7.

**Acceptance:** schedule matches the map. Throttling verified by simulating inactivity.

---

# Stage E — Instrumentation and release

### [ ] T24 — Analytics

Events per `docs/analytics-events.md`. Priority order from part 10: `grace_day_used` + `core_completed` first.

**Never send user-written text.** Only `length` and `category`.

**Acceptance:** every event fired matches a name in the doc. No event exists that isn't in the doc.

---

### [ ] T25 — Sentinel checks

Two guards from `docs/analytics-events.md`:
- `calcMs` reports real duration, not animation duration
- warn in dev if `categories_down === 0` on the recalc screen

**Acceptance:** both present and firing.

---

### [ ] T26 — Paywall

Screens and plan selection. **No new promises** — everything sold must already be stated on onboarding screen 4. First task stays free.

RuStore billing integration is a separate task; here build the UI and a stub.

**Acceptance:** no claim on the paywall is absent from screen 4.

---

### [ ] T27 — Release prep

App icon, adaptive icon, splash config, `app.json` metadata, ProGuard, EAS build profile for RuStore.

**Acceptance:** `eas build -p android --profile preview` produces an installable APK.

---

# Blocked — do not start

Outside v1 scope per `docs/roadmap.md` §4. If a task seems to need these, **stop and ask**.

- Feed of user posts
- Ranks, leaderboards, streams
- Goals / WOOP
- Reading branch (Ум · Нагрузка)
- Custom user tasks + safety filter
- Micro-tasks library (needs 180 entries first)
- AI of any kind
- iOS build

---

## Open items for the human

Not agent tasks — decisions blocking later work.

- [x] App name — resolved as Transurf
- [ ] Price — blocks paywall copy
- [ ] `content-tasks.xlsx` filled from 17 rows to full set — blocks T08 completion beyond core tasks
- [ ] RuStore developer account — blocks T27
