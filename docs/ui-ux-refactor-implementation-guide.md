# UI/UX Refactor - Incremental Implementation Guide

**This document extends `ui-ux-refactor-plan.md` with explicit, step-by-step implementation instructions.**

## Purpose

This guide provides granular, actionable instructions for completing the remaining UI/UX refactor work. Each task is broken down into discrete steps with clear start/stop points, documentation requirements, and codebase-wide considerations.

## Implementation Principles

1. **Incremental Changes Only** - No task exceeds 300-500 LOC changes per session
2. **Documentation First** - Update changelog and plan before moving to next task
3. **QA After Each Task** - Run lint, build, and manual smoke tests before proceeding
4. **Codebase Awareness** - Check for related files/components that might be affected
5. **Stop Points** - Clear checkpoints after each major change for review

## Safety Guardrails

**MANDATORY: These guardrails must be followed for every task. No exceptions.**

### 1. File Allowlist Per Task

Each task specifies exactly which files may be edited. **NEVER edit files outside the allowlist.**

**Format:**
```markdown
**Allowed Files:**
- `frontend/src/components/ui/Modal.jsx` (create)
- `frontend/src/components/ui/Modal.css` (create)
- `frontend/src/pages/LoginPage.jsx` (edit)
- `frontend/src/pages/LoginPage.css` (edit)
- `docs/ui-ux-refactor-changelog.md` (edit)
- `docs/ui-ux-refactor-plan.md` (edit)
```

**Verification:**
- Before committing, verify only allowed files are changed
- If any other files are modified, **STOP and revert**

### 2. Diff Size Limits

**HARD LIMITS:**
- Maximum 600 lines added/changed per task (app code only)
- Maximum 1000 lines total per PR (including docs)
- If limit exceeded, **STOP and split into smaller tasks**

**Blocked File Changes (unless task explicitly allows):**
- `package.json` / `package-lock.json`
- `.env*` files
- `frontend/index.html` (CSP changes)
- `worker/**/*` (worker code)
- Lock files, config files outside scope

### 3. CSP and Auth Protection

**CSP Rules:**
- Keep: `style-src 'self' 'unsafe-inline'` only
- Keep: `script-src 'self'` (no 'unsafe-inline' or 'unsafe-eval')
- **NEVER** modify CSP meta tag unless task is tagged `[CSP-CHANGE]`
- **NEVER** add `'unsafe-eval'` or inline script permissions

**Auth Rules:**
- **NEVER** modify authentication code unless task is tagged `[AUTH]`
- **NEVER** modify CORS settings unless task is tagged `[AUTH]`
- **NEVER** modify worker authentication handlers

**Verification:**
- Before committing, check if CSP meta tag was modified
- If modified without `[CSP-CHANGE]` tag, **STOP and revert**

### 4. Cycle Check and Console Budget

**MANDATORY CHECKS:**
1. Run circular dependency check:
   ```bash
   npx madge frontend/src --extensions js,jsx --circular
   ```
   - **MUST** show "No circular dependency found!"
   - If cycles found, **STOP and fix before proceeding**

2. Build and preview test:
   ```bash
   npm run build
   npm run preview
   ```
   - Open browser console
   - **ZERO** console errors allowed
   - **ZERO** ReferenceError/TypeError/CSP violations
   - If any errors, **STOP and fix**

### 5. Design Token Lint

**MANDATORY CHECK:**
```bash
grep -R --line-number -E 'style=|#[0-9A-Fa-f]{3,6}\b|\b\d+px\b' frontend/src | \
  grep -v 'global.css' | \
  grep -v 'node_modules' | \
  grep -v '.map' && echo "ERROR: Raw styles found" && exit 1
```

**Blocked Patterns:**
- Inline `style="..."` attributes (use CSS variables: `style={{ '--var': value }}`)
- Raw hex colors: `#ff0000`, `#fff` (use tokens: `var(--color-primary-800)`)
- Hardcoded pixels: `10px`, `20px` (use tokens: `var(--space-2)`, `var(--space-4)`)

**Exceptions:**
- `frontend/src/styles/global.css` (token definitions)
- Third-party library code (documented exceptions)
- CSS variable assignments: `style={{ '--percent': '50%' }}`

**If violations found, STOP and fix before proceeding**

### 6. Pre-Commit Checklist

**MANDATORY: Complete ALL items before committing**

- [ ] Only allowed files changed (verify with `git status`)
- [ ] No package.json, lockfiles, .env*, CSP, or worker edits (unless task allows)
- [ ] `npm run lint` passed with zero errors
- [ ] `npm run build` passed with zero errors
- [ ] `npx madge frontend/src --extensions js,jsx --circular` passed
- [ ] Preview server shows zero console errors
- [ ] No raw styles found (hex, px, inline style=)
- [ ] Changelog entry added with:
  - Phase, date, task ID
  - Files changed
  - Decisions/notes
  - QA commands run
- [ ] Plan updated (task marked completed)
- [ ] Diff size within limits (<600 LOC app code)

### 7. Abort and Rollback Procedures

**If ANY check fails:**

1. **STOP immediately** - Do not continue
2. **Revert changes:**
   ```bash
   git status  # Review what changed
   git checkout -- <file>  # Revert specific files
   # OR
   git reset --hard HEAD  # Revert all if necessary
   ```
3. **Document the issue** in changelog under "Open Decisions"
4. **Do not proceed** until issue is resolved

