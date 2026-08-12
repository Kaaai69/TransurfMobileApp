# Transurf Stage A Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete BUILD tasks T02–T06 so Transurf has a typed visual system, one Russian copy source, a single SVG light identity layer, reusable foundation components, and both state and habit rings visible through the Expo QR preview.

**Architecture:** Values flow from flat typed theme modules into focused React Native components; no component owns raw design values or Russian copy. `Glow` is the sole renderer of light, while `Ring` delegates all geometry to pure helpers and all draw-on motion to Reanimated. During Stage A, `app/index.tsx` renders a development foundation gallery; T13 will replace this temporary entry with the approved launch flow.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19.1, Expo Router 6, strict TypeScript 5.9, `@expo-google-fonts/inter`, `react-native-svg` 15.12.1, Reanimated 4.1, Jest with `jest-expo`.

**Approved specification:** `docs/superpowers/specs/2026-08-12-transurf-v1-design.md`

## Global Constraints

- Execute T02, T03, T04, T05, and T06 in order; each task keeps its own RED/GREEN cycle, focused review, `BUILD.md` checkbox, and `T0N:` commit.
- Stop after T06. Do not create database, content seed, domain scoring, onboarding routing, launch video behavior, tabs, analytics, or any T07+ implementation.
- Background is always `#000000`; no red, shadows, elevation, emoji, exclamation marks, two-colour decorative gradients, glass, particles, haze, rays, or pulsing idle animation.
- All design values come from `src/theme/`, except SVG geometry constants that live beside the SVG implementation; components contain no raw colours, Russian strings, or ad-hoc layout/motion values.
- All Russian application text lives in `src/i18n/ru.ts`. Documentation is source material and is not included in the application-source Cyrillic scan.
- Inter weights are exactly 400 and 500. This implements the required temporary T02 font without deciding the later typography refinement.
- Onboarding is exactly 22 screens and 16 questions; progress is `current / 16` and strictly linear.
- Warm light remains restricted to the five approved product contexts. The foundation gallery demonstrates only cool light.
- One L4 element maximum per screen. L5 is shown only as an isolated identity-scale specimen in the development gallery, not as product UI.
- `Glow` is the only file that draws glow. Components may compose `Glow`, but may not create SVG gradients, shadows, or glow-like opacity layers themselves.
- The foundation gallery must remain calm and sparse: one vertical specimen flow, no dashboard chrome, no card mosaic, and no alternative visual direction.
- Reduced motion skips to final visual states.
- Verify each task with `npm run format`, `npm run typecheck`, `npm test -- --runInBand`, `npm run lint`, `npx expo-doctor`, `git diff --check`, and a `console.log` scan before committing.

---

## File Structure

### T02 — Theme

- Create `src/theme/colors.ts` — the complete flat colour contract from DESIGN §1.
- Create `src/theme/typography.ts` — Inter family names, allowed weights, and resolved React Native type styles from DESIGN §3.
- Create `src/theme/spacing.ts` — grid, rhythm, semantic gaps, radii, heights, and hairline from DESIGN §5.
- Create `src/theme/motion.ts` — durations, screen offset, easing descriptors, and reduced-motion final-state policy from DESIGN §7.
- Create `src/theme/index.ts` — public theme exports.
- Create `src/theme/theme.test.ts` — exact public token contract tests.
- Modify `app/_layout.tsx` — load only Inter 400 and 500 before rendering the stack.
- Modify `package.json`, `package-lock.json` — add `@expo-google-fonts/inter`; include `src` in formatting scripts.

### T03 — Copy

- Create `src/i18n/ru.ts` — typed common, category, onboarding, milestone, and foundation-preview copy.
- Create `src/i18n/ru.test.ts` — verify the consumer-visible 22-screen/16-question contract and milestone coverage.

### T04 — Light

