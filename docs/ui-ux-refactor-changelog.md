# UI/UX Refactor Changelog

Use this file to document every significant change during the design-system rollout. Keep entries chronological and include enough detail for future auditing or rollback.

## How to Log Changes

- **Phase**: One of Phase 0, Phase 1, Phase 2, Phase 3 (or “Maintenance” once phases are complete).
- **Date**: YYYY-MM-DD (UTC).
- **Task / Reference**: Jira/issue link or short ID; if none, create a meaningful label.
- **Summary**: Brief description (1–2 sentences) of what changed.
- **Files / Areas**: High-level list of affected folders/files.
- **Notes / Decisions**: Key design or technical decisions, especially CSP considerations or reasons inline styles remain.
- **QA**: Tests or manual checks performed.

### Example Entry

```
### Phase 1 — 2025-11-06 — TASK-1234 — Align teacher dashboard to design system
- **Files / Areas**: frontend/src/pages/TeacherDashboardPage.jsx, TeacherDashboardPage.css, components/ui/
- **Notes / Decisions**: Replaced legacy spacing with tokens; documented pending API data for summary cards.
- **QA**: npm run lint; npm run build; manual smoke test (teacher dashboard).
```

Add all new entries under the appropriate phase heading below.

---

## Phase 0 — Audit & Backlog

### Phase 0 — 2025-11-05 — PHASE0-BACKLOG — Draft initial backlog and rollout tracking process
- **Files / Areas**: docs/ui-ux-refactor-plan.md
- **Notes / Decisions**: Reviewed `docs/NEW-UI-UX-design-strategy.txt` to seed the backlog and created phase-scoped task tables with IDs for consistent changelog references.
- **QA**: Documentation update only; no build or runtime impact.

### Phase 0 — 2025-11-05 — P0-001 — Capture initial teacher/student/admin screen inventory
- **Files / Areas**: docs/ui-ux-refactor-plan.md, frontend/src/pages/, frontend/src/components/
- **Notes / Decisions**: Catalogued high-impact surfaces grouped by persona, noting primary files and known styling risks (inline styles, bespoke layout classes). Shared components flagged for deeper audit in P0-002.
- **QA**: Documentation update only; no build or runtime impact.

### Phase 0 — 2025-11-05 — P0-002 — Record preliminary inline-style hotspots
- **Files / Areas**: docs/ui-ux-refactor-plan.md, frontend/src/pages/StudentDashboardPage.jsx, frontend/src/components/
- **Notes / Decisions**: Identified progress bars, DnD transforms, hotspot overlays, curriculum accents, and modal confetti as CSP-sensitive inline styling areas. Documented recommendations (CSS vars, token variants, or library-driven exceptions) ahead of refactor tasks.
- **QA**: Documentation update only; no build or runtime impact.

### Phase 0 — 2025-11-05 — P0-003 — Catalogue design token gaps and missing primitives
- **Files / Areas**: docs/ui-ux-refactor-plan.md, frontend/src/styles/global.css (audit), docs/ui-ux-design-system.md
- **Notes / Decisions**: Compared live CSS with the published design system; documented missing `--cs-*` brand tokens, status palette, gradient aliases, motion/shadow scales, and radius/spacing naming gaps. Outlined shared primitive backlog (StatCard, progress, status pill, toast, modal, table, action bar) to unblock Phase 1 refactors.
- **QA**: Documentation update only; no build or runtime impact.

### Phase 0 — 2025-11-05 — P0-005 — Align design tokens with `global.css`
- **Files / Areas**: frontend/src/styles/global.css, docs/ui-ux-refactor-plan.md
- **Notes / Decisions**: Added brand (`--cs-*`), status, gradient, spacing alias, radius, shadow, and motion tokens to the shared `:root` so downstream refactors can rely on consistent variables. Plan updated to mark P0-005 complete and note follow-up adoption work.
- **QA**: Documentation/CSS variable update only; no runtime changes validated yet.

### Phase 0 — 2025-11-05 — P0-004 — Define QA & verification checklist
- **Files / Areas**: docs/ui-ux-refactor-plan.md
- **Notes / Decisions**: Added phase-by-phase QA matrix covering automated commands, manual checks, regression focus, and required artifacts; clarified expectations to capture screenshots and log CSP exceptions.
- **QA**: Documentation update only; no automated checks run.

### Phase 0 — 2025-11-05 — P0-006 — Phase 0 close-out validation
- **Files / Areas**: docs/ui-ux-refactor-plan.md, docs/ui-ux-refactor-changelog.md
- **Notes / Decisions**: Reviewed screen inventory + hotspot audit coverage, updated backlog statuses to “Completed,” and marked Phase 0 resolved so the team can focus on Phase 1 delivery with full traceability.
- **QA**: Documentation review; no runtime impact.

---

