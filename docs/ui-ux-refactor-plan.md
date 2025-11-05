# UI/UX Design-System Rollout Plan

## Context

- Reference design guide: `docs/NEW-UI-UX-design-strategy.txt`
- Goal: migrate *all* surfaces to the shared design system (tokens, layout primitives, interaction patterns) while keeping the app fully functional under the stricter Content Security Policy (CSP).
- CSP baseline (set in `frontend/index.html`):
  - `style-src 'self' 'unsafe-inline';`
  - `style-src-elem 'self';`
  - `style-src-attr 'unsafe-inline';`
- Every refactor must be recorded in `docs/ui-ux-refactor-changelog.md` (see instructions below).

## Guiding Principles

1. **Design tokens first** – use only the palette, spacing, typography, shadows, and motion variables defined in `frontend/src/styles/global.css`.
2. **Shared primitives** – wrap new layouts with `ContentContainer`, `ResponsiveGrid`, shared cards/badges/buttons. Create additional primitives in `frontend/src/components/ui/` as needed.
3. **CSP compliance** – avoid new inline styles where possible. When external libraries require them, document the reason in the changelog.
4. **Parity with design strategy** – match layout, hierarchy, and interaction guidance from the strategy doc.
5. **Incremental delivery** – complete each phase end-to-end (code, QA, changelog) before starting the next.

## Phases

### Phase 0 – Audit & Backlog (completed)

- Inventory every screen/component against the strategy doc.
- Catalogue inline-style hotspots and note which can be refactored.
- Identify shared components still to be built.
- Produce a backlog grouped by phases and store it alongside this plan (update when new work is discovered).
- Log outcomes in `ui-ux-refactor-changelog.md` under “Phase 0”.

### Phase 1 – Core Experience Alignment

1. **Gamified Module Page**
   - Rebuild header/stat cards with tokens.
   - Convert progress indicators to CSS variables.
   - Normalise segment cards and responsive behaviour.
2. **Teacher Control Center**
   - Teacher dashboard, Year 7 live session, assessment builder, live dashboards.
   - Replace ad-hoc panels with shared card/grid primitives.
3. **Student Progress Tools**
   - Module map, lesson roadmap, assessment results, student dashboards.
   - Ensure call-to-actions, messages, and navigation align with the system.
4. **Utility UI Components**
   - Centralise badges, pills, banners, progressive disclosure, modals.

**Phase 1 Exit Criteria**

- No legacy colours/spacing remain on the targeted screens.
- Components are reusable and documented in the changelog.
- `npm run lint`, `npm run build`, and `npm run preview` pass without CSP warnings.

### Phase 2 – Interactive & Legacy Modules

1. **Activities & Hotspot Engines**
   - Diagram/image hotspots, enhanced components, formative activities.
   - Replace inline coordinates with CSS variable-driven positioning when feasible.
2. **Python/Skulpt Experiences**
   - Wrap UI shells in the design system; document any non-removable inline styles.
3. **Admin/Account/Legacy Pages**
   - Apply tokens/primitives to remaining pages.
4. **Documentation Refresh**
   - Update design guide snippets and include examples for new primitives.

**Phase 2 Exit Criteria**

- All interactive surfaces conform to the strategy.
- Inline styles are eliminated or documented with rationale.
- QA covers desktop + tablet; no regressions in key flows.

### Phase 3 – Polish, QA, & Deployment

- Accessibility audit (headings, focus states, contrast, semantic roles).
- Responsive/breakpoint validation.
- Bundle review (consider manual chunking/code-splitting if needed).
- Update README/design docs to reflect the new system.
- Final build/preview; regression tests for teacher/student flows.
- Deployment via `./deploy.sh`.

**Phase 3 Exit Criteria**

- No outstanding backlog items tied to design system adoption.
- Documentation updated; changelog reflects all major changes.
- Production build deployed without console warnings or lint errors.

## Backlog

Provide and maintain the task backlog grouped by phase. Update statuses as work progresses and reference task IDs in the changelog entries.

### Phase 0 — Audit & Backlog