- Create `src/light/levels.ts` — L0–L5 presets, form geometry, palette resolution, and exported light types.
- Create `src/light/levels.test.ts` — verify absence at L0 and monotonic intensity/blur behavior through L5.
- Create `src/light/Glow.tsx` — the only SVG gradient renderer in application source.
- Create `src/dev/FoundationGallery.tsx` — a scrollable, token-only specimen route beginning with six levels and four cool forms.
- Modify `app/index.tsx` — render the foundation gallery during Stage A.
- Modify `package.json`, `package-lock.json` — install SDK-compatible `react-native-svg`.

### T05 — Base components

- Create `src/components/AnswerOption.tsx` — default, selected, pressed, and disabled answer states.
- Create `src/components/ProgressLine.tsx` — clamped 0–1 progress with 400 ms strictly linear motion.
- Create `src/components/Chip.tsx` — neutral, accent, and warm semantic variants without internal copy.
- Create `src/components/ScreenShell.tsx` — safe-area black canvas plus screen-level `Glow`.
- Create `src/components/index.ts` — public component exports.
- Modify `src/dev/FoundationGallery.tsx` — add component states without introducing a competing visual hierarchy.

### T06 — Ring

- Create `src/components/ringGeometry.ts` — pure polar math, state arcs, habit segments, clamping, widths, label points, and fixed category order.
- Create `src/components/ringGeometry.test.ts` — behavioral geometry tests with hand-derived values.
- Create `src/components/Ring.tsx` — responsive SVG rendering and reduced-motion-aware Reanimated draw-on animation.
- Modify `src/components/index.ts` — export `Ring` and its public data types.
- Modify `src/dev/FoundationGallery.tsx` — add one state-ring specimen and one habit-ring specimen with a forgiven day.

## Public Interfaces

```ts
export const colors: Readonly<{
  canvas: '#000000';
  surface1: '#0E0F14';
  surface2: '#161822';
  surface3: '#1F2230';
  border: '#2A2E3C';
  accent: '#4361FF';
  accentBright: '#7C8FFF';
  accentDeep: '#2A3AA8';
  accentDim: '#141B3D';
  onAccent: '#F0F2FF';
  textPrimary: '#F2F1EF';
  textSecondary: '#9096A8';
  textMuted: '#656B7C';
  warm: '#FFB86B';
  warmDim: '#3A2617';
  neutralDown: '#7C8296';
  catSleep: '#8B7BFF';
  catEnergy: '#FFB020';
  catMovement: '#3DDC97';
  catFood: '#F4704E';
  catWater: '#22D3EE';
  catMind: '#DE7BD4';
}>;

export type GlowLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type GlowForm = 'bloom' | 'halo' | 'edge' | 'core';
export type GlowTemperature = 'cool' | 'warm';

export interface GlowProps {
  level: GlowLevel;
  form?: GlowForm;
  temperature?: GlowTemperature;
  color?: string;
}

export interface AnswerOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export interface ProgressLineProps {
  progress: number;
  color?: string;
  accessibilityLabel?: string;
}

export interface ChipProps {
  label: string;
  tone?: 'neutral' | 'accent' | 'warm';
}

export interface ScreenShellProps extends PropsWithChildren {
  level: GlowLevel;
  glowForm?: GlowForm;
}

export const ringCategoryOrder: readonly [
  'sleep',
  'energy',
  'movement',
  'food',
  'water',
  'mind',
];

export type StateRingValues = Record<(typeof ringCategoryOrder)[number], number>;
export type HabitDayStatus = 'done' | 'forgiven' | 'pending';

export type RingProps =
  | { mode: 'state'; values: StateRingValues; size?: number; animated?: boolean }
  | { mode: 'habit'; days: readonly HabitDayStatus[]; size?: number; animated?: boolean };
```

---

### Task 1: T02 — Theme tokens and Inter loading

**Files:** `src/theme/*`, `app/_layout.tsx`, `package.json`, `package-lock.json`, `BUILD.md`.

**Interfaces:** produces `colors`, `typography`, `spacing`, and `motion` from `@/src/theme`; later Stage A tasks consume these objects directly.

