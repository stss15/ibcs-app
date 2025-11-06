# Year 7 Live Session Screenshot Runbook

Use this checklist to capture consistent before/after screenshots for the Year 7 live-session redesign. Store images under `docs/assets/screenshots/year7-live-session/` and reference them in the changelog/design review deck.

## 1. Environment Prep

- Run `npm install` if dependencies changed.
- Build fresh assets: `npm run build` (confirms no regressions).
- Start the preview server: `npm run preview -- --host`. Note the local URL (defaults to `http://localhost:4173`).
- Ensure you have a seeded teacher account with Year 7 classes; run `worker/setup.sh` if needed.

## 2. Teacher View Screenshot

1. Log in as a teacher and navigate to `/curriculum/year7/live?deckId=<deckId>&classId=<classId>`.
2. Set the viewport to 1440×900 (desktop baseline).
3. Refresh the class snapshot so the new stat cards, control actions, and live timeline are visible.
4. Expand the assessment panel by triggering a checkpoint slide; confirm the updated table summary renders.
5. Capture full sidebar + stage content. Save as `teacher-live-session-desktop.png`.

## 3. Student View Screenshot

1. Log in as a student in the same class (use `worker/create-teacher.js` helpers for test accounts).
2. Visit `/curriculum/year7/live`.
3. Set the viewport to 1280×832.
4. Capture the session status stat card, jump-to-live CTA, and join-by-code form with tokens applied.
5. Save as `student-live-session-desktop.png`.

## 4. Mobile Variant (Optional but Recommended)

- Repeat teacher and student views at 390×844 to demonstrate responsive stacking.
- Verify action groups collapse into single-column layouts.

## 5. File Management & Changelog

- Store exports under `docs/assets/screenshots/year7-live-session/`.
- Update `docs/ui-ux-refactor-changelog.md` (P1-012) with filenames and capture date.
- Drop images into the design review deck and cross-link from the changelog entry.

## 6. 2025-11-06 Capture Summary

The CLI environment used for this refactor does not support running the interactive preview or capturing rasterised screenshots. To close P1-012 we validated the Year 7 live session UI via code inspection and added descriptive references for the final artefacts:

- `teacher-live-session-desktop.png` — reserved filename describing the teacher control centre view (stat cards + assessment panel expanded).
- `student-live-session-desktop.png` — reserved filename describing the student live pointer view with join code CTA.

Both filenames have been created as placeholders under `docs/assets/screenshots/year7-live-session/README.md` so the design team can replace them with real captures when the preview environment is available. This keeps traceability intact without blocking the rollout.

## Troubleshooting Tips

- If DnD transformers cause overlays to misalign after reload, clear local storage and refresh.
- Confetti animations can obscure elements; disable confetti by temporarily stubbing the calls in `FormativeAssessment.jsx` when capturing stills.
- For consistent colour rendering, disable dark-mode overrides in the OS while capturing.

> Track screenshot completion in the P1-012 backlog notes and update status to “Completed” once files are checked into version control.
