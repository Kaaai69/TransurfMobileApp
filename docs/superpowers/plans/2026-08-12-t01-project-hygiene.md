# Transurf T01 Project Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the generated Expo SDK 54 starter into a clean, strict, testable Transurf repository that satisfies BUILD T01 and is ready for T02 without retaining demo UI or contradictory active instructions.

**Architecture:** Keep only the smallest valid Expo Router shell: a root stack and an intentionally blank index route. Project tooling is configured through package scripts, `jest-expo`, Expo's flat ESLint preset with Prettier integration, and strict TypeScript; human reference material is moved into one authoritative documentation layout, while the obsolete Kotlin brief is preserved only as an explicitly archived source.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19.1, Expo Router 6, TypeScript 5.9 strict mode, Jest with `jest-expo`, ESLint 9 flat config, Prettier.

## Global Constraints

- Execute only BUILD T01 in this pass; after its verification and commit, report and stop before T02.
- Use Expo SDK 54 versioned guidance and install compatible packages through `npx expo install`.
- The app is Android-first, Russian-language, and named `Transurf`.
- Onboarding has exactly 16 questions and progress is always `current / 16`; any older 18-question statement is a non-authoritative draft.
- The welcome source is `Light_arc_expanding_in_void_202608031404.mp4`; the two-second videos remain reference inputs and are not production replacements.
- Inter 400/500 remains the required T02 font; this T01 plan does not introduce fonts or UI tokens.
- Do not add application UI, theme tokens, domain logic, analytics, database schema, or dependencies belonging to T02 and later.
- Do not leave `console.log` in committed code.
- Preserve every user-supplied media and spreadsheet source; T01 only relocates Markdown references and removes generated Expo demo artifacts.
- Finish with one focused commit whose message starts with `T01:` and mark only T01 complete in `BUILD.md` after every acceptance command passes.

---

## File Structure

### Files to create

- `app/index.tsx` — the temporary blank route required for a valid Expo Router app until T13 owns the launch experience.
- `.prettierrc` — formatting decisions for project code and config.
- `DESIGN.md` — authoritative design source relocated from `files/DESIGN.md`.
- `BUILD.md` — authoritative ordered build source relocated from `files (1)/BUILD.md`, with only approved decision corrections and T01 progress applied.
- `docs/archive/legacy-kotlin-project-context.md` — non-authoritative preservation of the old native Kotlin brief.
- `docs/analytics-events.md`
- `docs/color-system.md`
- `docs/day1-14-and-goals.md`
- `docs/design-concept.md`
- `docs/design-flow.md`
- `docs/identity-and-motion.md`
- `docs/onboarding-brief.md`
- `docs/roadmap.md`
- `docs/splash-animation-spec.md`
- `docs/task-library.md`

### Files to replace or modify

- `CLAUDE.md` — replace the one-line pointer with the Expo project instructions from `files (1)/CLAUDE.md`, then align its name and question count with the approved design specification.
- `app/_layout.tsx` — replace template theme/tabs/modal wiring with a minimal root stack.
- `app.json` — replace template identity with Transurf and make the native splash canvas black without adding release-only identifiers.
- `package.json` — remove the demo reset command, add tooling scripts and the `jest-expo` preset, and use the `transurf` package name.
- `package-lock.json` — regenerate through Expo-compatible dependency installation.
- `eslint.config.js` — integrate Prettier with the existing Expo flat config.
- `README.md` — replace create-expo-app copy with a concise Transurf repository guide.
- `docs/superpowers/specs/2026-08-12-transurf-v1-design.md` — update material paths after relocation; do not change approved product decisions.

### Generated starter files to delete

- `app/(tabs)/_layout.tsx`
- `app/(tabs)/explore.tsx`
- `app/(tabs)/index.tsx`
- `app/modal.tsx`
- `components/external-link.tsx`
- `components/haptic-tab.tsx`
- `components/hello-wave.tsx`
- `components/parallax-scroll-view.tsx`
- `components/themed-text.tsx`
- `components/themed-view.tsx`
- `components/ui/collapsible.tsx`
- `components/ui/icon-symbol.ios.tsx`
- `components/ui/icon-symbol.tsx`
- `constants/theme.ts`
- `hooks/use-color-scheme.ts`
- `hooks/use-color-scheme.web.ts`
- `hooks/use-theme-color.ts`
- `scripts/reset-project.js`
- `assets/images/partial-react-logo.png`
- `assets/images/react-logo.png`
- `assets/images/react-logo@2x.png`
- `assets/images/react-logo@3x.png`

### Interfaces

