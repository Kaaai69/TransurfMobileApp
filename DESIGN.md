# DESIGN.md

Design system for a dark mobile habit/routine app. Feed this file to Stitch, Claude Code, Cursor or any MCP-connected agent before generating screens.

UI copy is in Russian. This spec is in English for reliable instruction-following.

---

## 0. Non-negotiables

Read these first. Violating any of them breaks the product.

1. Background is pure black `#000000`. Never grey, never near-black.
2. **No red anywhere.** Not for errors, not for failure, not for negative deltas. Use `#FFB86B` (warm) or `#7C8296` (neutral) instead.
3. No emoji in the interface.
4. No exclamation marks in any copy.
5. No shadows. Depth comes from surface steps, 0.5px borders and spacing.
6. No two-colour gradients. One colour at varying alpha only.
7. Blue `#4361FF` is for fills, never for text under 18px — use `#7C8FFF` for text.
8. Every category colour is always accompanied by an icon and a label. Colour is never the only carrier of meaning.

---

## 1. Colour tokens

```
canvas         #000000    all screen backgrounds
surface1       #0E0F14    cards
surface2       #161822    nested blocks, input fields
surface3       #1F2230    selected state, chips
border         #2A2E3C    0.5px hairlines, dividers

accent         #4361FF    action button, active progress
accentBright   #7C8FFF    accent text, labels, links
accentDeep     #2A3AA8    pressed state, deep fills
accentDim      #141B3D    background of active/selected states
onAccent       #F0F2FF    text on accent button

textPrimary    #F2F1EF    headings, task text (slightly warm, never #FFFFFF)
textSecondary  #9096A8    subtitles, explanations
textMuted      #656B7C    labels, counters, service text

warm           #FFB86B    RESTRICTED — see §4
warmDim        #3A2617    background of warm chips
neutralDown    #7C8296    downward arrows, negative deltas

catSleep       #8B7BFF
catEnergy      #FFB020
catMovement    #3DDC97
catFood        #F4704E
catWater       #22D3EE
catMind        #DE7BD4
```

Surfaces carry a blue undertone deliberately. Do not substitute neutral greys — neutral grey next to a blue accent reads institutional and cold.

---

## 2. The light system

This is the identity. It is not decoration.

**Thesis:** the app looks like light emerging from darkness.

### Signature construction

Applied to anything that should draw the eye. **Core is always warmer than halo. Never the reverse.**

```
core        #FFFFFF → #FFB86B    sharp, thin, 1–3px
transition  #FFB86B → #4361FF    8–16px
halo        #4361FF at alpha     blur 16–48px
```

### Brightness scale

Every screen and every element is assigned one level.

| Level | Glow alpha | Blur | Core | Used for |
|---|---|---|---|---|
| L0 | — | — | no | pure black, text only |
| L1 | 0.06–0.10 | 60px | no | questions, reading, long text |
| L2 | 0.15 | 48px | no | manifesto screens, transitions |
| L3 | 0.25 | 36px | faint | selected states, buttons |
| L4 | 0.40 | 24px | yes | core task card, result screen |
| L5 | 0.55 | 16px | bright | splash, ring closure ONLY |

**Rules:**
- One L4 element per screen maximum.
- L5 exists in exactly two places in the entire app.
- Screens with body text are always L0 or L1.
- L0 screens are required — they give the scale meaning.

### Light forms

| Form | Description | Where |
|---|---|---|
| Bottom bloom | wide soft glow rising from the bottom edge, 15–25% of screen height | text screens, questions |
| Halo | glow following an object's shape | ring, category values |
| Edge | 0.5–1px glowing outline + soft outer glow | selected answer, focused field |
| Core | compact bright spot inside an element | button, chip |
| Line | glowing stroke, no fill | progress bar, habit arc |
| Ring | six arcs, radius = category value | 4 appearances only |

**Forbidden light forms:** rays, stars, lens flare, particles, haze, sparkles, god rays, bokeh.

---

## 3. Typography

Font: **Inter**. Weights 400 and 500 only. Never 600 or 700.

| Role | Size | Weight | Line height |
|---|---|---|---|
| Manifesto | 30 | 400 | 1.25 |
| Screen title | 24 | 500 | 1.30 |
| Task text | 17 | 400 | 1.45 |
| Metric value | 32 | 400 tabular | 1.00 |
| Body | 15 | 400 | 1.55 |
| Caption | 13 | 400 | 1.50 |
| Label | 11 | 500, +0.08em, UPPERCASE | 1.20 |