- [ ] **Step 1: Install the approved font package**

Run:

```bash
npx expo install @expo-google-fonts/inter
```

Expected: exit 0 and one new runtime dependency. Do not install another font family or any Inter weight package.

- [ ] **Step 2: Write the failing public-contract test**

Create `src/theme/theme.test.ts`:

```ts
import { colors, motion, spacing, typography } from './index';

describe('theme contract', () => {
  test('exposes the approved palette without a red token', () => {
    expect(colors).toEqual({
      canvas: '#000000', surface1: '#0E0F14', surface2: '#161822',
      surface3: '#1F2230', border: '#2A2E3C', accent: '#4361FF',
      accentBright: '#7C8FFF', accentDeep: '#2A3AA8', accentDim: '#141B3D',
      onAccent: '#F0F2FF', textPrimary: '#F2F1EF', textSecondary: '#9096A8',
      textMuted: '#656B7C', warm: '#FFB86B', warmDim: '#3A2617',
      neutralDown: '#7C8296', catSleep: '#8B7BFF', catEnergy: '#FFB020',
      catMovement: '#3DDC97', catFood: '#F4704E', catWater: '#22D3EE',
      catMind: '#DE7BD4',
    });
  });

  test('allows only Inter 400 and 500', () => {
    expect(typography.fonts).toEqual({
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
    });
    expect(typography.weights).toEqual({ regular: 400, medium: 500 });
  });

  test('preserves the layout and motion contracts consumed by components', () => {
    expect(spacing.screen).toBe(20);
    expect(spacing.heights.minTouch).toBe(44);
    expect(motion.ring).toEqual({ duration: 900, stagger: 80, easing: 'ease-out' });
    expect(motion.screen).toEqual({
      duration: 240,
      offsetY: 12,
      easing: [0.16, 1, 0.3, 1],
    });
  });
});
```

- [ ] **Step 3: Verify RED**

Run:

```bash
npm test -- src/theme/theme.test.ts --runInBand
```

Expected: FAIL because `src/theme/index.ts` does not exist.

- [ ] **Step 4: Implement exact typed tokens**

Create the five theme files. Use `as const` for every exported object. Resolve line-height ratios to React Native pixels:

```ts
export const typography = {
  fonts: { regular: 'Inter_400Regular', medium: 'Inter_500Medium' },
  weights: { regular: 400, medium: 500 },
  manifesto: { fontSize: 30, lineHeight: 37.5, fontFamily: 'Inter_400Regular' },
  screenTitle: { fontSize: 24, lineHeight: 31.2, fontFamily: 'Inter_500Medium' },
  task: { fontSize: 17, lineHeight: 24.65, fontFamily: 'Inter_400Regular' },
  metric: {
    fontSize: 32, lineHeight: 32, fontFamily: 'Inter_400Regular',
    fontVariant: ['tabular-nums'],
  },
  body: { fontSize: 15, lineHeight: 23.25, fontFamily: 'Inter_400Regular' },
  caption: { fontSize: 13, lineHeight: 19.5, fontFamily: 'Inter_400Regular' },
  label: {
    fontSize: 11, lineHeight: 13.2, fontFamily: 'Inter_500Medium',
    letterSpacing: 0.88, textTransform: 'uppercase',
  },
} as const;
```

`spacing.ts` contains `grid: 4`, `rhythm: 8`, `screen: 20`, `cardGap: 12`, `sectionGap: 32`, `hairline: 0.5`, radii `{ card: 16, field: 12, chip: 8, button: 999 }`, and heights `{ button: 52, field: 48, row: 56, minTouch: 44 }`.

`motion.ts` contains light appear/recede, completion up/down, screen, and ring values exactly from DESIGN §7, plus `progress: { duration: 400, easing: 'linear' }` required by T05.

- [ ] **Step 5: Load only two Inter weights at the root**