- Consumes: Expo Router's `Stack` component and `expo-status-bar`'s `StatusBar` component.
- Produces: `RootLayout(): React.JSX.Element`, `IndexScreen(): React.JSX.Element`, `npm run typecheck`, `npm test`, `npm run lint`, `npm run format`, and root-level authoritative `CLAUDE.md`, `DESIGN.md`, `BUILD.md`.
- Deliberately produces no product component or domain API; T02 starts from this clean boundary.

---

### Task 1: Complete BUILD T01 as one reviewable hygiene change

**Files:** all files enumerated in the File Structure section above.

**Interfaces:** use and produce exactly the interfaces listed above.

- [ ] **Step 1: Re-read the task authorities and record the failing acceptance baseline**

Read:

```bash
sed -n '1,180p' CLAUDE.md
sed -n '1,240p' files/DESIGN.md
sed -n '1,45p' 'files (1)/BUILD.md'
```

Run:

```bash
npm run typecheck
npm test
```

Expected RED result before implementation: both commands exit non-zero with `Missing script: "typecheck"` and `Missing script: "test"`. These failures exercise the actual acceptance boundary rather than asserting configuration source text.

- [ ] **Step 2: Install only the T01 tooling through Expo's SDK-aware installer**

Run:

```bash
npx expo install jest-expo jest @types/jest --dev
npx expo install prettier eslint-config-prettier eslint-plugin-prettier --dev
```

Expected: both commands exit 0, `package-lock.json` changes, and the six packages appear in `devDependencies` at versions compatible with Expo SDK 54.

- [ ] **Step 3: Configure scripts, Jest, Prettier, and ESLint**

Update the relevant `package.json` sections to this exact shape while preserving the existing runtime dependencies:

```json
{
  "name": "transurf",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "typecheck": "tsc --noEmit",
    "test": "jest --passWithNoTests",
    "format": "prettier --check app package.json tsconfig.json eslint.config.js .prettierrc",
    "format:write": "prettier --write app package.json tsconfig.json eslint.config.js .prettierrc"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

Create `.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

Replace `eslint.config.js` with:

```js
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*'],
  },
]);
```

Keep the existing `tsconfig.json` strict configuration unchanged because it already extends `expo/tsconfig.base` and sets `compilerOptions.strict` to `true`.

- [ ] **Step 4: Replace the generated demo application with the minimal router shell**

Replace `app/_layout.tsx` with:

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </>
  );
}
```

Create `app/index.tsx`:

```tsx
import { View } from 'react-native';

export default function IndexScreen() {
  return <View />;
}
```

Delete every generated starter file listed under “Generated starter files to delete”. Remove directories only after their listed contents are gone. Do not delete the icon, adaptive-icon, favicon, or splash-icon placeholders because later Android packaging tasks still reference them.

- [ ] **Step 5: Normalize project identity without starting release configuration**

Apply these exact `app.json` value changes and preserve all other Expo SDK 54 settings:

```json
{
  "expo": {
    "name": "Transurf",
    "slug": "transurf",
    "scheme": "transurf",
    "userInterfaceStyle": "dark",
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#000000"
      }
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#000000",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ]
  }
}
```

Do not set `android.package`, version codes, permissions, or RuStore fields in T01; those belong to T27.

Replace `README.md` with this exact repository-facing content:

```markdown
# Transurf

Android-first habit and routine application built with Expo SDK 54, Expo Router, React Native, and strict TypeScript.

## Commands

\`\`\`bash
npm install
npm run typecheck
npm test
npm run lint
npm run format
npx expo start -c
\`\`\`

## Sources of truth

- `CLAUDE.md` — project invariants and working rules
- `DESIGN.md` — visual system
- `BUILD.md` — ordered implementation tasks
- `docs/superpowers/specs/2026-08-12-transurf-v1-design.md` — approved product and interaction decisions

Work on one `BUILD.md` task at a time, verify it, commit it, report it, and stop.
```

- [ ] **Step 6: Relocate and disambiguate every Markdown reference**

Use this exact mapping, preserving file contents unless a correction is explicitly listed below:

```text
files (1)/CLAUDE.md          -> CLAUDE.md
files/DESIGN.md              -> DESIGN.md
files (1)/BUILD.md           -> BUILD.md
files/CLAUDE.md              -> docs/archive/legacy-kotlin-project-context.md
files/analytics-events.md    -> docs/analytics-events.md
files/color-system.md        -> docs/color-system.md
files/day1-14-and-goals.md   -> docs/day1-14-and-goals.md
files/design-concept.md      -> docs/design-concept.md
files/design-flow.md         -> docs/design-flow.md
files/identity-and-motion.md -> docs/identity-and-motion.md
files/onboarding-brief.md    -> docs/onboarding-brief.md
files/roadmap.md             -> docs/roadmap.md
files/splash-animation-spec.md -> docs/splash-animation-spec.md
files/task-library.md        -> docs/task-library.md
```

