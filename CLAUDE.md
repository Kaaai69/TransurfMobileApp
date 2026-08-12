# CLAUDE.md

Project context. Read before any task in this repo.

---

## What this is

Transurf is a React Native app built with Expo (SDK 54, expo-router, TypeScript). A habit/routine tracker built on an explicitly non-punitive, evidence-cited approach. Russian-language UI. Android-first, distributed via RuStore; iOS comes later.

## Stack

```
Expo SDK 54 + expo-router (file-based routing)
TypeScript, strict mode
react-native-reanimated    animations
react-native-svg           ring, glow gradients
expo-sqlite + drizzle      local storage
zustand                    state
expo-notifications         push
@expo-google-fonts/inter   typography
expo-video                 splash video
```

Ask before adding any dependency not on this list.

---

## Design system — mandatory

**`DESIGN.md` in the repo root is the source of truth for all UI.** Read it before writing or modifying any component. Never improvise colours, spacing, type sizes or motion values — take them from the tokens in `src/theme/`.

Hard rules that are easy to break by accident:

- Background is `#000000`. Never grey, never near-black.
- **No red anywhere.** Not for errors, not for failures, not for negative deltas. Use `warm #FFB86B` or `neutralDown #7C8296`.
- No `shadowColor` / `elevation`. Depth = surface step + 0.5px border + spacing.
- No emoji. No exclamation marks in copy.
- Inter, weights 400 and 500 only.
- `accent #4361FF` for fills only; text under 18px uses `accentBright #7C8FFF`.
- Every category colour is always paired with an icon and a label.

If a task seems to require breaking one of these, stop and ask instead of improvising.

---

## Product invariants

These come from product decisions, not preference. Breaking them breaks the positioning.

1. **The chain never breaks.** Streaks do not burn. A missed day consumes a grace day (2 per rolling 30). When grace days run out the chain still does not reset — only the wording changes.
2. **Two separate numbers.** `state` (six categories, 0–100, can fall) and `xp` (level, never decreases). Never merge them.
3. **XP is never deducted.** Any code path subtracting XP is a bug.
4. **State falls from recorded behaviour, not from a missing checkmark.** No entry for a day = slow drift toward baseline, not a penalty.
5. **Tasks are always `Если [anchor] — [action]`**, first-person present-tense verb.
6. **`sourceDoi` may be null.** Valid state meaning "no research backs this task". The info button renders only when non-null. Never invent a DOI or citation.
7. **No fabricated metrics.** No "genetic potential", no invented percentages, no comparison to an "average user" without a real sample size.
8. **Never generate calorie counts, weight targets or portion sizes** anywhere.

---

## Repo layout

```
app/                        expo-router routes
  index.tsx                 splash → redirect
  onboarding/[step].tsx     22 screens
  (tabs)/index.tsx          daily screen
  (tabs)/method.tsx         sources
  (tabs)/settings.tsx
src/
  theme/
    colors.ts               mirrors DESIGN.md §1
    typography.ts           §3
    spacing.ts              §5
    motion.ts               §7
  light/
    Glow.tsx                L0–L5 presets — the identity layer
    levels.ts
  components/
    Ring.tsx  TaskCard.tsx  AnswerOption.tsx  ProgressLine.tsx  Chip.tsx
  domain/
    scoring.ts              16 answers → six values
    tiers.ts                unlock rules
    grace.ts                grace days, rolling window
    drift.ts                state drift with no entry
  db/
    schema.ts  client.ts  seed.ts
  content/
    tasks.ts                seeded from content-tasks.xlsx
  store/
    useAppStore.ts
  i18n/
    ru.ts                   all Russian UI strings
```

`src/light/Glow.tsx` is the most important file in the project. Six presets, radial gradients via `react-native-svg`, core warmer than halo. Every screen uses it; nothing else draws glow.

---

## Commands

```bash
npx expo start -c          # dev server, clear cache
npx expo start --android   # open on device/emulator
npm run typecheck          # tsc --noEmit
npm test                   # jest
npx expo-doctor            # dependency health
```

Run `npm run typecheck` after every change and fix errors before reporting done.

---

## Testing priorities

Unit tests required for `src/domain/`, not for UI:

- scoring from the 16 onboarding answers
- state drift when a day has no entry
- grace day consumption and the rolling 30-day window
- tier unlock (adherence ≥ 70% over 14 days AND ≥ 21 days elapsed)
- **a test asserting XP never decreases across any sequence of events**

---

## Working style

- One task from `BUILD.md` at a time. Commit after each. Report and stop.
- Small commits, one concern each.
- Ask before adding a dependency.
- Do not add analytics events not listed in `docs/analytics-events.md`.
- **Do not scaffold anything outside v1 scope** (`docs/roadmap.md` §4). If a task implies feed, leaderboards, ranks, goals, reading branch or AI — stop and confirm.
- Russian UI strings live in `src/i18n/ru.ts`, never hardcoded in components.
- No `console.log` left in committed code.

---

## Reference documents

| File | Contains |
|---|---|
| `DESIGN.md` | tokens, light scale, components, what not to generate |
| `BUILD.md` | ordered task list — the work plan |
| `docs/roadmap.md` | v1 scope, phases, frozen decisions |
| `docs/onboarding-brief.md` | 22 screens, 16 questions, scoring formulas |
| `docs/task-library.md` | six ladders, two-number mechanic, safety filter |
| `docs/day1-14-and-goals.md` | day-by-day scenario, push schedule |
| `docs/analytics-events.md` | event names and properties |
| `docs/color-system.md` | full palette rationale |
| `docs/identity-and-motion.md` | light system, L0–L5, motion timings |
| `docs/splash-animation-spec.md` | splash animation, 60-segment ring |