In `app/_layout.tsx`, import only `Inter_400Regular`, `Inter_500Medium`, and `useFonts` from `@expo-google-fonts/inter`. Throw the returned font error, return `null` while loading, and leave the existing black stack content style intact.

- [ ] **Step 6: Extend formatting scope and verify GREEN**

Add `src` to both format scripts, then run:

```bash
npm run format:write
npm test -- src/theme/theme.test.ts --runInBand
npm run typecheck
npm run lint
```

Expected: theme suite PASS; TypeScript and lint exit 0.

- [ ] **Step 7: Complete and commit T02**

Mark only T02 `[x]` in `BUILD.md`, run the Global Constraints gate, then:

```bash
git add BUILD.md app/_layout.tsx package.json package-lock.json src/theme
git commit -m "T02: add typed theme tokens and Inter"
```

---

### Task 2: T03 — Typed Russian copy source

**Files:** `src/i18n/ru.ts`, `src/i18n/ru.test.ts`, `BUILD.md`.

**Interfaces:** produces `ru`, `RuCopy`, `OnboardingScreenId`, `OnboardingQuestionId`, and category keys; later screens consume strings without literals.

- [ ] **Step 1: Write the failing structure test**

Create `src/i18n/ru.test.ts`:

```ts
import { ru } from './ru';

describe('Russian copy contract', () => {
  test('covers the complete onboarding flow and honest question count', () => {
    expect(Object.keys(ru.onboarding.screens)).toHaveLength(22);
    expect(ru.onboarding.questions).toHaveLength(16);
    expect(ru.onboarding.totalQuestions).toBe(16);
    expect(ru.onboarding.progress(7)).toBe('7 / 16');
  });

  test.each([3, 7, 11, 14] as const)('contains milestone day %s', (day) => {
    expect(ru.milestones[day].title.length).toBeGreaterThan(0);
    expect(ru.milestones[day].body.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Verify RED**

Run `npm test -- src/i18n/ru.test.ts --runInBand`.

Expected: FAIL because `src/i18n/ru.ts` does not exist.

- [ ] **Step 3: Implement the typed copy tree**

Use this root shape:

```ts
export type OnboardingScreenId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
  11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22;
export type OnboardingQuestionId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
  9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

type CopyBlock = Readonly<{
  title?: string;
  body: readonly string[];
  primaryAction?: string;
  secondaryAction?: string;
}>;

type OnboardingQuestionCopy = Readonly<{
  id: OnboardingQuestionId;
  screen: 11 | 12 | 13 | 14 | 15 | 16 | 17;
  prompt: string;
  options?: readonly string[];
  control: 'single' | 'time' | 'number';
}>;

