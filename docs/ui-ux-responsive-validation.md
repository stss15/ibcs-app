# Responsive Validation — Phase 3 (2025-11-06)

## Method

- Reviewed breakpoint usage across tokenised CSS (`rg "@media" frontend/src -g "*.css"`).
- Cross-referenced each high-impact surface identified in the rollout plan (teacher dashboard, student dashboard, curriculum maps, Year 7 live session, admin/account/login).
- Verified that spacing/typography adjustments use design tokens (`--space-*`, `--text-*`) and modern layout primitives (grid/flex) rather than pixel overrides.
- Headless environment prevents live viewport testing; document focuses on code-level verification and identifies scenarios to spot-check visually once a GUI is available.

## Key Surfaces

| Surface | Breakpoints Observed | Responsive Behaviour Summary |
| --- | --- | --- |
| Teacher Dashboard (`TeacherDashboardPage.css`) | `@media (max-width: 1024px)`, `@media (max-width: 768px)` | Dashboard cards stack into a single column, action bar collapses into wrapped `ButtonGroup`, token spacing preserved. |
| Student Dashboard (`StudentDashboardPage.css`) | `@media (max-width: 1080px)`, `@media (max-width: 720px)` | Stat grid converts to two-column then single-column layouts, lesson timeline switches to stacked cards, CTA buttons keep pill styling. |
| Curriculum Maps (`CurriculumMapPage.css`, `IBCurriculumPage.css`) | `@media (min-width: 1024px)`, `@media (max-width: 900px)`, `@media (max-width: 640px)` | Module table shows full detail on desktop, collapses to stacked lessons with status pills on tablets, typography scales via `clamp()` in hero. |
| Year 7 Live Session (`Year7LiveSessionPage.css`, `Year7MapPage.css`) | `@media (max-width: 1080px)`, `@media (max-width: 700px)`, `@media (max-width: 760px)` | Control panes move below stat cards, grid templates shift to single-column, CTA button groups wrap while keeping spacing tokens. |
| Auth & Admin (`LoginPage.css`, `AdminDashboardPage.css`, `AccountPage.css`) | `@media (max-width: 640px)`, `@media (max-width: 860px)`, `@media (min-width: 900px)` | Forms switch to vertical layout, sidebar collapses, table actions align end on desktop but stack on mobile via flexbox + tokens. |
| Shared Layout (`Layout.css`, `global.css`) | `@media (max-width: 1199px)`, `@media (max-width: 1023px)`, `@media (max-width: 640px)` | Sidebar transitions from persistent to overlay mode, topbar condenses avatar menu, `ResponsiveGrid` gap tokens adapt per breakpoint. |

## Follow-up Visual QA (when GUI available)

1. Teacher Dashboard at 1280px, 1024px, and 768px to confirm stat card wrapping.
2. Student Dashboard at 720px to validate stacked progress cards.
3. Year 7 live session at 700px to ensure button groups wrap without overflow.
4. Login and Account pages at 360px for form field readability and focus states.

## Commands

```bash
rg "@media" frontend/src -g "*.css"
```
