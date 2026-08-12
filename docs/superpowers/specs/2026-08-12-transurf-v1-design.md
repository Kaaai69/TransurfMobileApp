# Transurf v1 Design Specification

**Date:** 2026-08-12

**Status:** Approved in collaborative design review

**Platform:** Android-first, Expo SDK 54, React Native, TypeScript

**Implementation order:** Strictly follow `files (1)/BUILD.md`, one task and one focused commit at a time.

## 1. Product intent

Transurf is a Russian-language habit and routine application built around a non-punitive premise: progress does not burn after a missed day. It gives the user one durable core task, explains the evidence behind sourced tasks, and separates current state from accumulated experience.

The product must feel calm, precise, and adult. It must not resemble a motivational game, a medical diagnosis, or a science-fiction control panel.

The visual thesis is:

> Transurf looks like one precise line of light emerging from absolute darkness. Light communicates state and direction, but never becomes decoration for its own sake.

## 2. Authority and conflict resolution

When project materials conflict, use this priority:

1. Decisions explicitly approved in the 2026-08-12 design session.
2. `files (1)/CLAUDE.md` and `files (1)/BUILD.md` for the Expo implementation.
3. `files/DESIGN.md`, `files/identity-and-motion.md`, `files/color-system.md`, `files/roadmap.md`, and the other product reference documents.
4. The older Kotlin-specific instructions in `files/CLAUDE.md`; their product principles remain useful, but their native Android architecture does not apply.

Resolved conflicts:

- The onboarding contains **16 questions**, not 18. Progress is always `current / 16`.
- The product name is **Transurf**.
- Implementation follows `BUILD.md` in its published task order.
- The `Сегодня` micro-task slot is represented in architecture but hidden in v1. It becomes user-visible only after the complete content library is approved in a later scope.
- Inter 400/500 is the implementation font required by T02. A separate typography refinement will choose a more distinctive Cyrillic typeface later; it must not silently change T02 or add an unapproved dependency.

## 3. v1 scope

### Included

- First-launch welcome animation and shortened repeat launch.
- Twenty-two onboarding screens containing sixteen questions.
- Six calculated state values and weakest-link selection.
- One active core task, support tasks, and tier progression.
- Grace days: two in a rolling thirty-day window.
- Daily screen, missed-day screen, day-7 recalculation, and day-14 summary.
- Evidence/source screens with clickable DOI links.
- Notifications following the day 1–14 schedule.
- Approved analytics events with privacy restrictions.
- Paywall UI and RuStore billing stub; the first task remains free.
- Android release configuration and preview APK build.

### Excluded

- User feed, ranks, leaderboards, streams, or social competition.
- Goals and WOOP flows.
- The Mind/Load reading branch.
- Custom user tasks and their safety filter.
- The daily micro-task library and visible `Сегодня` slot.
- AI-generated plans or copy.
- iOS release work.

Excluded features must not appear as disabled tabs, empty cards, teaser copy, or visual placeholders in v1.

## 4. Launch experience

The source asset is `Light_arc_expanding_in_void_202608031404.mp4`. It must not be replaced by the two-second alternatives in `files/`.

### First launch

- Play the complete ten-second source animation once, before onboarding screen 1.
- Render it edge-to-edge on pure black, portrait-cropped around its central light action.
- Do not overlay a logo, title, loader, particles, or an additional ring.
- Use the approved seamless transition A: the final arc remains visible as the L1 lower bloom while the first line of onboarding text fades in with a 12 px upward offset.
- The animation is a welcome sequence rather than a fake loading indicator. App initialization happens in parallel.
- If video playback fails, show the last available frame and continue directly into transition A. The user is never trapped on the welcome screen.

### Repeat launches

- Use a derived 600 ms clip made from the final 600 ms of the same source video.
- The derived clip must not introduce new imagery or change its color treatment.
- End with the same seamless handoff into the destination screen.
- Respect reduced motion by showing the final frame and immediately revealing the destination.

## 5. Reference-image interpretation

The seven supplied reference images are a mood and composition reference, not production UI assets.

Use:

- a low arc or horizon against a large field of pure black;
- a single source of attention per screen;
- strong negative space;
- a thin bright line surrounded by controlled blue falloff;
- the sense of light beginning from a compact origin.

Adapt:

- star-like cores into compact non-radiating light cores;
- atmospheric wisps into smooth, deterministic gradients;
- wide arcs into component geometry defined in SVG.

Do not use:

- lens flares, stars, rays, particles, smoke, or haze;
- spirals and galaxy forms;
- multiple decorative lines competing on one screen;
- visual noise or baked bitmap light behind reading content.