- Sentence case everywhere. Uppercase only in 11px service labels.
- `font-variant-numeric: tabular-nums` on every number that changes.
- Manifesto screens: max 46 characters per line.

---

## 4. Warm light — closed list

`#FFB86B` appears in exactly five places in the entire product:

1. Onboarding screen 8 (the "forgiven days" reveal)
2. The forgiven-days chip on the daily screen
3. The missed-day screen
4. Ring closure on day 60
5. Day 1 first completion

Warm light anywhere else is a bug, not a design decision.

---

## 5. Layout

```
base grid      4px
rhythm         8px
screen padding 20px
card gap       12px
section gap    32px

radius: card 16, field 12, chip 8, button 999 (pill)
height: button 52, field 48, row 56, min touch target 44
```

Buttons are full-width pills, pinned to the bottom with 20px inset.

---

## 6. Core components

### Task card (the most important component)

```
surface1, radius 16, padding 18
L4 glow, radial from top-left corner, alpha up to 0.30

structure top to bottom:
  label "ЯДРО" 11px uppercase accentBright   |   counter "день 23 / 60" 11px textMuted
  task text 17px textPrimary, max 60 chars
  subtitle 13px textSecondary, one sentence
  progress line 2px, category colour, glowing
  row: pill button accent (flex 1) + circular 42px "i" button with 0.5px border
```

The "i" button renders **only when the task has a research source.** Its absence is information, not an omission.

### Answer option

```
surface1, radius 12, height 56, 15px textPrimary
selected: background accentDim, 0.5px accentBright border, L3 edge glow
```

Never invert to a white fill with dark text — the contrast jump is too harsh on black.

### Ring

```
six 60° sectors, 4° gaps
arc radius = category value mapped 0→35px, 100→105px
stroke 7px, constant
order clockwise from top, FIXED: Sleep → Energy → Movement → Food → Water → Mind
each sector in its own category colour, L2 halo
```

Radius carries the value, not thickness — the eye compares distance better than width.

### Progress bar

2px line. Track `border`, fill `accent` with glow. **Strictly linear** — never accelerate or decelerate to fake progress.

---

## 7. Motion

| Action | Duration | Easing |
|---|---|---|
| Light appearing | 400ms | ease-out |
| Light receding | 250ms | ease-in |
| Completion flash | 180ms up / 320ms down | ease-out / ease-in |
| Screen transition | 240ms, 12px offset + fade | cubic-bezier(0.16, 1, 0.3, 1) |
| Ring draw | 900ms, 80ms stagger per sector | ease-out |

- Nothing pulses at rest.
- No springs, no bounce.
- No slide transitions across full screen width — 12px offset plus fade only.
- Honour `prefers-reduced-motion`: skip to final state.

---

## 8. Tone of copy

- Second person, calm, short sentences.
- Tasks are always formatted `Если [anchor] — [action]`, first person present tense verb.
- Subtitles reduce resistance, they do not motivate.

**Banned phrases:** "лучшая версия себя", "ты должен", "всего 5 минут", "не забудь", "доказано, что", "не сдавайся".

**Never generate:** calorie counts, weight targets, portion sizes, invented percentages, fabricated statistics, references to "genetic potential".

---

## 9. What NOT to generate

| Do not | Reason |
|---|---|
| Red error states | product decision against shame |
| Streak-burning UI, broken chain graphics | contradicts core mechanic |
| Confetti, celebration animations | one exception, day 1 only |
| Glassmorphism, frosted panels | wrong genre |
| Neon, cyberpunk, acid gradients | wrong genre |
| University or clinic logos | trademarks |
| Stock illustrations, human silhouettes | breaks coherence |
| Bottom tab bars with 5+ items | the app has 3 sections |
| Skeleton loaders with shimmer | shimmer pulses; use static L1 |

---

## 10. Screens to generate

Structure only. Apply the light layer afterwards.

| Screen | Level | Notes |
|---|---|---|
| Splash | L5 | ring, no text |
| Daily screen | L4 card, L2 ring | three slots: core, support, today |
| Question | L1 | progress bar, 5–7 options, bottom button |
| Result / profile | L4 | ring + six values |
| Missed day | L2 warm | no red, no illustration |
| Goal | L2 | WOOP fields, one active step |
| Sources | L1 | text cards, DOI links |
| Settings | L0 | no glow at all |

---

## 11. Workflow note

Stitch generates **structure**. The light system is applied afterwards as a shared component with six presets (L0–L5), either in Figma or directly in code.

Do not ask Stitch to invent glow values. Do not let it substitute its own colour palette. If a generated screen contains red, shadows, emoji or a two-colour gradient, regenerate rather than patch.