**If task cannot be completed:**
- Document why in changelog
- Mark task as "Blocked" in plan
- Move to next task (if dependencies allow)

### 8. Agent Operating Contract

**When implementing any task, you MUST:**

1. **Only edit files listed in task allowlist**
2. **Never touch:**
   - `package.json` / lockfiles (unless task allows)
   - `.env*` files
   - CSP meta tag (unless task tagged `[CSP-CHANGE]`)
   - Worker code (unless task tagged `[AUTH]`)
3. **Always run:**
   ```bash
   npm run lint
   npm run build
   npx madge frontend/src --extensions js,jsx --circular
   npm run preview  # Check console for errors
   ```
4. **If any step fails:**
   - Revert last change
   - Stop immediately
   - Document issue
5. **Always update:**
   - `docs/ui-ux-refactor-changelog.md` with phase, files, decisions, QA commands
   - `docs/ui-ux-refactor-plan.md` with task status

## Task Breakdown

---

## Phase 1 - Remaining Tasks

### P1-031: Standardise Progressive Disclosure & Modals

**Estimated LOC:** ~200-300  
**Complexity:** Medium  
**Dependencies:** P1-030 (completed)

**Allowed Files:**
- `frontend/src/components/ui/Modal.jsx` (create)
- `frontend/src/components/ui/Modal.css` (create)
- `frontend/src/components/ui/Accordion.jsx` (create)
- `frontend/src/components/ui/Accordion.css` (create)
- `frontend/src/components/GamifiedModulePage.jsx` (edit)
- `frontend/src/components/GamifiedModulePage.css` (edit)
- `frontend/src/pages/TeacherDashboardPage.jsx` (edit)
- `frontend/src/pages/TeacherDashboardPage.css` (edit)
- `docs/ui-ux-refactor-changelog.md` (edit)
- `docs/ui-ux-refactor-plan.md` (edit)
- `docs/ui-ux-design-system.md` (edit)

**Blocked Files:**
- `package.json` / `package-lock.json`
- `frontend/index.html` (CSP)
- Any files not listed above

#### Pre-Implementation Checklist

- [ ] Review existing modal/disclosure usage in codebase
- [ ] Identify all files using modals/disclosure patterns
- [ ] Review accessibility requirements from design strategy doc
- [ ] Confirm no breaking changes to existing functionality

#### Step 1: Audit Current Modal/Disclosure Usage (STOP POINT)

**Action:**
1. Search codebase for modal/disclosure patterns:
   ```bash
   grep -r "modal\|Modal\|disclosure\|Disclosure\|accordion\|Accordion" frontend/src --include="*.jsx" --include="*.js"
   ```
2. List all files found
3. Document current implementations in a temporary file: `docs/p1-031-modal-audit.md`

**Files to Check:**
- `frontend/src/components/GamifiedModulePage.jsx` (LevelUpModal)
- `frontend/src/pages/TeacherDashboardPage.jsx` (class/student modals)
- Any other modal/disclosure usage

**Output:**
- List of files using modals/disclosures
- Current implementation patterns
- Accessibility gaps identified

**Stop Point:** Review audit results before proceeding

**Abort Conditions:**
- If audit reveals >500 LOC changes needed, **STOP** and split task
- If files outside allowlist need changes, **STOP** and update allowlist

#### Step 2: Create ModalShell Primitive (STOP POINT)

**Action:**
1. Create `frontend/src/components/ui/Modal.jsx`
2. Create `frontend/src/components/ui/Modal.css`
3. Implement:
   - Focus trap (use `focus-trap-react` or custom implementation)
   - Escape key handling
   - Backdrop click handling
   - ARIA attributes (role="dialog", aria-modal, aria-labelledby)
   - Token-driven styling (spacing, shadows, borders)
   - Animation (fade in/out using design tokens)

**Requirements:**
- Use design tokens from `global.css`
- CSP-compliant (no inline styles)
- Accessible (WCAG 2.1 AA)
- Props: `isOpen`, `onClose`, `title`, `children`, `size` (sm/md/lg/full)

**Test:**
- `npm run lint` - **MUST pass with zero errors**
- `npm run build` - **MUST pass with zero errors**
- `npx madge frontend/src --extensions js,jsx --circular` - **MUST show no cycles**
- Manual test: Render modal, test focus trap, escape key, backdrop click
- Check browser console: **ZERO errors**

**Abort Conditions:**
- If lint fails, **STOP** and fix
- If build fails, **STOP** and fix
- If circular dependencies found, **STOP** and fix
- If console errors appear, **STOP** and fix

**Stop Point:** Modal primitive must pass ALL checks above before proceeding

#### Step 3: Create Accordion/Disclosure Primitive (STOP POINT)

**Action:**
1. Create `frontend/src/components/ui/Accordion.jsx`
2. Create `frontend/src/components/ui/Accordion.css`
3. Implement:
   - Single/multiple expand modes
   - Keyboard navigation (Arrow keys, Enter, Space)
   - ARIA attributes (aria-expanded, aria-controls)
   - Smooth expand/collapse animations (using design tokens)
   - Token-driven styling

**Requirements:**
- Use design tokens
- CSP-compliant
- Accessible keyboard navigation
- Props: `items`, `multiple`, `defaultExpanded`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Keyboard navigation, expand/collapse animations

**Stop Point:** Accordion primitive must pass lint, build, and manual tests

#### Step 4: Migrate Existing Modals (STOP POINT)