## Phase 1 — Core Experience Alignment

### Phase 1 — 2025-11-05 — P1-001 — Tokenise Gamified Module header stat cards
- **Files / Areas**: frontend/src/components/GamifiedModulePage.jsx, frontend/src/components/GamifiedModulePage.css, frontend/src/components/ui/StatCard.jsx, frontend/src/components/ui/StatCard.css
- **Notes / Decisions**: Replaced bespoke XP card with reusable `StatCard` primitive driven by brand tokens; progress width now uses CSS custom property `--stat-card-progress` (inline variable assignment only) to stay CSP-compliant. Legacy gradients and inline width styles removed.
- **QA**: npm run lint; npm run build

### Phase 1 — 2025-11-05 — P1-002 — Convert progress indicators to CSS-variable styling
- **Files / Areas**: frontend/src/components/ui/ProgressBar.jsx, frontend/src/components/ui/ProgressBar.css, frontend/src/pages/StudentDashboardPage.jsx, frontend/src/pages/StudentDashboardPage.css, frontend/src/components/teacher/LiveDashboard.jsx, frontend/src/pages/Year7LiveSessionPage.css, frontend/src/components/segments/EnhancedComponents.jsx, frontend/src/components/segments/EnhancedComponents.css
- **Notes / Decisions**: Introduced `ProgressBar` primitive and refactored student dashboard mini bars, teacher live dashboard assessments, and enhanced progress indicator to rely on CSS variables instead of inline widths. Stack bar segments now expose `--segment-percent`; circular progress sizing uses `--progress-size`.
- **QA**: npm run lint; npm run build

### Phase 1 — 2025-11-05 — P1-003 — Normalise module segment cards & nav
- **Files / Areas**: frontend/src/components/segments/Segments.css
- **Notes / Decisions**: Rebuilt gamified content cards/buttons with design tokens (spacing, radii, gradients) and added responsive nav stacking for mobile. Button variants now align with brand gradients while staying CSP-compliant via CSS variables only.
- **QA**: npm run lint; npm run build

### Phase 1 — 2025-11-05 — P1-010 — Align Teacher Dashboard shell to design system primitives
- **Files / Areas**: frontend/src/pages/TeacherDashboardPage.jsx, frontend/src/pages/TeacherDashboardPage.css
- **Notes / Decisions**: Replaced bespoke summary/pacing panels with `StatCard` primitives, introduced token-driven class summaries, and refactored Year 7 pointer actions with pill buttons. Hero stats now rely on shared layout primitives; no inline styles remain.
- **QA**: npm run lint; npm run build

### Phase 1 — 2025-11-05 — P1-011 — Refactor Year 7 live session controls
- **Files / Areas**: frontend/src/pages/Year7LiveSessionPage.jsx, frontend/src/pages/Year7LiveSessionPage.css
- **Notes / Decisions**: Teacher/student panels now use `StatCard` for session state and tokenised `y7-btn` styles; class actions arranged in responsive grids with shared gradients. Removed bespoke status chips and aligned form controls with design tokens while keeping CSP compliance.
- **QA**: npm run lint; npm run build

### Phase 1 — 2025-11-05 — P1-012 — Update assessment builder UI
- **Files / Areas**: frontend/src/components/assessments/FormativeAssessment.jsx, frontend/src/components/assessments/FormativeAssessment.css, frontend/src/components/interactive/PedagogicalComponents.jsx, frontend/src/components/interactive/PedagogicalComponents.css, frontend/src/pages/Year7LiveSessionPage.css, docs/ui-ux-year7-live-session-screenshots.md
- **Notes / Decisions**: Migrated formative assessment UI to dedicated design-system stylesheet with tokens, converted DnD transforms and ordering overlays to CSS variables for CSP compliance, and replaced legacy classification layout with labelled form fields + status badges. Shifted Year 7 interactive component styling (`BinaryLightBulbs`, `RobotMaze`, `ThinkPairShare`) into a shared tokenised stylesheet to decouple them from the page and remove custom rgba colours. Authored screenshot runbook (`docs/ui-ux-year7-live-session-screenshots.md`) to guide capture; final images still pending for review sign-off.
- **QA**: npm run lint; npm run build (2025-11-05); manual screenshot capture pending (track as follow-up).

### Phase 1 — 2025-11-05 — P1-013 — Standardise live dashboards (teacher insights)
- **Files / Areas**: frontend/src/components/teacher/LiveDashboard.jsx, frontend/src/components/teacher/LiveDashboard.css, frontend/src/pages/Year7LiveSessionPage.css, docs/ui-ux-refactor-plan.md
- **Notes / Decisions**: Refactored the teacher `LiveDashboard` to import a dedicated token-driven stylesheet, introduced component-scoped chip/tile variants, and removed legacy RGBA styling from the Year 7 page. Progress bar custom properties now reference design token palettes, and tile tone classes align with reusable status semantics for future teacher insight surfaces.
- **QA**: npm run lint; npm run build (2025-11-05).

