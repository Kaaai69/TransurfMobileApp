# CLAUDE.md

Project context. Read before any task in this repo.

---

## What this is

Native Android app (Kotlin + Jetpack Compose). A habit/routine tracker built on an explicitly non-punitive, evidence-cited approach. Russian-language UI, Android-first, distributed via RuStore.

## Design system — mandatory

**`DESIGN.md` in the repo root is the source of truth for all UI.** Read it before writing or modifying any composable. Never improvise colours, spacing, type sizes or motion values — take them from the tokens.

Hard rules that are easy to break by accident:

- Background is `#000000`. Never grey, never near-black.
- **No red anywhere.** Not for errors, not for failures, not for negative deltas.
- No `MaterialTheme` colour scheme. No default `Card`, `Button`, `Surface` elevation, or ripple tint. Custom theme only.
- No shadows. Depth = surface step + 0.5dp border + spacing.
- No emoji. No exclamation marks in copy.
- Only Inter weights 400 and 500.
- Blue `#4361FF` for fills only; text under 18sp uses `#7C8FFF`.

If a task seems to require breaking one of these, stop and ask instead of improvising.

---

## Product invariants

These come from product decisions, not preference. Changing them breaks the product's positioning.

1. **The chain never breaks.** Streaks do not burn. A missed day consumes a "grace day" (2 per rolling 30). When grace days run out, the chain still does not reset — only the wording changes.
2. **Two separate numbers.** `state` (six categories, 0–100, can fall) and `xp` (level, never decreases, ever). Never merge them.
3. **XP is never deducted.** Any code path that subtracts XP is a bug.
4. **State falls from recorded behaviour, not from a missing checkmark.** No entry for a day = slow drift toward baseline, not a penalty.
5. **Tasks are always `Если [anchor] — [action]`**, first-person present-tense verb.
6. **`sourceDoi` may be null.** That is a valid state meaning "no research backs this task". The info button renders only when it is non-null. Never invent a DOI or a citation.
7. **No fabricated metrics.** No "genetic potential", no invented percentages, no comparison to an "average user" without a real sample size.
8. **Never generate calorie counts, weight targets or portion sizes** in task content or anywhere else.

---

## Repo layout

```
app/src/main/java/<pkg>/
  ui/theme/          Color.kt, Type.kt, Spacing.kt, Theme.kt   ← tokens, mirrors DESIGN.md
  ui/light/          Glow.kt — L0..L5 presets, the identity layer
  ui/components/     TaskCard, Ring, AnswerOption, ProgressLine, Chip
  ui/screens/        splash, onboarding, daily, result, missed, sources, paywall
  data/              entities, dao, repository (Room)
  domain/            scoring, tiers, grace days, adherence
  content/           task templates seeded from content-tasks.xlsx
```

`ui/light/Glow.kt` is the most important file in the project. Six presets (L0–L5), radial `Brush` gradients, core warmer than halo. Every screen uses it; nothing else draws glow.

---

## Commands

```bash
./gradlew assembleDebug          # build
./gradlew installDebug           # install to connected device
./gradlew test                   # unit tests
./gradlew lint                   # lint
adb shell am start -n <pkg>/.MainActivity
```

Run `assembleDebug` after any change to composables and fix compilation errors before reporting done.

---

## Testing priorities

Unit tests are required for domain logic, not for UI:

- scoring from the 18 onboarding answers
- state drift when a day has no entry
- grace day consumption and the rolling 30-day window
- tier unlock (adherence ≥ 70% over 14 days AND ≥ 21 days elapsed)
- **a test asserting XP never decreases across any sequence of events**

---

## Working style

- Small commits, one concern each.
- Ask before adding a dependency.
- Do not add analytics events not listed in `analytics-events.md`.
- Do not scaffold features outside the v1 scope in `roadmap.md` part 4. If a task implies feed, leaderboards, ranks, goals or AI — stop and confirm; those are later versions.
- Russian UI strings go in `strings.xml`, never hardcoded in composables.

---

## Reference documents

| File | Contains |
|---|---|
| `DESIGN.md` | tokens, light scale, components, what not to generate |
| `roadmap.md` | v1 scope, phases, frozen decisions |
| `onboarding-brief.md` | 22 screens, 18 questions, scoring formulas |
| `task-library.md` | six ladders, two-number mechanic, safety filter |
| `day1-14-and-goals.md` | day-by-day scenario, push schedule |
| `analytics-events.md` | event names and properties |
| `color-system.md` | full palette rationale |
| `identity-and-motion.md` | light system, L0–L5, motion timings |
| `splash-animation-spec.md` | splash animation, 60-segment ring |