**Action:**
1. Start with `GamifiedModulePage.jsx` LevelUpModal
2. Replace existing modal with `Modal` component
3. Test functionality remains intact
4. Update any related CSS

**Files to Update:**
- `frontend/src/components/GamifiedModulePage.jsx`
- `frontend/src/components/GamifiedModulePage.css` (remove modal styles)

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Level up modal appears and functions correctly

**Stop Point:** First modal migration must work perfectly before proceeding

#### Step 5: Migrate Teacher Dashboard Modals (STOP POINT)

**Action:**
1. Update `TeacherDashboardPage.jsx` class modal
2. Update `TeacherDashboardPage.jsx` student modal
3. Test all modal interactions
4. Remove legacy modal CSS from `TeacherDashboardPage.css`

**Files to Update:**
- `frontend/src/pages/TeacherDashboardPage.jsx`
- `frontend/src/pages/TeacherDashboardPage.css`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: All modals work, forms submit correctly

**Stop Point:** All modals must work before proceeding

#### Step 6: Documentation & Changelog Update (STOP POINT)

**Action:**
1. Update `docs/ui-ux-refactor-changelog.md`:
   - Add entry for P1-031
   - List all files changed
   - Document design decisions
   - Note accessibility improvements
2. Update `docs/ui-ux-refactor-plan.md`:
   - Mark P1-031 as "Completed"
   - Add completion date
3. Update `docs/ui-ux-design-system.md`:
   - Document Modal component usage
   - Document Accordion component usage
   - Add examples

**Files to Update:**
- `docs/ui-ux-refactor-changelog.md`
- `docs/ui-ux-refactor-plan.md`
- `docs/ui-ux-design-system.md`

**Stop Point:** All documentation must be updated before marking task complete

---

## Phase 2 - Interactive & Legacy Modules

### P2-001: Refactor Diagram/Image Hotspot Engines

**Estimated LOC:** ~978 (includes P2-002)  
**Complexity:** High  
**Dependencies:** P0-002 (completed)

**⚠️ WARNING: This task exceeds recommended 500 LOC limit. Consider splitting into smaller sub-tasks.**

**Allowed Files:**
- `frontend/src/components/segments/activities/ImageHotspotActivity.jsx` (edit)
- `frontend/src/components/segments/activities/DiagramLabelActivity.jsx` (edit)
- `frontend/src/components/segments/activities/Activities.css` (edit)
- `docs/p2-001-hotspot-audit.md` (create)
- `docs/ui-ux-refactor-changelog.md` (edit)
- `docs/ui-ux-refactor-plan.md` (edit)
- `docs/ui-ux-design-system.md` (edit)

**Blocked Files:**
- Any files not listed above
- `package.json` / lockfiles
- CSP or worker files

#### Pre-Implementation Checklist

- [ ] Review current hotspot implementation
- [ ] Identify all inline coordinate usage
- [ ] Test current hotspot functionality
- [ ] Document coordinate system requirements
- [ ] Plan CSS variable strategy for dynamic positioning

#### Step 1: Audit Hotspot Implementation (STOP POINT)

**Action:**
1. Read `frontend/src/components/segments/activities/ImageHotspotActivity.jsx`
2. Read `frontend/src/components/segments/activities/DiagramLabelActivity.jsx`
3. Read `frontend/src/components/segments/activities/Activities.css`
4. Document:
   - How coordinates are currently set (inline styles?)
   - Where coordinates come from (props? data?)
   - What interactions depend on coordinates
   - Any coordinate calculations

**Output:**
- `docs/p2-001-hotspot-audit.md` with:
  - Current implementation details
  - Coordinate flow diagram
  - Risk assessment for refactoring

**Stop Point:** Complete audit document before proceeding

#### Step 2: Create CSS Variable Strategy (STOP POINT)

**Action:**
1. Design CSS variable pattern for coordinates:
   - `--hotspot-x: 50%` (percentage or pixels)
   - `--hotspot-y: 30%`
   - Update CSS to use these variables
2. Create example implementation in `Activities.css`
3. Test with static coordinates first

**Files to Update:**
- `frontend/src/components/segments/activities/Activities.css`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Hotspots appear in correct positions with CSS vars

**Stop Point:** CSS variable strategy must work with static coordinates

#### Step 3: Refactor ImageHotspotActivity (STOP POINT)

**Action:**
1. Update `ImageHotspotActivity.jsx`:
   - Replace inline `style={{ left, top }}` with CSS variables
   - Use `style={{ '--hotspot-x': x, '--hotspot-y': y }}`
2. Update component to set CSS variables on hotspot elements
3. Test all hotspot interactions still work

**Files to Update:**
- `frontend/src/components/segments/activities/ImageHotspotActivity.jsx`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: All hotspots clickable, selection works, feedback appears

**Stop Point:** ImageHotspotActivity must work perfectly before proceeding

#### Step 4: Refactor DiagramLabelActivity (STOP POINT)

**Action:**
1. Update `DiagramLabelActivity.jsx`:
   - Replace inline coordinate styles with CSS variables
   - Ensure all positioning logic preserved
2. Test all diagram interactions

**Files to Update:**
- `frontend/src/components/segments/activities/DiagramLabelActivity.jsx`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: All diagram labels clickable, interactions work

**Stop Point:** DiagramLabelActivity must work perfectly before proceeding

#### Step 5: Remove Legacy Inline Styles (STOP POINT)

**Action:**
1. Search for any remaining inline coordinate styles:
   ```bash
   grep -r "style.*left\|style.*top\|style.*transform" frontend/src/components/segments/activities
   ```
