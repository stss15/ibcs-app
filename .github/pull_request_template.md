# UI/UX Refactor PR

**Task ID:** P[X]-[XXX]

## Checklist

- [ ] Only allowed files changed (verified with `git status`)
- [ ] No package.json, lockfiles, .env*, CSP, or worker edits (unless task allows)
- [ ] `npm run lint` passed with zero errors
- [ ] `npm run build` passed with zero errors
- [ ] `npx madge frontend/src --extensions js,jsx --circular` passed
- [ ] Preview server shows zero console errors
- [ ] No raw styles found (hex, px, inline style=)
- [ ] Changelog entry added with phase, date, files, decisions, QA commands
- [ ] Plan updated (task marked completed)
- [ ] Diff size within limits (<600 LOC app code)

## Changes

### Files Modified
- List files changed

### What Changed
- Brief description of changes

### Design Decisions
- Any notable decisions or trade-offs

## QA Commands Run

```bash
# Paste exact commands you ran
npm run lint
npm run build
npx madge frontend/src --extensions js,jsx --circular
npm run preview
# Check console for errors
```

## Testing

- [ ] Manual smoke test completed
- [ ] No console errors
- [ ] Functionality verified

## Related

- Links to related issues or tasks