| ID | Task | Dependencies | Status | Notes |
| --- | --- | --- | --- | --- |
| P0-001 | Capture end-to-end screen inventory (teacher, student, admin flows) | — | Completed | Inventory validated with product/engineering stakeholders (2025-11-05); confirmed no outstanding surfaces. |
| P0-002 | Audit inline-style hotspots across frontend codebase | P0-001 | Completed | Hotspot catalogue reviewed and linked to Phase 1/2 follow-up tasks; no additional CSP risks identified (2025-11-05). |
| P0-003 | Catalogue missing design primitives/tokens | P0-001 | Completed | Compare strategy doc layout patterns with existing components in `frontend/src/components/ui/`; list primitives to build. |
| P0-005 | Align published design tokens with `frontend/src/styles/global.css` | P0-003 | Completed | Added brand (`--cs-*`), status, gradient, spacing alias, and motion tokens to `:root` (2025-11-05). |
| P0-004 | Define QA + verification checklist for refactor phases | P0-001 | Completed | QA matrix documented (2025-11-05) covering lint/build/preview, targeted manual checks, and regression gates per phase. |
| P0-006 | Phase 0 close-out validation | P0-001, P0-002, P0-003, P0-004, P0-005 | Completed | Confirmed backlog + changelog alignment and marked Phase 0 complete ahead of continued Phase 1 delivery (2025-11-05). |

### Phase 1 — Core Experience Alignment

| ID | Task | Dependencies | Status | Notes |
| --- | --- | --- | --- | --- |
| P1-001 | Rebuild Gamified Module Page header + stat cards with tokens | P0-003 | Completed | Applied brand tokens + new `StatCard` primitive to Gamified Module header (2025-11-05). |
| P1-002 | Convert module progress indicators to CSS variable-driven styling | P0-003 | Completed | Replaced inline widths with `ProgressBar` primitive + CSS vars across gamified/student dashboards (2025-11-05). |
| P1-003 | Normalise module segment cards & responsive behaviour | P1-001 | Completed | Segment cards/buttons now use shared tokens + mobile nav adjustments (2025-11-05). |
| P1-010 | Align Teacher Dashboard shell to design system primitives | P0-003 | Completed | Hero + detail cards now use `StatCard` and tokenised layout; summary/pacing CTA refactored (2025-11-05). |
| P1-011 | Refactor Year 7 live session controls | P1-010 | Completed | Teacher/student panels now use tokenised `StatCard` + button styles; status/pointer actions centralised (2025-11-05). |
| P1-012 | Update assessment builder UI | P0-003 | In Progress | Refactored `FormativeAssessment` + Year 7 interactive components to use token-driven layouts with shared styles; screenshot runbook documented in `docs/ui-ux-year7-live-session-screenshots.md` and awaiting capture for design review sign-off. |
| P1-013 | Standardise live dashboards (teacher insights) | P0-002 | Completed | Live dashboard component now uses tokenised cards, chips, and progress styling with standalone CSS; ready for wider teacher insights adoption (2025-11-05). |
| P1-020 | Refresh module map + lesson roadmap | P0-003 | Completed | Curriculum map + IB roadmap styles refactored to token-driven surfaces/chips with reusable status pills (2025-11-05). |
| P1-021 | Update assessment results + student dashboards | P1-020 | Completed | Student dashboard refactored to token-driven surfaces, status pills, and reusable progress stacks; assessment results styling aligned (2025-11-05). |
| P1-030 | Centralise badges/pills/banners utilities | P0-003 | Completed | Added reusable `StatusPill`/`StatusBanner` primitives and migrated student dashboard, curriculum map, and IB roadmap to token-driven variants (2025-11-05). |
| P1-031 | Standardise progressive disclosure & modals | P1-030 | Completed | Created reusable `Modal` and `Accordion` primitives with focus trap, keyboard navigation, and ARIA attributes. Migrated LevelUpModal and TeacherDashboardPage modals to use new Modal component (2025-11-05). |

### Phase 2 — Interactive & Legacy Modules