2. Replace with CSS variables
3. Clean up `Activities.css` (remove unused styles, tokenize remaining)

**Files to Update:**
- `frontend/src/components/segments/activities/Activities.css`
- Any remaining files with inline coordinate styles

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: All activities still work

**Stop Point:** All inline coordinate styles must be removed

#### Step 6: Documentation & Changelog Update (STOP POINT)

**Action:**
1. Update `docs/ui-ux-refactor-changelog.md`:
   - Add entry for P2-001
   - Document coordinate refactoring approach
   - Note any CSP exceptions remaining (if any)
2. Update `docs/ui-ux-refactor-plan.md`:
   - Mark P2-001 as "Completed"
3. Document coordinate system in design system doc

**Files to Update:**
- `docs/ui-ux-refactor-changelog.md`
- `docs/ui-ux-refactor-plan.md`
- `docs/ui-ux-design-system.md`

**Stop Point:** Documentation complete, task marked complete

---

### P2-002: Align Formative Activity Components

**Estimated LOC:** ~300-400  
**Complexity:** Medium  
**Dependencies:** P2-001 (must complete first)

#### Step 1: Audit Formative Activity Components (STOP POINT)

**Action:**
1. Review all formative activity components
2. Identify shared feedback panels
3. Identify button groups that need standardization
4. Check keyboard navigation support

**Files to Review:**
- `frontend/src/components/assessments/FormativeAssessment.jsx`
- `frontend/src/components/segments/activities/*.jsx`
- Related CSS files

**Output:**
- List of components needing refactoring
- Shared patterns identified
- Accessibility gaps

**Stop Point:** Audit complete, review before proceeding

#### Step 2: Create Shared Feedback Panel Component (STOP POINT)

**Action:**
1. Create `frontend/src/components/ui/FeedbackPanel.jsx`
2. Create `frontend/src/components/ui/FeedbackPanel.css`
3. Implement:
   - Success/error/warning/info variants
   - Token-driven styling
   - Accessible (role="status", aria-live)
   - Animation support

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Feedback appears correctly with animations

**Stop Point:** FeedbackPanel component working

#### Step 3: Create Shared Button Group Component (STOP POINT)

**Action:**
1. Create `frontend/src/components/ui/ButtonGroup.jsx`
2. Create `frontend/src/components/ui/ButtonGroup.css`
3. Implement:
   - Horizontal/vertical layouts
   - Token-driven spacing
   - Keyboard navigation (Tab, Arrow keys)
   - Accessible role attributes

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Keyboard navigation works

**Stop Point:** ButtonGroup component working

#### Step 4: Migrate Formative Activities (STOP POINT)

**Action:**
1. Update `FormativeAssessment.jsx` to use FeedbackPanel
2. Update activity components to use ButtonGroup
3. Ensure keyboard navigation works
4. Test all interactions

**Files to Update:**
- `frontend/src/components/assessments/FormativeAssessment.jsx`
- Activity components as identified in audit

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: All activities work, keyboard accessible

**Stop Point:** All activities migrated and working

#### Step 5: Documentation & Changelog Update (STOP POINT)

**Action:**
1. Update changelog
2. Update plan
3. Update design system docs

**Stop Point:** Documentation complete

---

### P2-010: Wrap Python/Skulpt Shells in Design System Layout

**Estimated LOC:** ~200-300  
**Complexity:** Low  
**Dependencies:** P0-003 (completed)

**Allowed Files:**
- `frontend/src/components/segments/PythonPlaygroundSegment.jsx` (edit)
- `frontend/src/components/segments/PythonPlaygroundSegment.css` (edit if exists)
- `docs/ui-ux-refactor-changelog.md` (edit)
- `docs/ui-ux-refactor-plan.md` (edit)
- `docs/ui-ux-design-system.md` (edit)

**Blocked Files:**
- CSP meta tag (CSP exception already documented)
- `package.json` / lockfiles
- Any files not listed above

#### Step 1: Review Python Playground Component (STOP POINT)

**Action:**
1. Read `frontend/src/components/segments/PythonPlaygroundSegment.jsx`
2. Identify where to add `ContentContainer` wrapper
3. Check for any inline styles that can be removed
4. Note CSP exception already documented for Skulpt

**Output:**
- Plan for wrapping with ContentContainer
- List of inline styles to remove (if any)

**Stop Point:** Review complete

#### Step 2: Add ContentContainer Wrapper (STOP POINT)

**Action:**
1. Update `PythonPlaygroundSegment.jsx`:
   - Wrap main content in `ContentContainer`
   - Ensure proper spacing and layout
2. Update related CSS to use tokens
3. Test Python execution still works

**Files to Update:**
- `frontend/src/components/segments/PythonPlaygroundSegment.jsx`
- Related CSS file (if exists)

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Python playground works, code executes

**Stop Point:** Python playground working with new layout

#### Step 3: Tokenize Python Playground Styling (STOP POINT)

**Action:**
1. Review Python playground CSS
2. Replace hardcoded colors/spacing with design tokens
3. Ensure CSP compliance (use CSS variables for dynamic values)

**Files to Update:**
- CSS file for Python playground

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Styling looks correct, functionality intact

**Stop Point:** Styling tokenized

#### Step 4: Documentation & Changelog Update (STOP POINT)

**Action:**
1. Update changelog (note CSP exception already documented)
2. Update plan
3. Document Python playground usage in design system

