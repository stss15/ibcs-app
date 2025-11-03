# Building Interactive IB Curriculum Units (AI Agent Handbook)

This guide documents the workflow, file structure, and implementation conventions for authoring an interactive IB Computer Science unit. Follow these steps whenever you introduce a new unit or update existing learning paths.

---

## 1. Content Authoring (MDX-like data module)

1. Create a new file in `frontend/src/content`, e.g. `b2ProgrammingFundamentals.jsx`.
2. Export a constant that mirrors the shape of `b1Unit`:
   ```js
   export const b2Unit = {
     id: "B2",
     title: "...",
     hours: { sl: "...", hl: "..." },
     guidingQuestion: "...",
     overview: { aim: <Fragment>...</Fragment>, vocabulary: [...] },
     stages: [
       {
         id: "B2-overview",
         title: "...",
         duration: "...",
         description: "...",
         segments: [
           { type: "content", id: "...", heading: "...", body: <Fragment>...</Fragment> },
           { type: "activity", activityType: "matching" | "ordering" | "planner", ... },
           { type: "checkpoint", questions: [...] },
           { type: "reflection", prompt: "..." },
         ],
       },
       // additional stages …
     ],
     assessment: { duration: "...", totalMarks: 00, questions: [...] },
   };
   ```
3. Activities must be automatically gradable. Use supported interaction types only:
   - `matching` (term → example)
   - `ordering` (sequence steps)
   - `multi-select` or `mcq` (single choice)
   - `true-false`
   - `planner` (structured text capture; no grading)
4. Vary scenarios in quizzes so answers are not identical to instructional examples.
5. Each `segment.id` must be unique (used for local storage & dashboard insights).

---

## 2. Learning Module Page

1. Duplicate `frontend/src/pages/B1ModulePage.jsx` and `.css` to create `B2ModulePage.jsx` / `.css`.
2. Update imports to reference the new content:
   ```js
   import b2Unit from "../content/b2ProgrammingFundamentals.jsx";
   ```
3. Ensure storage keys are unique:
   ```js
   const STORAGE_KEY = "ibcs.b2.progress";
   ```
4. Components to keep:
   - `StagePlayer` handles gating & segment navigation.
   - `ActivitySegment`, `CheckpointSegment` already support attempt tracking, success/failure styling, and teacher bypass.
   - Attempt data is persisted under `progress.attempts[segmentId]`.
5. If adding new activity types, extend `ActivitySegment` and create matching components with the same auto-marking pattern (randomised options, disabled inputs after success, red/green card states).

---

## 3. Hooking into Navigation

1. **Routing:** Import the new module page in `frontend/src/App.jsx` and add a protected route:
   ```jsx
   import B2ModulePage from "./pages/B2ModulePage.jsx";
   …
   <Route
     path="/curriculum/ib/b2"
     element={
       <RequireAuth>
         <B2ModulePage />
       </RequireAuth>
     }
   />
   ```
2. **IB Curriculum Map:** Update `frontend/src/pages/IBCurriculumPage.jsx`:
   - Import the new unit object.
   - Replace the chapter list when the selected unit matches the new ID:
     ```jsx
     {selectedUnit.id === "B2" ? <B2LearningPreview /> : <LegacyChapterList />}
     ```
   - `B2LearningPreview` should mirror `B1LearningPreview`, iterating over the exported unit stages to show duration and descriptions, and link to `/curriculum/ib/b2`.
3. **Legacy Chapter Cards:** Hide or remove the `IBCurriculumPage` chapter view for units that have a new learning path to avoid multiple entry points.

---

## 4. Progress Persistence & Analytics

1. Local storage:
   - Progress key: `ibcs.<unitId>.progress`.
   - Stored object should include `stages`, `reflections`, `planner`, `attempts`, and `assessment`.
2. Attempt logging:
   - `onAttempt(segmentId, success)` increments `count` and `correct`.
   - Activities must call `onAttempt` every submission attempt (before gating).
   - Segment cards change class names (`is-success`, `is-error`) to indicate status.
3. Student dashboard insights:
   - Dashboard reads the aggregated progress via `window.localStorage`. Use the pattern in `StudentDashboardPage.jsx`.
   - Add the new unit’s attempt rows to the insights table (filter by `segment.id` prefixes as needed).

---

## 5. Teacher Accommodations

1. Teachers (role `teacher` or `admin`) can bypass gating via “Mark complete”. Leave this control in each activity & checkpoint.
2. Exam Shell:
   - Reuse the assessment panel structure (`AssessmentPanel`) with the teacher marking workspace.
   - Update total marks and question copy in the module’s `assessment` export only.
   - PDF export leverages `window.print()`. Ensure new CSS includes print styles for the unit.

---

## 6. Styling Guidelines

1. Store module-specific styles in `frontend/src/pages/<Unit>ModulePage.css`.
2. Keep consistent tokens: background gradients, card radius, pill buttons.
3. Define state classes (`.is-success`, `.is-error`) for card borders/shadows.
4. For IB page previews, use the `ib-b1-preview` pattern: grid of stage cards + CTA.

---

## 7. Deployment Checklist

1. Run `npm run lint`.
2. Run `npm run build`.
3. Execute `./fix-and-deploy.sh` to update the InstantDB schema (if necessary), rebuild, deploy the worker, seed accounts, and publish the static build.
4. Verify `/curriculum/ib/<unitId>` renders the new flow and the IB map button links correctly.
5. Test student insight table displays new attempt data.

---

## 8. Maintaining InstantDB & Backend

*No schema changes were required for B1.* If future units need data persisted server-side:
1. Update the InstantDB schema files (`instant.schema.ts`) with new collections or fields.
2. Re-run the schema push script (`./push-schema.sh` or the relevant portion of `fix-and-deploy.sh`).
3. Ensure the frontend reads/writes via existing API helpers in `frontend/src/lib/api.js`.

---

## 9. Summary Flow for a New Unit

1. Author structured content module (`frontend/src/content`).
2. Implement module page & styles (copy B1, adjust IDs, storage key, unit import).
3. Register route and IB map preview; hide legacy chapter lists for this unit.
4. Confirm attempt tracking feeds the dashboard.
5. Run lint/build, deploy.

Following this checklist keeps every unit consistent with the B1 learning path and ensures the platform remains maintainable as new experiences are added. Happy building!