All production glow is drawn by the shared `Glow` component. The supplied images do not become general backgrounds.

## 6. Visual system

### Color

The background is always `#000000`. Surface and content colors follow `files/DESIGN.md` exactly:

- `surface1 #0E0F14`
- `surface2 #161822`
- `surface3 #1F2230`
- `border #2A2E3C`
- `accent #4361FF`
- `accentBright #7C8FFF`
- `accentDeep #2A3AA8`
- `accentDim #141B3D`
- `onAccent #F0F2FF`
- `textPrimary #F2F1EF`
- `textSecondary #9096A8`
- `textMuted #656B7C`
- `warm #FFB86B`
- `warmDim #3A2617`
- `neutralDown #7C8296`

No red is used in any state. `accent` is a fill color; small accent text uses `accentBright`. Category color is always paired with an icon and label.

### Light

- L0: no light.
- L1: barely perceptible reading/question bloom.
- L2: supporting presence and daily ring.
- L3: active choice, focused control, or brief transition.
- L4: the single dominant object on a screen.
- L5: first-launch animation and day-60 closure only.

No screen contains more than one L4 element. Nothing pulses at rest. Warm light appears only in the closed list defined by `identity-and-motion.md`.

### Typography

T02 implements Inter in weights 400 and 500 only, using the exact scale in `DESIGN.md`. No component hardcodes a font family or weight.

The current typography is considered structurally correct but visually temporary. A later typography review will compare distinctive Cyrillic families against these constraints:

- calm rather than futuristic;
- complete Cyrillic support;
- readable at 11–17 px on OLED black;
- tabular numerals;
- two weights sufficient for the full hierarchy;
- no layout breakage at 320, 390, and 430 px widths.

The font change happens through theme tokens, not component edits.

### Layout and motion

- 4 px base grid and 8 px rhythm.
- 20 px screen padding, 12 px card gap, 32 px section gap.
- 16 px card radius, 12 px field radius, 8 px chip radius, pill action buttons.
- 52 px primary button and 44 px minimum touch target.
- No shadows or elevation. Depth comes from surface steps, hairlines, spacing, and the defined identity glow.
- Screen transition: 240 ms, 12 px offset plus fade.
- Ring draw: 900 ms with 80 ms sector stagger.
- Reduced motion skips to the final state.

## 7. Navigation and screen flow

### First launch

1. Complete welcome animation.
2. Screens 1–10: product position and manifesto.
3. Screens 11–17: sixteen questions grouped by subject.
4. Screen 18: real calculation stages.
5. Screen 19: six-value profile.
6. Screen 20: weakest link.
7. Screen 21: first task.
8. Screen 22: sources.
9. Paywall; the accepted first task remains available without purchase.
10. Daily screen.

Onboarding state persists after every answer and screen transition. Killing the application resumes at the last valid step with all answers intact.

### Repeat launch

1. Play the 600 ms repeat animation or reduced-motion final frame.
2. Show a due milestone screen only when day 3, 7, 11, or 14 requires it and it has not already been acknowledged.
3. Continue to the daily screen.

### Tabs

- `День`: daily ring, core task, and support.
- `Метод`: source list and evidence explanations.
- `Настройки`: notification and application settings, always L0.

The tab bar has three items only. It uses no glass, floating panel, or glow.

## 8. Hero daily screen

The daily screen is the visual reference for the rest of the application.

Top to bottom:

1. Day label, `Сегодня`, and XP.
2. L2 six-sector state ring with category key.
3. One L4 core-task card.
4. L1 support rows.
5. L0 three-item navigation.

The ring describes state but is not an action. The core card is the only strong focus and the only accent-filled primary action.

The core card contains:

- `ЯДРО` and `день N / 60` metadata;
- a task in `Если [якорь] — [действие]` form;
- one resistance-reducing subtitle;
- a two-pixel category progress line;
- a `Сделал` action;
- an information button only when `sourceDoi` is non-null.

The support section uses rows rather than competing cards. The `Сегодня` slot is not rendered in v1.

## 9. Component boundaries

- `ScreenShell`: owns pure-black canvas, safe areas, status bar treatment, and the one allowed screen-level `Glow`.
- `Glow`: the only implementation allowed to draw identity light; consumes level, form, temperature, and optional category color.
- `Ring`: renders state and habit modes from data; contains no persistence or scoring logic.
- `TaskCard`: renders a supplied task and emits user intent; contains no XP or state calculations.
- `AnswerOption`: renders selected and unselected answer states.
- `ProgressLine`: strictly linear visual progress.
- `Chip`: service/status labeling including the warm grace-day resource.
- Route screens: compose components, read view state, and dispatch application actions.

