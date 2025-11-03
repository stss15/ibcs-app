# Gamified Content Authoring Guide

Use this guide when creating or updating IB units inside `frontend/src/content/`.

## 1. Content Model
- Each unit exports a `GamifiedUnit` object (see `b1ComputationalThinking.jsx`, `b2ProgrammingFundamentals.jsx`).
- Required keys: `id`, `title`, `hours`, `guidingQuestion`, `overview`, `stages`, `assessment`.
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
| `activity` | `ActivitySegment` | `activityType` one of `matching`, `ordering`, `gap-fill`, `drag-drop`, `image-hotspot`, `planner`. |
| `python-playground` | `PythonPlaygroundSegment` | Requires `starterCode`; optional `snippets`, `fillTasks`. |
| `demo` | `DemoSegment` | References a reusable entry in the `lessonDemos` InstantDB collection. |
| `reflection` | `ReflectionSegment` | Prompt students; result saves locally and in analytics. |

Add new segment types by adding a component under `components/segments/` and extending the switch in `GamifiedModulePage.jsx`.

## 2. Gamification Layer
- `useGamification()` exposes `awardXp`, `resetStreak`, and levels. Award XP only via `onAttempt` payloads.
- Base XP: `correctCount * 10`. Streak bonus: `+5` for every third consecutive success.
- Always pass `totalCount` so dashboards can compute success rates.
- Failure should call `resetStreak()` through `handleAttempt` (already handled in `GamifiedModulePage`).

## 3. Authoring Workflow
1. Duplicate an existing unit file (`frontend/src/content/b?*.jsx`).
2. Update `id`, `title`, `hours`, `guidingQuestion`, and `overview`.
3. Draft stages: each should include a mix of `content` and at least one interactive segment.
4. Ensure all interactive segments call `onAttempt` via their segment component (built-in activities already do).
5. Provide a reflection or planner to capture learning plans where helpful.
6. Define the summative assessment (duration, total marks, question list). Questions feed the end-of-unit planner for teachers.
7. Import the unit into `IBCurriculumPage.jsx` for previews and into a route-level page when launching.
8. Run `npm run lint` to catch missing imports or unused values.
9. Update `docs/change-log.txt` if you introduce a new segment type or adjust schema expectations.

## 4. Analytics & Dashboards
- Attempts are persisted under `progress.attempts[segmentId]` with `{ count, correct, lastResult, updatedAt }`.
- Reflections and planner entries save into `progress.reflections` / `progress.planner` for student dashboards.
- Teachers view aggregate data via `StudentDashboardPage.jsx` (local storage insights) and InstantDB for class-level data.

## 5. Best Practices
- Keep stage descriptions succinct (one or two sentences) for the sidebar.
- Vary formative question phrasing so answers are not identical to exposition text.
- Supply rationales for all micro-quiz options; they power the feedback ribbons.
- Use consistent terminology with the project overview doc and IB syllabus.
- Test new activities manually; ensure the “Check answers” button locks the card after success.