type RuCopyShape = Readonly<{
  common: Readonly<{ continue: string; later: string }>;
  categories: Record<'sleep' | 'energy' | 'movement' | 'food' | 'water' | 'mind', string>;
  onboarding: Readonly<{
    totalQuestions: 16;
    progress: (current: number) => string;
    screens: Record<OnboardingScreenId, CopyBlock>;
    questions: readonly OnboardingQuestionCopy[];
  }>;
  milestones: Record<3 | 7 | 11 | 14, CopyBlock>;
  foundation: Readonly<{
    title: string; levels: string; forms: string; components: string;
    rings: string; selected: string;
  }>;
}>;
```

Define an exported `ru` object with `as const satisfies RuCopyShape`, then export `RuCopy = typeof ru`, using every required key in the schema. Copy the user-facing text for screens 1–22 and questions 1–16 from the identically numbered sections in `docs/onboarding-brief.md`; copy day 3, 7, 11, and 14 user-facing blocks from `docs/day1-14-and-goals.md`. Use `common: { continue: 'Продолжить', later: 'Позже' }`, the six category labels from screen 6, and foundation labels `{ title: 'Система света', levels: 'Уровни', forms: 'Формы', components: 'Компоненты', rings: 'Кольца', selected: 'Выбрано' }`. Do not copy editorial commentary, analytics targets, forbidden examples, fabricated sample category values, or excluded goal/micro-task UI into the application object.

- [ ] **Step 4: Verify GREEN and source-language boundary**

Run:

```bash
npm test -- src/i18n/ru.test.ts --runInBand
npm run typecheck
rg -n '[А-Яа-яЁё]' app src --glob '*.{ts,tsx}' --glob '!src/i18n/ru.ts'
```

Expected: tests/typecheck pass and the Cyrillic scan prints nothing.

- [ ] **Step 5: Complete and commit T03**

Mark T03 `[x]`, run the full gate, then:

```bash
git add BUILD.md src/i18n
git commit -m "T03: centralize typed Russian copy"
```

---

### Task 3: T04 — Single SVG Glow identity layer

**Files:** `src/light/levels.ts`, `src/light/levels.test.ts`, `src/light/Glow.tsx`, `src/dev/FoundationGallery.tsx`, `app/index.tsx`, dependency files, `BUILD.md`.

**Interfaces:** produces `Glow`, `glowLevels`, `glowForms`, and `resolveGlowPalette`; T05 and T06 may compose `Glow` but draw no gradients themselves.

- [ ] **Step 1: Install SVG support**

Run `npx expo install react-native-svg`.

Expected: SDK 54 selects `react-native-svg` 15.12.1-compatible range.

- [ ] **Step 2: Write failing level behavior tests**

Create `src/light/levels.test.ts`:

```ts
import { glowLevels, resolveGlowPalette } from './levels';

