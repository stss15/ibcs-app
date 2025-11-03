# Gamified Learning Architecture

This document summarises the new shared architecture for the rebuilt B1 and B2.1 pathways. Use this as the reference when extending future units.

## 1. Content Model

- `frontend/src/content/b1ComputationalThinking.jsx` and `b2ProgrammingFundamentals.jsx` now export `unit` objects that match the `GamifiedUnit` schema.
- Segments support the following types:
  - `content`, `list`, `table`, `accordion` (existing).
  - `micro-quiz` (1–3 spaced-recall questions, auto-marked).
  - `activity` with sub-types `matching`, `ordering`, `drag-drop`, `gap-fill`, `image-hotspot`.
  - `python-playground` (Skulpt runner with curated starter/example set).
  - `demo` (references an entry in the `lessonDemos` collection for reusable JS interactivity).
- Each segment exposes a `segmentId` used for XP tracking and attempt persistence.

## 2. Gamification Layer

- `frontend/src/context/GamificationContext.jsx` provides XP, level, streak, sprites, and helper methods.
- XP awards:
  - `10` XP per correct response.
  - Streak bonus: `+5` XP for every consecutive 3 correct answers.
  - Module completion bonus is configured per unit.
- Context persists locally in `localStorage` and remotely via InstantDB (`studentStats` collection).
- `useGamification()` hook exposes `awardXp({ segmentId, correctCount, totalCount })`.

## 3. Assessment & Feedback

- `CheckpointSegment` renders per-question feedback with colour-coded states:
  - Green: correct selections.
  - Red: incorrect selections.
  - Neutral outline for unselected but correct answers (multi-select).
- After submission, `AssessmentResultsModal` displays:
  - Animated success/failure background.
  - Correct count, total questions, XP earned, and flavour text.
  - “Next” button (or keyboard `Enter`) closes modal and triggers `onComplete`.
- Attempt data (count / correct / streak) is forwarded via `onAttempt`.

## 4. Python Playground Enhancements

- Dark theme, monospace syntactic styling, split pane layout, and scroll-locked console.
- `Run Example` buttons inject curated snippets.
- `FillTheGap` interactive mode uses placeholders (`[[blank]]`) that render as dropdowns with auto-marking.
- Playground segments can reference `lessonDemos` to show a guided animation next to the editor.

## 5. Dashboards

- Student dashboard:
  - XP bar with level badge.
  - Circular progress charts per unit.
  - Recent achievements sourced from `sprites` unlocks.
  - Responsive layout with tablet-first breakpoints.
- Teacher dashboard:
  - Class cards display average XP, completion heatmap, top/bottom performers.
  - Controls to reset passwords, toggle formative access, and export CSV/Excel.
  - Data backed by `teacherStats` and aggregated `studentStats`.

## 6. InstantDB Schema Additions

- `students` (existing) now includes optional fields: `xp`, `level`, `spritesUnlocked`, `lessonCompletion`, `teacherClassLink`.
- New collections:
  - `studentStats`: per-student aggregates (`xp`, `level`, `streak`, `totalCorrect`, `totalAttempts`, `spritesUnlocked`, `updatedAt`).
  - `teacherStats`: per-class aggregates (`classId`, `averageXp`, `lessonCompletion`, `topPerformers`, `bottomPerformers`, `updatedAt`).
  - `lessonDemos`: reusable JS playground demos.
  - `sprites`: unlockable sprite metadata (id, label, description, xpRequirement, assetPath).

Backend helpers in `worker/src/repositories.js` abstract reads/writes to keep future migrations minimal.

## 7. Asset Pipeline

- Place sprite assets in `assets/sprites/<spriteId>.svg`.
- `scripts/generate-sprite-manifest.js` builds `frontend/src/data/sprites.json` from the directory for consumption by both dashboards and module pages.

## 8. Extending to New Units

1. Create a new `<unitId>Unit.jsx` content file using the GamifiedUnit schema.
2. Add demos to the `lessonDemos` collection and wire them via `demoId` segments.
3. Register the module route and preview component.
4. Update dashboards to surface new unit metrics if necessary.
