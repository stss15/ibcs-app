# UI/UX Refactor - Quick Reference

**Quick checklist for implementing refactor tasks**

## Before Starting

1. Read task in `docs/ui-ux-refactor-implementation-guide.md`
2. Check task allowlist in `.ibcs-task-allowlist`
3. Verify dependencies are complete
4. Review related files in codebase

## During Implementation

### Edit Only Allowed Files
- Check `.ibcs-task-allowlist` for task ID
- Never edit blocked files (package.json, CSP, worker, lockfiles)

### Use Design Tokens
- No raw hex colors: Use `var(--color-primary-800)`
- No hardcoded pixels: Use `var(--space-2)`, `var(--space-4)`
- No inline styles: Use CSS variables `style={{ '--var': value }}`

### Keep Changes Small
- Maximum 600 LOC app code per task
- Maximum 1000 LOC total per PR

## After Each Change

### Run These Commands

```bash
# 1. Lint
cd frontend && npm run lint

# 2. Build
cd frontend && npm run build

# 3. Circular dependencies
cd frontend && npx madge src --extensions js,jsx --circular

# 4. Allowlist check
node scripts/verify-allowlist.js <TASK-ID>

# 5. Design token check
node scripts/verify-no-raw-styles.js

# 6. Preview (check console)
cd frontend && npm run preview
```

### All Must Pass
- Zero lint errors
- Zero build errors
- Zero circular dependencies
- Zero allowlist violations
- Zero raw style violations
- Zero console errors

## Before Committing

### Complete Checklist

- [ ] Only allowed files changed
- [ ] No blocked files modified
- [ ] All checks passed (lint, build, circular deps, allowlist, raw styles)
- [ ] Preview shows zero console errors
- [ ] Diff size <600 LOC app code
- [ ] Changelog updated
- [ ] Plan updated

## If Something Fails

1. **STOP immediately**
2. Revert: `git checkout -- <file>`
3. Fix issue
4. Re-run all checks
5. Only proceed when all pass

## Documentation Updates

After completing task:
1. Update `docs/ui-ux-refactor-changelog.md`:
   - Phase, date, task ID
   - Files changed
   - Decisions/notes
   - QA commands run
2. Update `docs/ui-ux-refactor-plan.md`:
   - Mark task "Completed"
   - Add completion date

## Common Patterns

### Creating New Component
```jsx
// Use design tokens
import "./Component.css";

function Component() {
  return (
    <div className="component">
      {/* Use CSS classes, not inline styles */}
    </div>
  );
}
```

```css
/* Component.css - Use tokens */
.component {
  padding: var(--space-4);
  color: var(--color-text);
  background: var(--status-info-bg);
  border-radius: var(--radius-md);
}
```

### CSS Variables for Dynamic Values
```jsx
// Allowed: CSS variable assignment
<div style={{ '--percent': '50%' }} className="progress-bar">
```

```css
/* Progress bar uses CSS variable */
.progress-bar {
  width: var(--percent);
}
```

## Blocked Patterns

❌ **Never use:**
- `style="color: #ff0000"` → Use CSS class
- `style={{ color: '#ff0000' }}` → Use CSS class
- `padding: 10px` → Use `var(--space-2)`
- `color: #fff` → Use `var(--color-white)`

✅ **Always use:**
- CSS classes with design tokens
- CSS variables for dynamic values: `style={{ '--var': value }}`
- Design tokens from `global.css`