**Stop Point:** Documentation complete

---

### P2-011: Audit Embedded Console/Editor Theming

**Estimated LOC:** ~100-200  
**Complexity:** Low  
**Dependencies:** P2-010 (must complete first)

#### Step 1: Audit Console/Editor Styling (STOP POINT)

**Action:**
1. Find all console/editor components (Sandpack, code editors)
2. Document current theming approach
3. Identify syntax highlighting colors
4. Map to design token palette

**Files to Review:**
- `frontend/src/components/segments/PythonPlaygroundSegment.jsx`
- Any Sandpack/code editor components

**Output:**
- List of editor components
- Current color scheme
- Proposed token mapping

**Stop Point:** Audit complete

#### Step 2: Map Syntax Highlighting to Tokens (STOP POINT)

**Action:**
1. Create token mapping for syntax colors:
   - Keywords → `--color-primary-*`
   - Strings → `--color-success-*`
   - Comments → `--color-text-muted`
   - etc.
2. Update editor theme configuration
3. Test syntax highlighting looks good

**Files to Update:**
- Editor component files
- Any theme configuration files

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Syntax highlighting works, readable

**Stop Point:** Syntax highlighting tokenized

#### Step 3: Verify CSP Compliance (STOP POINT)

**Action:**
1. Check for any inline styles in editor components
2. Ensure all styles use CSS variables or classes
3. Document any unavoidable exceptions

**Test:**
- `npm run lint`
- `npm run build`
- Check browser console for CSP violations

**Stop Point:** CSP compliant

#### Step 4: Documentation & Changelog Update (STOP POINT)

**Action:**
1. Update changelog
2. Update plan
3. Document editor theming in design system

**Stop Point:** Documentation complete

---

### P2-020: Refresh Admin/Account/Legacy Pages

**Estimated LOC:** ~3,280  
**Complexity:** Medium  
**Dependencies:** P0-003 (completed)

**⚠️ WARNING: This task is VERY large (3,280 LOC). It MUST be split into sub-tasks by page.**

**Note:** Each sub-task is a separate task with its own allowlist and checks.

#### Sub-Task 2.020.1: LoginPage Refactor (STOP POINT)

**Allowed Files:**
- `frontend/src/pages/LoginPage.jsx` (edit)
- `frontend/src/pages/LoginPage.css` (edit)
- `docs/ui-ux-refactor-changelog.md` (edit)
- `docs/ui-ux-refactor-plan.md` (edit)

**Blocked Files:**
- Any other pages
- `package.json` / lockfiles
- CSP or worker files

**Estimated LOC:** ~269 (124 JS + 145 CSS)

**Action:**
1. Review `LoginPage.jsx` and `LoginPage.css`
2. Replace hardcoded colors with tokens
3. Replace inline gradient with CSS variable-based gradient
4. Use shared button primitives
5. Tokenize spacing and typography
6. Test login flow works