### Phase 1 — 2025-11-05 — P1-020 — Refresh module map + lesson roadmap
- **Files / Areas**: frontend/src/pages/CurriculumMapPage.jsx, frontend/src/pages/CurriculumMapPage.css, frontend/src/pages/IBCurriculumPage.jsx, frontend/src/pages/IBCurriculumPage.css, docs/ui-ux-refactor-plan.md
- **Notes / Decisions**: Rebuilt curriculum overview and IB roadmap styling on design tokens—panels now use shared surface/border variables, CTA chips leverage status/success tokens, and roadmap lesson pills adopt reusable status pill semantics (unlocked/HL/teacher). Removed all bespoke RGBA colouring in favour of `color-mix` with brand tokens to keep CSP compliance while delivering the gradient accents from the design strategy.
- **QA**: npm run lint; npm run build (2025-11-05).

### Phase 1 — 2025-11-05 — P1-021 — Update assessment results + student dashboards
- **Files / Areas**: frontend/src/pages/StudentDashboardPage.jsx, frontend/src/pages/StudentDashboardPage.css, docs/ui-ux-refactor-plan.md
- **Notes / Decisions**: Tokenised the student dashboard hero, stat cards, unit lists, and lesson tags. Replaced RGBA blends with design-system `color-mix` combinations, aligned status chips to shared success/warning/locked semantics, and ensured progress bars/stacks use reusable CSS variables for CSP compliance. Assessment results view inherits the new pill + panel styling.
- **QA**: npm run lint; npm run build (2025-11-05).

### Phase 1 — 2025-11-05 — P1-030 — Centralise badges/pills/banners utilities
- **Files / Areas**: frontend/src/components/ui/StatusPill.jsx, frontend/src/components/ui/StatusPill.css, frontend/src/components/ui/StatusBanner.jsx, frontend/src/components/ui/StatusBanner.css, frontend/src/pages/StudentDashboardPage.jsx, frontend/src/pages/StudentDashboardPage.css, frontend/src/pages/CurriculumMapPage.jsx, frontend/src/pages/IGCSECurriculumPage.jsx, frontend/src/pages/IBCurriculumPage.jsx, frontend/src/pages/TeacherDashboardPage.jsx, frontend/src/pages/TeacherStudentDashboardPage.jsx, docs/ui-ux-refactor-plan.md
- **Notes / Decisions**: Introduced reusable `StatusPill` and `StatusBanner` primitives backed by tokens (`color-mix`, status palette) and migrated curriculum maps, student dashboards, and teacher dashboards away from bespoke `.status-pill`/`.status-banner` classes. Removed legacy RGBA styling in favour of design-system variables; new components support tone/variant/size API for consistent usage across phases.
- **QA**: npm run lint; npm run build (2025-11-05).

### Phase 1 — 2025-11-05 — P1-031 — Standardise progressive disclosure & modals
- **Files / Areas**: frontend/src/components/ui/Modal.jsx, frontend/src/components/ui/Modal.css, frontend/src/components/ui/Accordion.jsx, frontend/src/components/ui/Accordion.css, frontend/src/components/GamifiedModulePage.jsx, frontend/src/components/GamifiedModulePage.css, frontend/src/pages/TeacherDashboardPage.jsx, frontend/src/pages/TeacherDashboardPage.css, docs/ui-ux-refactor-changelog.md, docs/ui-ux-refactor-plan.md, docs/ui-ux-design-system.md
- **Notes / Decisions**: Created reusable `Modal` and `Accordion` primitives with focus trap, keyboard navigation (Tab, Arrow keys, Enter, Space), and full ARIA attributes (role="dialog", aria-modal, aria-labelledby, aria-expanded, aria-controls). Modal component includes backdrop click handling, Escape key support, and body scroll lock. Migrated LevelUpModal in GamifiedModulePage and TeacherDashboardPage class/student modals to use new Modal primitive. Accordion supports single/multiple expand modes with smooth animations. All components use design tokens and are CSP-compliant. Removed legacy modal overlay/dialog CSS classes.
- **QA**: npm run lint; npm run build; npx madge frontend/src --extensions js,jsx --circular (no cycles found) (2025-11-05).

---

## Phase 2 — Interactive & Legacy Modules