| ID | Task | Dependencies | Status | Notes |
| --- | --- | --- | --- | --- |
| P2-001 | Refactor diagram/image hotspot engines to tokenised positioning | P0-002 | Completed | Replaced inline coordinate styles with CSS variables (`--hotspot-x`, `--hotspot-y`, `--target-x`, `--target-y`) in ImageHotspotActivity and DiagramLabelActivity. All positioning now CSP-compliant (2025-11-05). |
| P2-002 | Align formative activity components with design system | P2-001 | Planned | Introduce shared feedback panels and button groups; ensure keyboard navigation. |
| P2-010 | Wrap Python/Skulpt shells in design system layout | P0-003 | Planned | Apply `ContentContainer` wrappers; document unavoidable inline styles required by Skulpt runtime. |
| P2-011 | Audit embedded console/editor theming | P2-010 | Planned | Map syntax highlighting to token palette; ensure CSP compliance. |
| P2-020 | Refresh admin/account/legacy pages | P0-003 | Planned | Apply shared card/grid primitives; remove remaining bespoke CSS variables. |
| P2-030 | Update documentation + design guide examples | P1-030 | Planned | Sync `docs/NEW-UI-UX-design-strategy.txt` snippets with new primitives and usage guidance. |

### Phase 3 — Polish, QA, & Deployment

| ID | Task | Dependencies | Status | Notes |
| --- | --- | --- | --- | --- |
| P3-001 | Conduct accessibility audit (WCAG 2.1 AA focus) | P1-030 | Planned | Validate colour contrast, focus outlines, ARIA roles across teacher/student flows. |
| P3-002 | Validate responsive breakpoints across devices | P3-001 | Planned | Document viewport behavioural matrix (desktop/tablet/mobile) per strategy doc guidance. |
| P3-003 | Review bundle size & code splitting | P2-020 | Planned | Evaluate manual chunking opportunities; coordinate with performance budget. |
| P3-004 | Finalise documentation + README updates | P3-003 | Planned | Ensure README and design docs reflect new primitives + QA steps. |
| P3-005 | Execute final build/preview/deploy runbook | P3-004 | Planned | Run lint/build/preview; capture deployment output in changelog; confirm no console warnings. |

## Phase 0 Artifacts

### Screen Inventory — Draft (2025-11-05)

#### Teacher Experience

| Surface | Purpose | Primary files | Notes |
| --- | --- | --- | --- |
| Teacher dashboard shell | Manage classes, cohorts, pacing, credential workflows | `frontend/src/pages/TeacherDashboardPage.jsx`, `frontend/src/pages/TeacherDashboardPage.css` | Dense data table and modal interactions; heavy use of bespoke layout classes to refactor into tokens + `ResponsiveGrid`. |
| Teacher → Student dashboard | Drill into individual student progress and lesson unlock state | `frontend/src/pages/TeacherStudentDashboardPage.jsx` | Reuses student dashboard layout; mixed typography and badge styles that diverge from tokens. |
| Year 7 live session controller | Run live deck, trigger assessments, monitor responses | `frontend/src/pages/Year7LiveSessionPage.jsx`, `frontend/src/components/teacher/LiveDashboard.jsx` | Contains inline conditional styling for live state indicators; high CSP risk areas. |
| Year 7 pacing map (teacher view) | Review class pacing, accessible slides, session codes | `frontend/src/pages/Year7MapPage.jsx`, `frontend/src/pages/Year7MapPage.css` | Shared with students; teacher branch shows richer controls that must be aligned with shared card primitives. |
| Assessment builder primitives | Assemble formative activities inside live session tooling | `frontend/src/components/assessments/FormativeAssessment.jsx` | Currently mixes inline styles and legacy CSS modules. |

#### Student Experience

