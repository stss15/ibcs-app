# Gamified Content Authoring Guide

Use this guide when creating or updating IB units inside `frontend/src/content/`.

## 1. Content Model
- Each unit exports a `GamifiedUnit` object (see `b1ComputationalThinking.jsx`, `b2ProgrammingFundamentals.jsx`).
- Required keys: `id`, `title`, `hours`, `guidingQuestion`, `overview`, `stages`, `assessment`.
- Optional but recommended: `programmeLabel` to customise the header badge (for example, "Year 7 Computing").
- `stages` is a locked sequence; the next stage unlocks only after the previous stage reports `completed`.
- Every `segment` requires a unique `id` (used for persistence, XP tracking, and dashboards).

### Segment Types
| `type` | Component | Notes |
| --- | --- | --- |
| `content` | `ContentSegment` | JSX body via `<Fragment>`; keep paragraphs short. |
| `list` | `ContentSegment` | Provide `items[{ title, body }]` for bullet/definition lists. |
| `table` | `ContentSegment` | Provide `columns` + `rows` arrays; keep tables narrow for mobile. |
| `accordion` | `ContentSegment` | Ordered `items[{ title, body }]` for expandable deep dives. |
| `micro-quiz` | `MicroQuizSegment` | 1–3 instant-check questions; supply `rationale` for wrong answers. |
| `activity` | `ActivitySegment` | `activityType` one of `matching`, `ordering`, `gap-fill`, `drag-drop`, `image-hotspot`, `planner`, `classification`, `diagram-label`, `code-completion`, `spot-error`. |
| `python-playground` | `PythonPlaygroundSegment` | Requires `starterCode`; optional `snippets`, `fillTasks`. |
| `demo` | `DemoSegment` | References a reusable entry in the `lessonDemos` InstantDB collection. |
| `reflection` | `ReflectionSegment` | Prompt students; result saves locally and in analytics. |

#### Audience controls

- Use `audience: "teacher"` on any segment to make it visible only when a teacher or admin is in the module. This is ideal for presenter notes and recall questions.
- `audience: "student"` hides the segment in teacher view while keeping it for learners. Teachers can still enable previews by setting `allowTeacherPreview: true`.
- Legacy flags `teacherOnly` / `studentOnly` map to the same behaviour.
- The new Year 7 live deck prototype is defined in `shared/liveDecks.js`. It follows the same content conventions but stores slide metadata for both the frontend and worker pacing logic.

Add new segment types by adding a component under `components/segments/` and extending the switch in `GamifiedModulePage.jsx`.

### Enhanced Components
For richer visual presentation, use the modern components from `components/segments/EnhancedComponents.jsx`:
- **KeywordCard**: Modern definition cards with icons, hover effects, and gradients
- **Callout**: Info boxes (info, tip, warning, success, error) with icons
- **EnhancedTable**: Professional tables with sticky headers, zebra striping, and hover effects
- **ProgressIndicator**: Animated progress bars with shimmer effects
- **AchievementBadge**: Display achievements with locked/unlocked states
- **XPNotification**: Toast notifications for XP gains
- **StreakIndicator**: Show streak counts with animated flames
- **SkeletonLoader**: Loading state placeholders

**Example usage in content:**
```jsx
import { KeywordCard, Callout } from '../components/segments/EnhancedComponents';

{
  type: 'content',
  heading: 'Key Concepts',
  body: (
    <>
      <KeywordCard 
        term="Algorithm" 
        definition="A step-by-step procedure for solving a problem"
        icon="🔄"
      />
      <Callout type="tip" title="Remember">
        Always test your algorithms with edge cases!
      </Callout>
    </>
  )
}
```

See `docs/ui-ux-design-system.md` for complete component documentation.

**New activity types**

