# Accessibility Audit — Phase 3 (2025-11-06)

## Method

- Added `eslint-plugin-jsx-a11y@6.9.0` to the frontend dev dependencies.
- Extended the flat ESLint config to include the plugin’s recommended ruleset.
- Ran `npm run lint` from `frontend/` to surface violations across all JSX files.

## Findings & Fixes

| Area | Issue | Resolution |
| --- | --- | --- |
| `frontend/src/components/segments/AssessmentResultsModal.jsx` | Click-only backdrop `div` failed keyboard interactivity rules. | Converted the backdrop to a visually full-screen button with `aria-label`, retained ESC close, and removed the redundant `div` listener. |
| `frontend/src/components/ui/Modal.jsx` & `.css` | Modal overlay `div` used for backdrop click detection, triggering `no-noninteractive-element-interactions`. | Refactored overlay structure: added dedicated backdrop button (tabbable only when focused programmatically) and kept `dialog` role on the content container. Updated CSS to position the backdrop and maintain blur styling. |
| `frontend/src/pages/IBCurriculumPage.jsx` | Redundant `role="list"` applied to native `<ul>`. | Removed the explicit role to rely on implicit semantics. |

## Outstanding Considerations

- Keyboard traps and focus restoration are handled in `Modal.jsx`; manual screen-reader verification is recommended when GUI access is available.
- Complex drag-and-drop activities remain reliant on DnD Kit for ARIA announcements; no additional violations were reported by ESLint.

## Commands

```bash
cd frontend
npm install -D eslint-plugin-jsx-a11y@^6.9.0
npm run lint
```