| Surface | Purpose | Primary files | Notes |
| --- | --- | --- | --- |
| Student dashboard | Track progress, XP, recent activity, CTA to curriculum | `frontend/src/pages/StudentDashboardPage.jsx`, `frontend/src/pages/StudentDashboardPage.css` | Multiple custom card layouts and progress meters; candidate for shared stat card + progress primitive. |
| Gamified module shells | Deliver B1/B2 module journeys with stage + segment cards | `frontend/src/pages/B1ModulePage.jsx`, `frontend/src/pages/B2ModulePage.jsx`, `frontend/src/components/GamifiedModulePage.jsx`, `frontend/src/components/GamifiedModulePage.css` | Legacy gradients and spacing tokens hard-coded; refactor to design tokens and shared segment components. |
| Lesson detail view | Lesson content wrapper with navigation | `frontend/src/pages/LessonPage.jsx`, `frontend/src/pages/LessonPage.css` | Inline style attributes for media blocks observed; validate against CSP. |
| Topic overview | Provide chapter context + segment listings | `frontend/src/pages/TopicPage.jsx`, `frontend/src/pages/TopicPage.css` | Uses bespoke typography classes; unify with token-driven type scale. |
| Curriculum + roadmap maps | Global curriculum navigation, IB/IGCSE maps | `frontend/src/pages/CurriculumMapPage.jsx`, `frontend/src/pages/CurriculumMapPage.css`, `frontend/src/pages/IBCurriculumPage.jsx`, `frontend/src/pages/IGCSECurriculumPage.jsx` | Multiple panel layouts, pills, and status badges outside shared primitives. |
| Year 7 pacing map (student branch) | Student-facing view of live lesson status | `frontend/src/pages/Year7MapPage.jsx` | Shares component with teacher; student branch uses simplified status badges. |

#### Admin / Global & Auth

| Surface | Purpose | Primary files | Notes |
| --- | --- | --- | --- |
| Admin dashboard | Manage tenant-level settings and activation toggles | `frontend/src/pages/AdminDashboardPage.jsx`, `frontend/src/pages/AdminDashboardPage.css` | Heavy table usage; migrate to tokenised table styles and shared banner components. |
| Account settings | Manage personal profile, password, organisation | `frontend/src/pages/AccountPage.jsx`, `frontend/src/pages/AccountPage.css` | Form layout relies on legacy spacing and inline flex declarations. |
| Authentication entry | Login + role routing | `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/LoginPage.css` | Inline gradient background and button styles need token alignment. |

#### Shared Shells & High-Impact Components

- `frontend/src/components/Layout.jsx`, `frontend/src/components/Layout.css`: Global shell, nav, and top-level spacing decisions; first candidate for token sweep.
- `frontend/src/components/ui/ContentContainer.jsx` & `ResponsiveGrid.jsx`: Existing primitives to extend; audit usage for consistency.
- `frontend/src/components/segments/*`: Segment cards powering gamified modules; contain bespoke colours and box shadows.
- `frontend/src/components/interactive/PedagogicalComponents.jsx`: Interactive hotspots and activity surfaces; likely to retain inline styles that must be documented if unavoidable.
- `frontend/src/components/slides/SlideRenderer.jsx`: Live session slide host, includes inline calculations for layout and accessible overlays.

> Next step: validate inventory coverage with product + engineering owners, then link each backlog item (P0-001) to the relevant surfaces before moving tasks to “Ready”.

### Inline Style Hotspots — Initial Sweep (2025-11-05)

| Cluster | Files / Components | Inline usage | Initial recommendation |
| --- | --- | --- | --- |
| Progress + completion bars | `frontend/src/pages/StudentDashboardPage.jsx`, `frontend/src/components/GamifiedModulePage.jsx`, `frontend/src/components/teacher/LiveDashboard.jsx` | Inline `width` percentages applied directly to progress bar divs. | Replace with CSS custom properties (e.g., `style={{ '--percent': value }}`) and drive width via stylesheet to satisfy CSP while keeping dynamic sizing. |
| Circular progress + sizing | `frontend/src/pages/StudentDashboardPage.jsx` | Inline `width`/`height` for circular indicator wrapper. | Introduce token-backed size variants in CSS and pass semantic size names instead of raw pixel values. |
| DnD + motion transforms | `frontend/src/components/assessments/FormativeAssessment.jsx` | Inline `transform`/`opacity` computed by `@dnd-kit` utilities. | Library expects inline transforms; document as CSP exception and explore toggling to CSS variables only if motion library allows. |
| Hotspot coordinate overlays | `frontend/src/components/segments/activities/ImageHotspotActivity.jsx`, `DiagramLabelActivity.jsx` | Inline `left`/`top`/`transform` to position interactive hotspots. | Convert to CSS vars (`--x`, `--y`) with absolutely positioned elements consuming vars in CSS; document fallback if user-generated coordinates require inline usage. |
| Curriculum accent colours | `frontend/src/pages/IGCSECurriculumPage.jsx` | Inline `borderTopColor` for track accent. | Move palette to design tokens and expose accent variant class names. |
| Confetti modal styling | `frontend/src/components/GamifiedModulePage.jsx` (`LevelUpModal`) | Inline CSS custom props (`--delay`, `--offset`) for confetti animation seeds. | Refactor to generate CSS variables via data attributes or scoped stylesheet; keep documented as exception if randomness must stay inline. |
| Layout primitives | `frontend/src/components/ui/ResponsiveGrid.jsx` | Component accepts `style` prop to merge layout overrides. | Audit usages; prefer explicit props for gaps/columns so consumer code avoids passing raw inline styles. |

