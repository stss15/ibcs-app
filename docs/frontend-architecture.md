# Frontend Architecture, CSS, and JS Conventions

## Tech Stack
- **React 18 + Vite** SPA located in `frontend/`
- **React Router** for authenticated routing
- **InstantDB** for persistence via the Cloudflare Worker (`frontend/src/lib/api.js`)
- **Skulpt** for Python playgrounds within gamified segments

## High-Level Structure
```
frontend/src/
├── App.jsx                 # Router + layout shell
├── components/             # Shared UI (layout, gamified segments, dashboards)
├── content/                # Unit definitions consumed by GamifiedModulePage
├── context/                # React contexts (e.g., GamificationContext)
├── hooks/                  # Reusable hooks (session, manifest)
├── pages/                  # Route-level components (B1ModulePage, dashboards, etc.)
├── styles/                 # Global CSS tokens + resets
└── utils/                  # Lightweight helpers (e.g., shuffle)
```

## Gamified Module Core
- `components/GamifiedModulePage.jsx` is the shared engine for unit pages (B1, B2, future units). It now handles rendering for both students and teachers, conditionally applying gamification and progress-locking logic based on the user's role.
- **Teacher Mode:** When a teacher is viewing a module, gamification is disabled, and all content is unlocked. Teachers also have access to a "Presentation Mode" for classroom delivery and "Set Pace" controls to manage student progression. For more details, see `docs/teacher-mode.md`.
- Segments are rendered via `components/segments/**`, each matching a `type` in the unit schema (`content`, `list`, `table`, `accordion`, `micro-quiz`, `activity`, `python-playground`, `reflection`, `demo`).
- Activities live in `components/segments/activities/` with types: `matching`, `ordering`, `drag-drop`, `gap-fill`, `image-hotspot`, `planner`, `classification`, `diagram-label`, `code-completion`, `spot-error`. Use the utilities in `frontend/src/utils/array.js` where needed.
- Gamification state (XP, streaks, sprites) is provided by `context/GamificationContext.jsx` and persisted to `localStorage`.
- **Enhanced Components** (`components/segments/EnhancedComponents.jsx`) provide modern, reusable UI elements: `KeywordCard`, `Callout`, `EnhancedTable`, `ProgressIndicator`, `AchievementBadge`, `XPNotification`, `StreakIndicator`, `SkeletonLoader`. These components feature modern animations, gradients, and hover effects aligned with the design system.

## CSS Conventions
- Global tokens and resets reside in `styles/global.css`.
- **Design System**: A comprehensive set of CSS variables for colors, spacing, shadows, transitions, and animations. Use `var(--cs-blue)`, `var(--space-lg)`, `var(--radius-xl)`, `var(--shadow-md)`, `var(--transition-base)` instead of hard-coded values.
- **Animations**: 11 reusable keyframe animations (`fadeIn`, `bounce`, `pulse`, `wiggle`, `shimmer`, etc.) with utility classes (`.animate-fade-in`, `.hover-lift`, `.animate-bounce`).
- Component-scoped styles for gamified screens are in `components/GamifiedModulePage.css` and `components/segments/**/*.css`.
- Use BEM-flavoured class names (`gamified-`, `activity-`, `b2-`) to avoid collisions.
- Prefer CSS custom properties defined in `:root` for colours, spacing, and typography if adding new tokens.
- When introducing unit-specific visual tweaks, keep them within the page CSS (`pages/B1ModulePage.css`, etc.) and reuse shared variables.
- **Full design system documentation**: See `docs/ui-ux-design-system.md` for complete reference and `QUICK-START-GUIDE.md` for quick usage examples.

## JavaScript Patterns
- Keep stateful logic inside hooks or context providers; segment components should remain stateless where possible.
- Use functional `setState` updates when deriving state from previous values (e.g., progress reducers).
- For local persistence, centralise read/write calls through the reducer in `GamifiedModulePage.jsx`—do not scatter `localStorage` access in individual segments.
- Activity components should always call `onAttempt(segmentId, payload)` so XP, streaks, and dashboards stay in sync.
- When adding new segment types, extend the switch in `SegmentRenderer` and create a dedicated component under `components/segments/`.

## Routing & Navigation
- Protected routes use `RequireAuth` inside `App.jsx` with role filters (`teacher`, `student`, `admin`).
- Main routes:
  - `/` - Landing/login page (redirects authenticated users to role-specific dashboards)
  - `/dashboard` - Teacher dashboard (requires `teacher` role)
  - `/dashboard/student/:studentId` - Teacher view of individual student
  - `/student` - Student dashboard (requires `student` role)
  - `/admin` - Admin dashboard (requires `admin` role)
  - `/account` - Account management (any authenticated user)
  - `/curriculum` - Curriculum map overview
  - `/curriculum/ib` - IB curriculum overview
  - `/curriculum/year7` - Year 7 curriculum map
  - `/curriculum/ib/b1`, `/curriculum/ib/b2` - Gamified module pages (B1, B2)
  - `/topic/:id` - Topic detail page
  - `/lesson/:lessonId` - Lesson detail page
- Module pages (`/curriculum/ib/b1`, `/curriculum/ib/b2`) inject their unit object into `GamifiedModulePage`.
- Curriculum previews live in `pages/IBCurriculumPage.jsx` and should mirror new units by importing their `unit` object and passing it into preview cards.

## Manifest & Content Loading
- `hooks/useCurriculumManifest.js` loads `frontend/src/data/curriculumManifest.json` (generated from assets) to drive navigation.
- When adding a unit, update the manifest (or the generator script) and ensure previews fall back gracefully when absent.

## Testing & Linting
- Run `npm run lint` before committing changes; ESLint covers React hooks order and unused variables.
- `npm run build` ensures production bundles remain under chunk limits; if warnings occur, consider `dynamic import()` and `manualChunks` in `vite.config.js`.