UI components receive tokens and typed data. They do not contain Russian literals, database calls, analytics event-name strings, or domain formulas.

## 10. Data and domain architecture

The application is local-first:

```text
route / component
  → typed application action
  → pure domain validation and calculation
  → repository transaction
  → SQLite + Drizzle
  → committed snapshot in Zustand
  → UI render and approved analytics event
```

Zustand is a hydrated UI/application-state view over persisted data, not a second database. SQLite is the source of truth for task, log, state, onboarding, and grace-day persistence.

### Domain modules

- `scoring`: sixteen answers to six clamped values and a weakest link.
- `drift`: done, skipped, and no-entry behavior over a rolling fourteen-day recalculation.
- `grace`: automatic consumption and restoration over a rolling thirty-day window.
- `tiers`: adherence and elapsed-time gates, plus monotonic XP awards.

### Atomic completion

A task completion performs one idempotent transaction:

1. Confirm the active task and that no log already exists for the same task and local date.
2. Write the task log.
3. Award non-negative XP.
4. Recalculate affected state values from the valid window.
5. Persist the resulting user state.
6. Return one committed snapshot for the store and UI.

A repeated tap cannot create a duplicate log or award XP twice.

### Product invariants

- `chainLength` is never reset to zero by a miss.
- XP never decreases under any event sequence.
- No entry drifts toward baseline more slowly than an explicit skip changes state.
- `sourceDoi = null` is valid and produces no information button.
- State values remain within 0–100.
- Goal, calorie, weight, portion, and fabricated medical metrics do not exist in v1 data models.

## 11. Failure behavior

Failure states use L0 or L1, calm language, and no red.

- Offline: all daily behavior remains available. DOI links explain that a connection is needed; analytics never blocks UI.
- Video failure: show the final welcome frame and continue into the approved transition.
- Notification permission denied: the daily loop remains complete; settings provides a route to system permissions.
- Database open or migration failure: show an L0 retry screen. Never delete or reset data automatically.
- Duplicate action: treat as an idempotent success without a second award.
- Missing DOI: omit the control rather than showing an error.
- Calculation failure: retain answers, show retry, and do not fabricate default scores.

## 12. Analytics and privacy

Only event names and properties listed in `analytics-events.md` are valid. Event definitions live in one typed module.

User-authored text is never sent. Only approved lengths, categories, identifiers, and numeric states may be included. The app must preserve the real `calcMs`; animation duration is never reported as calculation time.

No analytics provider dependency is added without explicit approval. The implementation exposes a typed analytics port and a persistent local queue so UI and domain work can be tested independently of a vendor choice.

## 13. Testing and verification

### Unit tests

- all-best and all-worst sixteen-answer scoring;
- caffeine/bedtime modifier;
- weakest-link tie-break order;
- clamping to 0–100;
- no-entry drift versus explicit skip;
- fourteen-day window recalculation;
- grace-day consumption and rolling restoration;
- chain never resetting;
- tier gate at 70% over fourteen days and at least twenty-one elapsed days;
- 500 randomized event sequences proving XP monotonicity.

### Integration tests

- SQLite migrations on a clean database;
- first-launch task seed and expected template count;
- transaction idempotency for repeated completion;
- persisted onboarding resume;
- state, XP, and log consistency after completion.

### Flow and device verification

- all twenty-two onboarding screens reachable with back navigation;
- question six conditional behavior;
- first and repeat launch routing;
- day 7, 11, and 14 milestone display-once behavior;
- DOI opening and missing-source behavior;
- layouts at 320, 390, and 430 px widths;
- minimum brightness in a dark room, outdoor legibility, large system text, and one-handed reach;
- reduced-motion behavior;
- `typecheck`, unit tests, lint, Expo Doctor, and Android preview build.

## 14. External inputs required later

These do not block foundation and domain tasks but must be supplied or approved before their corresponding build tasks can be accepted:

- the screen-1 narration audio asset for T15;
- the final price copy for T26;
- RuStore developer credentials/account for the publishable portion of T27;
- a specifically approved replacement typeface if typography changes before release.

No placeholder copy, invented price, synthetic DOI, or silent credential workaround is permitted.

## 15. Delivery discipline

Implementation proceeds through T01–T27 in `BUILD.md` order. Each task:

1. Re-reads the relevant source documents.
2. Starts with the required failing behavioral test where behavior is testable.
3. Implements only that task's accepted scope.
4. Runs the task's verification commands plus `npm run typecheck`.
5. Commits one focused change.
6. Reports the result before starting the next task.

Expo implementation must use the exact SDK 54 documentation at `https://docs.expo.dev/versions/v54.0.0/` before code is written.