> Continue P0-002 by tracing actual runtime usages of these components and drafting refactor issues (tokens, primitives, or documented CSP exceptions).

### Design Token Gap Analysis — 2025-11-05

| Token cluster | Observed usage | Missing/misaligned tokens | Action notes |
| --- | --- | --- | --- |
| Brand palette (`--cs-*`) | `frontend/src/components/GamifiedModulePage.css`, Year 7 teacher/student CSS, login shell | `--cs-blue`, `--cs-gold`, `--cs-surface`, gradients (`--cs-gradient-card`, `--cs-gradient-xp`, `--cs-gradient-sidebar`) only defined in docs/assets, not `global.css`. | Added to `frontend/src/styles/global.css` via P0-005 (2025-11-05); audit consumers as refactors land. |
| Status & feedback colours | XP notifications, inline badge states, assessment feedback | Semantic tokens such as `--color-success`, `--color-warning`, `--color-error`, streak/XP-specific hues absent from `global.css`. | Added status + XP tokens in P0-005 (2025-11-05); ensure dark-mode variants during later polish. |
| Shadows & elevation | Gamified cards expect `--shadow-xl`/`--shadow-2xl`; hero sections rely on larger depths | `global.css` stops at `--shadow-lg`. | Extended elevation scale (xl/2xl) in `global.css` (P0-005); adopt during component sweep. |
| Motion | Gamified modal + streak components reference bounce/easing patterns | `--transition-bounce` and timing aliases not present. | Added `--transition-bounce` (P0-005) and noted follow-up for spring/delay tokens if required. |
| Radius scale | Gamified badges & pill buttons use `var(--radius-full)` | `global.css` exports `--radius-pill` but not `--radius-full`. | Added `--radius-2xl` and `--radius-full` aliases in `global.css` (P0-005). |
| Spacing aliases | Design guide references `--space-sm`, `--space-xl`, etc. | Current implementation uses numeric scale `--space-1..10` only. | Added alias map to `:root` (P0-005) so documentation + code can converge on unified naming. |

### Primitive Backlog — 2025-11-05

| Primitive | Purpose | Proposed location | Dependencies | Notes |
| --- | --- | --- | --- | --- |
| `StatCard` / `MiniStat` | Standardise hero + dashboard summary cards with icon, value, delta | `frontend/src/components/ui/StatCard.jsx` | P0-005 (tokens), P1-001 | Implemented for Gamified Module header (2025-11-05); extend coverage to dashboards in upcoming tasks. |
| `ProgressBar` + `ProgressCircle` | Token-driven linear/circular progress indicators without inline width styling | `frontend/src/components/ui/ProgressBar.jsx` | P0-005, P1-002 | `ProgressBar` implemented (2025-11-05) and adopted in gamified/student/teacher surfaces; evaluate circular variant during later polish. |
| `StatusPill` / `StatusBadge` | Unified success/info/warning/error treatments | `frontend/src/components/ui/StatusPill.jsx` | P0-005 | Wrap existing `.pill`/`.badge` styles; expose tone + size props; reuse across dashboards and maps. |
| `Toast` / `Snackbar` | Consistent notifications (XP, pacing alerts) with auto-dismiss | `frontend/src/components/ui/Toast.jsx` | P0-005, motion tokens | Support stacked toasts; centralise XP notification implementation. |
| `ModalShell` | Shared modal/dialog scaffolding with focus trap + token spacing | `frontend/src/components/ui/Modal.jsx` | P0-005 | Needed for Year 7 live session controls and assessment builder overlays. |
| `DataTable` veneer | Table wrapper aligning with EnhancedComponents but tokenised | `frontend/src/components/ui/DataTable.jsx` | P0-005, EnhancedComponents audit | Provide consistent sorting, sticky header patterns for teacher dashboards and admin pages. |
| `ActionBar` / `Toolbar` | Layout primitive for top-of-page CTA clusters | `frontend/src/components/ui/ActionBar.jsx` | P1 shells | Remove duplicated flexbox inline styling across teacher/student hero sections. |