describe('light scale', () => {
  test('L0 produces no visible palette', () => {
    expect(resolveGlowPalette('L0', 'cool')).toBeNull();
  });

  test('visible levels grow brighter while their falloff tightens', () => {
    const visible = ['L1', 'L2', 'L3', 'L4', 'L5'] as const;
    expect(visible.map((level) => glowLevels[level].alpha)).toEqual([0.08, 0.15, 0.25, 0.4, 0.55]);
    expect(visible.map((level) => glowLevels[level].blur)).toEqual([60, 48, 36, 24, 16]);
  });

  test('a category override changes the halo but not the light core', () => {
    expect(resolveGlowPalette('L4', 'cool', '#8B7BFF')).toMatchObject({
      core: '#F0F2FF',
      halo: '#8B7BFF',
      alpha: 0.4,
    });
  });
});
```

- [ ] **Step 3: Verify RED**

Run `npm test -- src/light/levels.test.ts --runInBand`.

Expected: FAIL because `levels.ts` is missing.

- [ ] **Step 4: Implement presets, geometry, and palette resolution**

`levels.ts` contains all L0–L5 values, SVG viewBox constants, gradient stop offsets, and four geometry objects. L1 uses alpha `0.08`, the midpoint of its approved 0.06–0.10 range. `resolveGlowPalette` returns `null` for L0; cool uses `onAccent → accentBright → halo override/accent`; warm uses `onAccent → warm → warmDim` and is not used in the gallery.

- [ ] **Step 5: Implement the only gradient renderer**

`Glow.tsx` uses `Svg`, `Defs`, `RadialGradient`, `Stop`, `Rect`, `Ellipse`, and `Circle`. Generate unique gradient IDs with `useId`, render `null` for L0, set `pointerEvents="none"`, fill the parent absolutely, and choose geometry only from `levels.ts`. No other file in `app/` or `src/` may import `RadialGradient`.

- [ ] **Step 6: Build the initial gallery and QR entry**

Create `FoundationGallery` with a black `ScrollView`, one title, six restrained level rows, and a 2×2 form section. All labels come from `ru.foundation`; all layout/type/colour values come from tokens. Replace the blank `app/index.tsx` body with the gallery export.

- [ ] **Step 7: Verify and commit T04**

Run focused tests and the full gate. Also run:

```bash
rg -n 'RadialGradient|LinearGradient' app src --glob '*.{ts,tsx}'
```

Expected: `RadialGradient` appears only in `src/light/Glow.tsx`; `LinearGradient` has no result. Mark T04 `[x]` and commit:

```bash
git add BUILD.md app/index.tsx package.json package-lock.json src/dev src/light
git commit -m "T04: build the L0-L5 glow identity layer"
```

---

### Task 4: T05 — Token-only base components

**Files:** `src/components/AnswerOption.tsx`, `ProgressLine.tsx`, `Chip.tsx`, `ScreenShell.tsx`, `index.ts`, `src/dev/FoundationGallery.tsx`, `BUILD.md`.

**Interfaces:** produces the four component prop contracts listed above; T06 gallery content renders inside `ScreenShell`.

- [ ] **Step 1: Implement `ScreenShell` and `AnswerOption` from their public contracts**

`ScreenShell` wraps `SafeAreaView` and content in the black canvas, renders exactly one screen-level `Glow`, and applies `spacing.screen`. `AnswerOption` is a `Pressable` with 56 px height, 12 px field radius, token borders/background/type, 44 px minimum touch behavior, and a composed L3 `Glow form="edge"` only when selected. Pressed state uses `surface3`; disabled state lowers opacity without changing semantics.

- [ ] **Step 2: Implement linear `ProgressLine`**

Clamp incoming progress to 0–1. Use `useSharedValue`, `withTiming`, `Easing.linear`, and `useReducedMotion`; reduced motion assigns the final width immediately. The 2 px track uses `border`, the fill uses the supplied colour or `accent`, and a composed `Glow form="edge" level="L2"` supplies the only light.

- [ ] **Step 3: Implement `Chip`**

Neutral uses `surface3/textSecondary`, accent uses `accentDim/accentBright`, and warm uses `warmDim/warm`. The component owns no text and renders no icon/color-only category meaning.

- [ ] **Step 4: Add all states to the foundation gallery**

Show one default answer, one selected answer, one disabled answer, two progress positions, and three chips. Use local boolean state only for the selected preview. Keep the gallery cool except the isolated warm semantic chip required to verify the approved variant.

- [ ] **Step 5: Verify source discipline and commit T05**

Run:

```bash
rg -n '#[0-9A-Fa-f]{3,8}|[А-Яа-яЁё]' src/components --glob '*.{ts,tsx}'
rg -n 'shadowColor|elevation|RadialGradient|LinearGradient' src/components --glob '*.{ts,tsx}'
```

Expected: both scans print nothing. Run the full gate, mark T05 `[x]`, and commit:

```bash
git add BUILD.md src/components src/dev/FoundationGallery.tsx
git commit -m "T05: add token-only base components"
```

---

### Task 5: T06 — State and habit rings

**Files:** `src/components/ringGeometry.ts`, `ringGeometry.test.ts`, `Ring.tsx`, `index.ts`, `src/dev/FoundationGallery.tsx`, `BUILD.md`.

**Interfaces:** produces `Ring`, `StateRingValues`, `HabitDayStatus`, state/habit geometry helpers, and the fixed category order.

- [ ] **Step 1: Write failing geometry tests**

Create `src/components/ringGeometry.test.ts`:

```ts
import {
  buildHabitSegments,
  buildStateSectors,
  mapStateValueToRadius,
  ringCategoryOrder,
} from './ringGeometry';