- `classification` – Drag labels into named categories. Provide `categories[{ id, title, description? }]` and `tokens[{ id, label, answer }]`.
- `diagram-label` – Overlay drop zones on an image. Supply `image{ src, alt }`, `tokens[]`, and `targets[{ id, x, y, answer }]` where `x`/`y` are percentages.
- `code-completion` – Insert short-form code inputs inside preformatted blocks. Define `code` with `[[placeholderId]]` markers and `placeholders[{ id, answer, label?, hint?, trimInput?, caseSensitive? }]`.
- `spot-error` – Present a list of statements where learners select the incorrect ones. Each `item` should include `{ id, text, isError, explanation? }`.
- `gap-fill` supports `interaction: "drag"` plus an optional `tokens[]` array to present a draggable word bank instead of dropdowns.

## 2. Gamification Layer
- `useGamification()` exposes `awardXp`, `resetStreak`, and levels. Award XP only via `onAttempt` payloads.
- Base XP: `correctCount * 10`. Streak bonus: `+5` for every 3rd consecutive success (awarded at streaks 2, 5, 8, etc.). Formula: `Math.floor((streak + 1) / 3) * 5`.
- Levels increase every 150 XP (level = `Math.floor(xp / 150) + 1`).
- Always pass `totalCount` so dashboards can compute success rates.
- Failure should call `resetStreak()` through `handleAttempt` (already handled in `GamifiedModulePage`).

## 3. Authoring Workflow
1. Duplicate an existing unit file (`frontend/src/content/b?*.jsx`).
2. Update `id`, `title`, `hours`, `guidingQuestion`, and `overview`.
3. Draft stages: each should include a mix of `content` and at least one interactive segment.
4. Ensure all interactive segments call `onAttempt` via their segment component (built-in activities already do).
5. Provide a reflection or planner to capture learning plans where helpful.
6. Define the summative assessment (duration, total marks, question list). Questions feed the end-of-unit planner for teachers.
   - Support for `assessment.format: "auto-mcq"` renders a self-marking quiz at the end of the unit. Reuse the same question schema as `micro-quiz` segments (`type`, `answer` / `answers`, `options`, `rationale`). Include `points` per question so totals reach `totalMarks`.
   - Omit `format` (or set any other value) to default to the traditional free-response panel with teacher marking controls.
   - The summative is injected as the final stage automatically—do **not** create a manual “assessment” stage; pacing and navigation expect the engine-managed slot.
7. Import the unit into `IBCurriculumPage.jsx` for previews and into a route-level page when launching.
8. Run `npm run lint` to catch missing imports or unused values.
9. Update `docs/change-log.txt` if you introduce a new segment type or adjust schema expectations.

## 4. Analytics & Dashboards
- Progress is stored per-user in `localStorage` with namespace `ibcs.{unitId}.{username}.progress` (current version: 2).
- Attempts are persisted under `progress.attempts[segmentId]` with `{ count, correct, lastResult, updatedAt }`.
- Reflections and planner entries save into `progress.reflections` / `progress.planner` for student dashboards.
- Assessment state includes `status`, `responses`, `marks`, `teacherNotes`, and `updatedAt`.
- Teachers view aggregate data via `StudentDashboardPage.jsx` (local storage insights) and InstantDB for class-level data.

## 6. Teacher Pacing System
The application includes a teacher-led pacing system to control the flow of content for students.

- **Teacher Controls:** On the module pages, teachers can "Set Pace" to any stage. This action designates the furthest point a student can progress to.
- **Student Progression:** Students are unable to access stages beyond the one set by the teacher's pace. Within the allowed stages, they must still progress sequentially by completing each stage.
- **Data Model:** The current pace for each class is stored in the `classPacing` collection in InstantDB.

This system ensures that students work on the material currently being covered in class, while still allowing them to work at their own pace within that scope. For more technical details, see `docs/teacher-mode.md`.

## 5. Best Practices
- Keep stage descriptions succinct (one or two sentences) for the sidebar.
- Vary formative question phrasing so answers are not identical to exposition text.
- Supply rationales for all micro-quiz options; they power the feedback ribbons.
- Use consistent terminology with the project overview doc and IB syllabus.
- Test new activities manually; ensure the “Check answers” button locks the card after success.