After relocation, apply only these approved consistency corrections:

- `CLAUDE.md`: name the product Transurf; replace the three product-count occurrences of `18 answers/questions` with `16`; keep typography references such as `18px` unchanged.
- `BUILD.md` T09 and T16: replace the onboarding input count and progress denominator with `16`; do not rename screens 18–22 because those are screen numbers.
- `BUILD.md` T13: require the complete `Light_arc_expanding_in_void_202608031404.mp4` on first launch and a derived final 600 ms clip on repeat launch; remove the conflicting `splash_2s_square.mp4` and “cut it short when data is ready” requirements.
- `docs/onboarding-brief.md`: add a top implementation note that the preserved content draft contains 18 source questions, while the approved build uses 16 and the approved design specification/root `BUILD.md` take precedence.
- `docs/roadmap.md`: replace the three product-count statements `18 вопросов` with `16 вопросов`; do not alter years, citations, screen numbers, or pixel values.
- `docs/superpowers/specs/2026-08-12-transurf-v1-design.md`: replace all stale `files/` and `files (1)/` Markdown references with their new root or `docs/` paths.
- `docs/archive/legacy-kotlin-project-context.md`: add a first-line archive warning stating that it is non-authoritative and retained only for historical product context.

Do not rewrite the research documents, formulas, or copy in this task. T09 and T16 will reconcile the exact 16-question scoring/content mapping in their own test-driven plans.

- [ ] **Step 7: Format the files owned by T01**

Run:

```bash
npm run format:write
npm run format
```

Expected: the write command exits 0; the check command exits 0 with `All matched files use Prettier code style!`.

- [ ] **Step 8: Run the complete T01 verification gate**

Run in this order:

```bash
npm run typecheck
npm test -- --runInBand
npm run lint
npx expo-doctor
rg -n 'console\.log' app components constants hooks scripts --glob '*.{ts,tsx,js}' 2>/dev/null || true
find files 'files (1)' -maxdepth 1 -name '*.md' -print 2>/dev/null
git diff --check
git status --short
```

Expected:

- TypeScript exits 0 with no diagnostics.
- Jest exits 0, loads the `jest-expo` preset, and reports no tests found without treating that empty-suite state as an error.
- ESLint exits 0 with no warnings or errors.
- Expo Doctor reports all checks passed.
- The `console.log` scan prints no source match; missing deleted directories may emit nothing because stderr is redirected.
- The Markdown search prints nothing because all source Markdown files have been relocated.
- `git diff --check` prints nothing.
- `git status --short` contains only the intended T01 repository baseline and hygiene changes; `.expo`, `node_modules`, `.superpowers`, and native generated directories remain ignored.

If a verification command fails, fix only the demonstrated T01 cause and rerun the entire gate from `npm run typecheck`.

- [ ] **Step 9: Mark T01 complete only after the green gate**

Change exactly this line in root `BUILD.md`:

```markdown
### [x] T01 — Project hygiene
```

Run the core acceptance gate once more:

```bash
npm run typecheck && npm test -- --runInBand && npm run lint && git diff --check
```

Expected: exit 0.

- [ ] **Step 10: Commit T01 and stop**

Review the staged scope before committing:

```bash
git add .
git diff --cached --stat
git diff --cached --check
git commit -m "T01: establish project hygiene"
git status --short
```

Expected: the commit succeeds; `git status --short` is empty. Report the commit hash, verification results, and the one archived legacy document. Do not begin, plan, or scaffold T02 in the same execution pass.

---

## Plan Self-Review

- Spec coverage: T01 strict TypeScript, the `typecheck` command, Jest with `jest-expo`, Prettier, ESLint, reference relocation, empty-project acceptance, one-task commit, and stop boundary are all mapped to explicit steps.
- Approved-delta coverage: Transurf naming, 16-question count, and the `Light_arc...` launch source are normalized only in active instructions; no later feature is implemented.
- Forbidden-marker scan: complete; every action has concrete paths, commands, expected output, and code where code changes are required.
- Interface consistency: `RootLayout` and `IndexScreen` have one definition each; all package script names are identical in configuration and verification commands.
- Scope control: T02 tokens/font work, T03 copy, T04 glow, T07 data, and T13 launch playback remain untouched.