describe('ring geometry', () => {
  test('maps the state boundary values to the approved radial range', () => {
    expect(mapStateValueToRadius(-10)).toBe(35);
    expect(mapStateValueToRadius(0)).toBe(35);
    expect(mapStateValueToRadius(50)).toBe(70);
    expect(mapStateValueToRadius(100)).toBe(105);
    expect(mapStateValueToRadius(140)).toBe(105);
  });

  test('keeps the fixed clockwise category order and four-degree gaps', () => {
    const sectors = buildStateSectors({
      sleep: 10, energy: 20, movement: 30,
      food: 40, water: 50, mind: 60,
    });
    expect(ringCategoryOrder).toEqual(['sleep', 'energy', 'movement', 'food', 'water', 'mind']);
    expect(sectors.map(({ startAngle, endAngle }) => [startAngle, endAngle])).toEqual([
      [-88, -32], [-28, 28], [32, 88], [92, 148], [152, 208], [212, 268],
    ]);
  });

  test('keeps forgiven habit days on-path and only changes their width', () => {
    const [done, forgiven] = buildHabitSegments(['done', 'forgiven']);
    expect(done.path).not.toBe(forgiven.path);
    expect(done.strokeWidth).toBe(6);
    expect(forgiven.strokeWidth).toBe(2.5);
    expect(forgiven.startAngle - done.endAngle).toBe(0);
  });
});
```

- [ ] **Step 2: Verify RED**

Run `npm test -- src/components/ringGeometry.test.ts --runInBand`.

Expected: FAIL because `ringGeometry.ts` does not exist.

- [ ] **Step 3: Implement pure geometry**

Use a `260×260` viewBox centered at `(130,130)`. State sectors span 56° with 4° between them and start at −88° so the first 4° gap is centered on the top axis. Map values linearly with `35 + clamp(value, 0, 100) × 0.7`. Habit segments use an unbroken 6° sequence; all statuses use identical radial path logic, with widths `6` for done/pending and `2.5` for forgiven. Pending segments use the border token when rendered.

- [ ] **Step 4: Implement responsive animated `Ring`**

Render state sectors in fixed category colours and habit segments on one fixed radius. Use `Animated.createAnimatedComponent(Path)`, `strokeDasharray`, and animated `strokeDashoffset`; state sectors animate for 900 ms with 80 ms index delay, while habit segments use the same 900 ms draw window. `useReducedMotion` and `animated={false}` render final offsets immediately. Add one overall L2 `Glow form="halo"`; do not draw per-sector gradients.

For state labels, use external labels when `size > 320` and compact labels inside their sector when `size <= 320`. Every label contains category text from `ru.categories` plus its numeric value, so category colour is never the only meaning carrier.

- [ ] **Step 5: Add both ring modes to the gallery**

Use one six-value state fixture and a 60-day habit fixture containing at least one `forgiven`, one `pending`, and multiple `done` days. Keep fixtures outside the component file in `FoundationGallery.tsx`.

- [ ] **Step 6: Verify GREEN, visual output, and source discipline**

Run the focused geometry test and full gate. Start Expo with cache cleared and inspect the web build at widths 320, 390, and 430; verify no horizontal clipping, readable compact labels at 320, one thin forgiven segment with no angular gap, no warning overlay, and the intentionally subdued L1.

Then run:

```bash
rg -n 'RadialGradient|LinearGradient|shadowColor|elevation' src/components/Ring.tsx
```

Expected: no result.

- [ ] **Step 7: Complete Stage A and commit T06**

Mark T06 `[x]` and commit:

```bash
git add BUILD.md src/components src/dev/FoundationGallery.tsx
git commit -m "T06: add animated state and habit rings"
```

Stop before T07. Report all five commit hashes, automated gate results, browser/device preview status, and the remaining physical-dark-room acceptance for the user to confirm via QR.

---

## Plan Self-Review

- Spec coverage: T02–T06 files, exact design values, Inter weights, 22/16 copy contract, single Glow ownership, all component states, both ring modes, category order, forgiven width, motion, reduced motion, 320 px compact mode, QR-visible gallery, checks, and commits all map to explicit steps.
- Scope boundary: no T07 database or later behavior is created; the gallery is explicitly temporary and replaced by T13.
- Test quality: tests cover public token contracts and copy shape where BUILD makes those exact contracts observable, plus non-trivial palette and ring geometry behavior; UI framework mechanics are verified visually rather than through mocks.
- Type consistency: all consumer interfaces are declared once in Public Interfaces and used under the same names in later tasks.
- Forbidden-marker scan: every implementation action has concrete files, values, commands, and expected outcomes; no unspecified production behavior remains.