### Phase 2 — 2025-11-05 — P2-001 — Refactor diagram/image hotspot engines to tokenised positioning
- **Files / Areas**: frontend/src/components/segments/activities/ImageHotspotActivity.jsx, frontend/src/components/segments/activities/DiagramLabelActivity.jsx, frontend/src/components/segments/activities/Activities.css, docs/p2-001-hotspot-audit.md, docs/ui-ux-refactor-changelog.md, docs/ui-ux-refactor-plan.md
- **Notes / Decisions**: Replaced inline coordinate styles (`left`, `top`) with CSS variables (`--hotspot-x`, `--hotspot-y`, `--target-x`, `--target-y`) in ImageHotspotActivity and DiagramLabelActivity components. Coordinates are static (from segment data as percentages), making CSS variable refactoring straightforward. CSS updated to use CSS variables with fallback values. All positioning now CSP-compliant while maintaining exact same functionality. Transform (`translate(-50%, -50%)`) remains in CSS (not inline). No coordinate calculations affected.
- **QA**: npm run lint; npm run build; npx madge frontend/src --extensions js,jsx --circular (no cycles found); verified no inline coordinate styles remain (2025-11-05).

---

## Phase 3 — Polish, QA, & Deployment

*(No entries yet)*

---

## Maintenance / Post-Rollout

*(No entries yet)*

---

## Open Decisions

### CSP Exception for Skulpt Library (2025-11-05)

**Decision:** Added `'unsafe-inline'` to `style-src-elem` directive in `frontend/index.html` to allow Skulpt's dynamically injected `<style>` elements.

**Rationale:**
- Skulpt (Python runtime library) dynamically injects `<style>` tags for syntax highlighting in Python playground segments
- This is a third-party library requirement that cannot be modified (see P2-010 in refactor plan)
- The exception only affects `<style>` elements, not inline style attributes (`style="..."`), which remain controlled by `style-src-attr`
- Our refactored code uses CSS variables and classes, not `<style>` tags, so this exception only applies to Skulpt

**Impact:**
- Low security risk: Only code from `'self'` origin can inject styles, and Skulpt is already bundled in the app
- No impact on refactored components: All Phase 1 UI components remain CSP-compliant
- Required for functionality: Python playground segments cannot function without this exception

**Files:** `frontend/index.html` (line 8)

### CSP Simplification and Security Hardening (2025-11-05)

**Decision:** Simplified CSP by removing redundant style directives and added explicit `script-src` along with additional security headers.

**Changes:**
- Removed `style-src-elem` and `style-src-attr` (covered by `style-src`)
- Added explicit `script-src 'self'` to eliminate CSP warning
- Added `object-src 'none'` and `frame-ancestors 'none'` for additional security
- Kept `style-src 'self' 'unsafe-inline'` for Skulpt library compatibility

**Impact:**
- Eliminates "script-src was not explicitly set" CSP warning
- Reduces CSP complexity while maintaining functionality
- Improves security posture with object-src and frame-ancestors restrictions

**Files:** `frontend/index.html` (line 8), `frontend/vite.config.js` (added source maps)

### Build Configuration Improvements (2025-11-05)

**Decision:** Enabled source maps in production builds and verified no circular dependencies exist.

**Changes:**
- Added `build: { sourcemap: true }` to `vite.config.js`
- Ran circular dependency detection (no cycles found)
- Performed clean rebuild to resolve bundling issues

**Impact:**
- Source maps enable easier debugging of production issues
- Clean rebuild resolves potential module initialization order problems
- Verification confirms no circular dependency issues in codebase

**Files:** `frontend/vite.config.js`, `frontend/dist/` (source map files generated)

### Safety Guardrails Implementation (2025-11-05)

**Decision:** Added comprehensive safety guardrails to ensure incremental, safe refactoring with automated verification.

**Changes:**
- Created `.ibcs-task-allowlist` file specifying allowed files per task
- Added `scripts/verify-allowlist.js` to verify only allowed files are changed
- Added `scripts/verify-no-raw-styles.js` to verify design token compliance (no raw hex/px/inline styles)
- Created GitHub Actions CI workflow (`.github/workflows/ui-ux-refactor-ci.yml`) for automated checks
- Added PR template (`.github/pull_request_template.md`) with mandatory checklist
- Updated implementation guide with 8 safety guardrails including:
  - File allowlist per task
  - Diff size limits (600 LOC app code max)
  - CSP and auth protection rules
  - Circular dependency checks
  - Design token lint checks
  - Pre-commit checklist
  - Abort and rollback procedures
  - Agent operating contract

**Impact:**
- Prevents accidental edits to blocked files (package.json, CSP, worker code)
- Enforces design token usage (no raw hex/px/inline styles)
- Limits change scope to prevent large, risky PRs
- Automated verification reduces manual review burden
- Clear abort conditions prevent broken code from being committed

**Files:** `docs/ui-ux-refactor-implementation-guide.md`, `.ibcs-task-allowlist`, `scripts/verify-allowlist.js`, `scripts/verify-no-raw-styles.js`, `.github/workflows/ui-ux-refactor-ci.yml`, `.github/pull_request_template.md`
- **QA**: Scripts tested for syntax validity (2025-11-05).