**Files to Update:**
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/LoginPage.css`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Login works, styling looks correct

**Stop Point:** LoginPage refactored and working

**Documentation:** Update changelog entry for LoginPage

---

#### Sub-Task 2.020.2: AccountPage Refactor (STOP POINT)

**Estimated LOC:** ~147 (92 JS + 55 CSS)

**Action:**
1. Review `AccountPage.jsx` and `AccountPage.css`
2. Replace legacy spacing with tokens
3. Replace inline flex declarations with utility classes or tokens
4. Use shared form components (if available)
5. Tokenize all styling

**Files to Update:**
- `frontend/src/pages/AccountPage.jsx`
- `frontend/src/pages/AccountPage.css`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Account page works, forms submit

**Stop Point:** AccountPage refactored and working

**Documentation:** Update changelog entry for AccountPage

---

#### Sub-Task 2.020.3: LessonPage Refactor (STOP POINT)

**Estimated LOC:** ~637 (258 JS + 379 CSS)

**Action:**
1. Review `LessonPage.jsx` and `LessonPage.css`
2. Remove inline style attributes for media blocks
3. Replace with CSS variables or classes
4. Tokenize all colors, spacing, typography
5. Use shared layout primitives

**Files to Update:**
- `frontend/src/pages/LessonPage.jsx`
- `frontend/src/pages/LessonPage.css`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Lesson content displays correctly, navigation works

**Stop Point:** LessonPage refactored and working

**Documentation:** Update changelog entry for LessonPage

---

#### Sub-Task 2.020.4: TopicPage Refactor (STOP POINT)

**Estimated LOC:** ~492 (207 JS + 285 CSS)

**Action:**
1. Review `TopicPage.jsx` and `TopicPage.css`
2. Replace bespoke typography classes with token-driven type scale
3. Tokenize all styling
4. Use shared card primitives

**Files to Update:**
- `frontend/src/pages/TopicPage.jsx`
- `frontend/src/pages/TopicPage.css`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Topic page displays correctly

**Stop Point:** TopicPage refactored and working

**Documentation:** Update changelog entry for TopicPage

---

#### Sub-Task 2.020.5: Year7MapPage Refactor (STOP POINT)

**Estimated LOC:** ~708 (368 JS + 340 CSS)

**Action:**
1. Review `Year7MapPage.jsx` and `Year7MapPage.css`
2. Tokenize all styling
3. Use shared status pills/badges
4. Ensure teacher/student branches both work

**Files to Update:**
- `frontend/src/pages/Year7MapPage.jsx`
- `frontend/src/pages/Year7MapPage.css`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Both teacher and student views work

**Stop Point:** Year7MapPage refactored and working

**Documentation:** Update changelog entry for Year7MapPage

---

#### Sub-Task 2.020.6: AdminDashboardPage Refactor (STOP POINT)

**Estimated LOC:** ~323 (190 JS + 133 CSS)

**Action:**
1. Review `AdminDashboardPage.jsx` and `AdminDashboardPage.css`
2. Migrate tables to tokenized table styles
3. Use shared banner components
4. Tokenize all styling
5. Test all admin functionality

**Files to Update:**
- `frontend/src/pages/AdminDashboardPage.jsx`
- `frontend/src/pages/AdminDashboardPage.css`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: All admin features work

**Stop Point:** AdminDashboardPage refactored and working

**Documentation:** Update changelog entry for AdminDashboardPage

---

#### Sub-Task 2.020.7: Layout Component Refactor (STOP POINT)

**Estimated LOC:** ~804 (306 JS + 498 CSS)

**Action:**
1. Review `Layout.jsx` and `Layout.css`
2. Tokenize global shell, nav, and top-level spacing
3. Replace hardcoded values with design tokens
4. Ensure navigation works correctly
5. Test on all pages

**Files to Update:**
- `frontend/src/components/Layout.jsx`
- `frontend/src/components/Layout.css`

**Test:**
- `npm run lint`
- `npm run build`
- Manual test: Navigation works, layout looks correct on all pages

**Stop Point:** Layout refactored and working

**Documentation:** Update changelog entry for Layout

---

#### Sub-Task 2.020.8: Final P2-020 Documentation (STOP POINT)

**Action:**
1. Update `docs/ui-ux-refactor-changelog.md`:
   - Add summary entry for P2-020
   - List all pages refactored
   - Note any exceptions or decisions
2. Update `docs/ui-ux-refactor-plan.md`:
   - Mark P2-020 as "Completed"
3. Verify all pages are documented

**Stop Point:** P2-020 marked complete

---

### P2-030: Update Documentation + Design Guide Examples

**Estimated LOC:** ~50-100  
**Complexity:** Low  
**Dependencies:** P1-030 (completed)

#### Step 1: Sync Design Strategy Doc (STOP POINT)

**Action:**
1. Review `docs/NEW-UI-UX-design-strategy.txt`
2. Identify snippets that reference old patterns
3. Update to reference new primitives:
   - StatusPill usage
   - StatusBanner usage
   - Modal usage
   - Accordion usage
   - ProgressBar usage
   - StatCard usage

**Files to Update:**
- `docs/NEW-UI-UX-design-strategy.txt`

**Stop Point:** Design strategy doc updated

#### Step 2: Add Primitive Examples to Design System Doc (STOP POINT)

**Action:**
1. Review `docs/ui-ux-design-system.md`
2. Add usage examples for all new primitives
3. Include code snippets
4. Include accessibility notes

**Files to Update:**
- `docs/ui-ux-design-system.md`

**Stop Point:** Design system doc has all examples

#### Step 3: Update README (STOP POINT)

**Action:**
1. Review main `README.md`
2. Update to reference new design system
3. Add link to design system documentation
4. Update component usage examples

**Files to Update:**
- `README.md` (if exists)

**Stop Point:** README updated

#### Step 4: Final Documentation Check (STOP POINT)

**Action:**
1. Verify all documentation is consistent
2. Check all links work
3. Ensure all primitives are documented
4. Update changelog

**Files to Update:**
- `docs/ui-ux-refactor-changelog.md`
- `docs/ui-ux-refactor-plan.md`

**Stop Point:** All documentation complete

---

## Phase 3 - Polish, QA & Deployment

### P3-001: Conduct Accessibility Audit

**Estimated LOC:** ~100-200 (mostly documentation)  
**Complexity:** Medium  
**Dependencies:** P1-030 (completed)

#### Step 1: Automated Accessibility Scan (STOP POINT)

**Action:**
1. Install accessibility testing tools (axe-core, Lighthouse)
2. Run automated scans on key pages:
   - LoginPage
   - TeacherDashboardPage
   - StudentDashboardPage
   - CurriculumMapPage
   - LessonPage
3. Document all issues found

**Output:**
- List of accessibility issues by page
- Priority ranking (critical/high/medium/low)

**Stop Point:** Audit complete, issues documented

#### Step 2: Manual Accessibility Testing (STOP POINT)

**Action:**
1. Test keyboard navigation on all pages
2. Test with screen reader (NVDA/JAWS/VoiceOver)
3. Check color contrast ratios
4. Verify focus indicators visible
5. Check ARIA labels and roles
6. Document all issues

**Output:**
- Manual testing results
- List of issues to fix

**Stop Point:** Manual testing complete

#### Step 3: Fix Critical Accessibility Issues (STOP POINT)

**Action:**
1. Fix all critical issues first
2. Fix high-priority issues
3. Test fixes
4. Document fixes in changelog

**Test:**
- Re-run automated scans
- Manual verification
- `npm run lint`
- `npm run build`

**Stop Point:** All critical/high issues fixed

#### Step 4: Documentation & Changelog Update (STOP POINT)

**Action:**
1. Update changelog with accessibility improvements
2. Update plan
3. Document accessibility testing process

**Stop Point:** Documentation complete

---

### P3-002: Validate Responsive Breakpoints

**Estimated LOC:** ~50-100 (mostly documentation)  
**Complexity:** Low-Medium  
**Dependencies:** P3-001 (must complete first)

#### Step 1: Define Breakpoint Matrix (STOP POINT)

**Action:**
1. Document expected behavior at:
   - Mobile (< 768px)
   - Tablet (768px - 1024px)
   - Desktop (> 1024px)
2. Create test checklist for each page

**Output:**
- Breakpoint matrix document
- Test checklist

**Stop Point:** Matrix defined

#### Step 2: Test Each Page at Breakpoints (STOP POINT)

**Action:**
1. Test each page at mobile size
2. Test each page at tablet size
3. Test each page at desktop size
4. Document any issues

**Output:**
- Responsive testing results
- List of issues by page/breakpoint

**Stop Point:** Testing complete

#### Step 3: Fix Responsive Issues (STOP POINT)

**Action:**
1. Fix identified responsive issues
2. Test fixes
3. Verify all breakpoints work

**Test:**
- Browser dev tools responsive mode
- Manual testing on actual devices (if possible)

**Stop Point:** All responsive issues fixed

#### Step 4: Documentation & Changelog Update (STOP POINT)

**Action:**
1. Update changelog
2. Update plan
3. Document responsive behavior matrix

**Stop Point:** Documentation complete

---

### P3-003: Review Bundle Size & Code Splitting

**Estimated LOC:** ~100-200  
**Complexity:** Medium  
**Dependencies:** P2-020 (must complete first)

#### Step 1: Analyze Current Bundle (STOP POINT)

**Action:**
1. Build production bundle
2. Analyze bundle size with `vite-bundle-visualizer` or similar
3. Identify large chunks
4. Document current bundle composition

**Output:**
- Bundle size report
- List of large chunks
- Recommendations for code splitting

**Stop Point:** Analysis complete

#### Step 2: Implement Code Splitting (STOP POINT)

**Action:**
1. Identify routes/components for lazy loading
2. Implement `React.lazy()` for route components
3. Add Suspense boundaries
4. Test lazy loading works

**Files to Update:**
- Route files (likely `main.jsx` or router config)

**Test:**
- `npm run build`
- Check bundle sizes reduced
- Manual test: Lazy loaded routes work

**Stop Point:** Code splitting implemented

#### Step 3: Manual Chunking (if needed) (STOP POINT)

**Action:**
1. If automatic code splitting insufficient, configure manual chunks in `vite.config.js`
2. Group related dependencies
3. Test bundle sizes

**Files to Update:**
- `frontend/vite.config.js`

**Test:**
- `npm run build`
- Verify chunks are reasonable size

**Stop Point:** Manual chunking configured (if needed)

#### Step 4: Documentation & Changelog Update (STOP POINT)

**Action:**
1. Update changelog with bundle optimization
2. Update plan
3. Document code splitting strategy

**Stop Point:** Documentation complete

---

### P3-004: Finalise Documentation + README Updates

**Estimated LOC:** ~100-200  
**Complexity:** Low  
**Dependencies:** P3-003 (must complete first)

#### Step 1: Review All Documentation (STOP POINT)

**Action:**
1. Read through all documentation files
2. Check for consistency
3. Verify all links work
4. Check for outdated information
5. List all fixes needed

**Output:**
- List of documentation issues

**Stop Point:** Review complete

#### Step 2: Update All Documentation (STOP POINT)

**Action:**
1. Fix identified issues
2. Ensure consistency across all docs
3. Update examples
4. Add missing information

**Files to Update:**
- All documentation files

**Stop Point:** All documentation updated

#### Step 3: Update README (STOP POINT)

**Action:**
1. Update main README with:
   - Design system overview
   - Component usage examples
   - Links to detailed docs
   - Development setup
   - Contribution guidelines (if applicable)

**Files to Update:**
- `README.md`

**Stop Point:** README updated

#### Step 4: Final Documentation Pass (STOP POINT)

**Action:**
1. Spell check all documentation
2. Verify all code examples work
3. Test all links
4. Final review

**Stop Point:** Documentation finalised

---

### P3-005: Execute Final Build/Preview/Deploy Runbook

**Estimated LOC:** ~50-100  
**Complexity:** Low  
**Dependencies:** P3-004 (must complete first)

#### Step 1: Run Full QA Checklist (STOP POINT)

**Action:**
1. Run `npm run lint` - must pass with no errors
2. Run `npm run build` - must pass with no errors
3. Run `npm run preview` - start preview server
4. Manual smoke test:
   - Login flow
   - Teacher dashboard
   - Student dashboard
   - Curriculum maps
   - Lesson pages
   - Activities
5. Check browser console for warnings/errors

**Output:**
- QA checklist results
- List of any issues found

**Stop Point:** QA complete, all issues resolved

#### Step 2: Performance Check (STOP POINT)

**Action:**
1. Run Lighthouse audit
2. Check performance scores
3. Check accessibility scores
4. Document results

**Output:**
- Lighthouse report
- Performance metrics

**Stop Point:** Performance checked

#### Step 3: Final Changelog Entry (STOP POINT)

**Action:**
1. Add final Phase 3 entry to changelog
2. Summarize all work completed
3. Note any outstanding items
4. Add deployment date

**Files to Update:**
- `docs/ui-ux-refactor-changelog.md`

**Stop Point:** Changelog complete

#### Step 4: Deployment (STOP POINT)

**Action:**
1. Follow deployment runbook
2. Run `./deploy.sh`
3. Verify deployment successful
4. Test live site
5. Document deployment in changelog

**Stop Point:** Deployment complete, site live

---

## General Implementation Rules

### Before Starting ANY Task

1. **Read the task** - Understand what needs to be done
2. **Check dependencies** - Ensure prerequisite tasks are complete
3. **Review related files** - Understand current implementation
4. **Plan the changes** - Outline what will change before coding
5. **Check for related files** - Search codebase for similar patterns
6. **Read allowlist** - Verify which files are allowed for this task
7. **Check task tags** - Verify if task requires [CSP-CHANGE] or [AUTH] tags

### During Implementation

1. **Make incremental changes** - Don't change everything at once
2. **Test frequently** - Run lint/build after each significant change
3. **Commit often** - Commit after each logical unit of work
4. **Document decisions** - Note any trade-offs or exceptions
5. **Check for regressions** - Test related functionality still works

### After Completing Each Task

1. **Run full QA** - lint, build, manual smoke test
2. **Update changelog** - Document what changed and why
3. **Update plan** - Mark task as completed
4. **Update design system docs** - If new primitives added
5. **Review code** - Check for any issues before moving on

### Stop Points

**MANDATORY STOP POINTS** (do not proceed until these are complete):
- After each sub-task completion
- Before moving to next task
- After any breaking changes
- After documentation updates
- Before deployment

### Codebase-Wide Considerations

Before making changes, always:
1. Search for similar patterns in codebase
2. Check if shared components exist
3. Verify no breaking changes to related files
4. Consider impact on other phases
5. Document any exceptions or special cases

### Error Handling

If you encounter issues:
1. **Stop immediately**
2. **Revert changes** - Don't leave codebase in broken state
   ```bash
   git status  # Review what changed
   git checkout -- <file>  # Revert specific files
   ```
3. **Document the issue** in changelog under "Open Decisions"
4. **Check allowlist** - Verify you're editing allowed files
5. **Run all checks** - Ensure lint, build, circular deps all pass
6. **Ask for clarification** - If requirements unclear
7. **Fix before proceeding** - Never continue with broken code

### CI/CD Integration

This implementation guide is designed to work with CI checks:

1. **PR Label Required**: PRs must have `ui-ux-refactor` label to run CI
2. **CI Runs:**
   - Lint check
   - Build check
   - Circular dependency check
   - Allowlist verification
   - Raw style check
   - Diff size check
   - Blocked file check
   - Changelog verification

3. **CI Scripts:**
   - `scripts/verify-allowlist.js` - Checks only allowed files changed
   - `scripts/verify-no-raw-styles.js` - Checks design token compliance

4. **PR Template**: Use `.github/pull_request_template.md` to ensure all checks completed

---

## Progress Tracking

After completing each task, update:
1. `docs/ui-ux-refactor-plan.md` - Mark task as "Completed"
2. `docs/ui-ux-refactor-changelog.md` - Add detailed entry
3. This document - Check off completed steps

## Safety Guardrails Summary

### Files Created

1. **`.ibcs-task-allowlist`** - File allowlist per task
2. **`scripts/verify-allowlist.js`** - CI script to verify only allowed files changed
3. **`scripts/verify-no-raw-styles.js`** - CI script to verify design token compliance
4. **`.github/workflows/ui-ux-refactor-ci.yml`** - GitHub Actions CI workflow
5. **`.github/pull_request_template.md`** - PR template with checklist

### How Guardrails Work

**Before Each Task:**
- Read allowlist for task ID
- Verify files to be edited are in allowlist
- Check task doesn't require blocked files

**During Implementation:**
- Edit only allowed files
- Use design tokens (no raw hex/px/inline styles)
- Keep diff size <600 LOC app code

**After Each Change:**
- Run: `npm run lint` (must pass)
- Run: `npm run build` (must pass)
- Run: `npx madge frontend/src --extensions js,jsx --circular` (must pass)
- Run: `node scripts/verify-allowlist.js <task-id>` (must pass)
- Run: `node scripts/verify-no-raw-styles.js` (must pass)
- Check preview console (zero errors)

**On PR:**
- CI automatically runs all checks
- PR must have `ui-ux-refactor` label
- All checks must pass before merge

### Manual Verification Commands

Before committing, run these commands:

```bash
# 1. Check allowlist
node scripts/verify-allowlist.js P1-031

# 2. Check design tokens
node scripts/verify-no-raw-styles.js

# 3. Check circular dependencies
cd frontend && npx madge src --extensions js,jsx --circular

# 4. Lint and build
cd frontend && npm run lint && npm run build

# 5. Check diff size
git diff --numstat HEAD~1 HEAD -- 'frontend/src/**/*.{js,jsx,css}' | \
  awk '{added+=$1; changed+=$2} END {print "App code diff: " added+changed " lines"}'
```

### Violation Handling

If any guardrail check fails:
1. **STOP immediately**
2. **Revert changes** to last working state
3. **Document issue** in changelog
4. **Fix before proceeding**
5. **Never commit** with violations

### Exceptions

Only these exceptions are allowed:
- CSS variable assignments: `style={{ '--var': value }}`
- Token definitions in `global.css`
- Third-party library requirements (documented in changelog)
- Tasks explicitly tagged `[CSP-CHANGE]` or `[AUTH]`

---

## Notes

- This guide assumes incremental, careful implementation
- Each STOP POINT is a checkpoint for review
- Documentation is as important as code changes
- QA is mandatory after each task
- Never skip documentation updates
- Always test before moving to next task