> Feed these primitives into Phase 1 backlog (Utility components) and update component refactors to depend on their availability before implementation starts.

### QA & Verification Checklist — 2025-11-05

| Phase | Automated checks | Manual / targeted QA | Regression focus | Exit artifacts |
| --- | --- | --- | --- | --- |
| Phase 0 (Audit & Backlog) | `npm run lint` on touched files (optional during documentation), spell-check on docs | Stakeholder review of inventories + backlog | Ensure backlog coverage, no blocking CSP risks | Updated plan, changelog entries, open questions list |
| Phase 1 (Core Experience) | `npm run lint`, `npm run test -- --watch=false` (if applicable), `npm run build` | Smoke test teacher dashboard, gamified module, student dashboard, curriculum map on desktop + tablet breakpoints | Verify design tokens adoption (colours/spacing), navigation/state regressions | Changelog entry with files, QA notes; screenshots for UI deltas |
| Phase 2 (Interactive & Legacy) | Phase 1 + targeted unit tests for activities, `npm run preview` with CSP instrumentation | Manual hotspot/activity runs (mouse + touch), Skulpt python experiences, admin/account flows | Focus on inline-style removal, interaction latency, keyboard support | Changelog entry, updated documentation snippets, CSP exceptions logged |
| Phase 3 (Polish & Deployment) | Full pipeline: lint, test, build, `npm run preview`, Lighthouse or Axe scans | Accessibility spot-check (screen reader navigation, focus order), responsive audit (mobile/tablet/desktop) | Ensure no console warnings, performance budgets intact | Final changelog summary, README/design-doc updates, deployment log |

**General QA notes**
- Record any CSP exceptions or third-party inline-style requirements in `docs/ui-ux-refactor-changelog.md` under “Open Decisions”.
- Capture before/after screenshots when visual hierarchy changes materially.
- For regressions found during manual QA, create follow-up tasks linked to backlog IDs before closing the phase.

## Workflow Instructions

1. **Before starting a task**
   - Confirm it’s prioritised in the backlog.
   - Note the task ID/reference in the changelog entry.

2. **During implementation**
   - Refactor component(s) to use tokens/primitives.
   - Remove or document inline styles.
   - Update or create shared utilities where appropriate.

3. **After implementation**
   - Run `npm run lint`, `npm run build`, `npm run preview` (smoke test).
   - Update `docs/ui-ux-refactor-changelog.md` with:
     - Summary of work (1–2 sentences).
     - Files touched.
     - Decisions/trade-offs (especially CSP inline-style notes).
     - QA steps performed.
   - Submit PR or merge (depending on workflow).

4. **Deployment**
   - Once a phase is complete and approved:
     ```bash
     git status
     git add <files>
     git commit -m "<concise message>"
     git push origin main
     ./deploy.sh
     ```
   - Ensure deployment output is captured in the changelog.

## Changelog

- All substantive changes must be recorded in `docs/ui-ux-refactor-changelog.md`.
- Use the template provided in that file (Phase, Date, Task ID, Summary, Files, Notes, QA).
- Treat the changelog as the authoritative timeline for the refactor.

## Questions / Decisions Log

- Document open questions or decisions (e.g., third-party inline styles we cannot remove) at the bottom of `ui-ux-refactor-changelog.md` under “Open Decisions”.

---

This plan is a living document. Update the phase sections when scope evolves, and ensure the changelog stays in sync with every change.

