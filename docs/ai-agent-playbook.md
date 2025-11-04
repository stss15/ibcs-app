# AI Agent Playbook

Use this document as the operational script whenever the AI agent contributes to the IBCS App. Each workflow references the detailed guides in this folder.

## Quick Reference
- **Project context** – [`project-overview.md`](./project-overview.md)
- **Local setup / dependencies** – [`development-setup.md`](./development-setup.md)
- **Frontend architecture & styling** – [`frontend-architecture.md`](./frontend-architecture.md)
- **Content authoring** – [`content-authoring.md`](./content-authoring.md)
- **Deployment** – [`deployment.md`](./deployment.md)
- **Change log** – [`change-log.txt`](./change-log.txt)

## 1. Triage & Planning
1. Read the task request carefully and map it to one (or more) of the guides above.
2. Note any existing files that must be preserved (curriculum content under `src/content/**` is user-authored).
3. Create a TODO list only when the work spans multiple substantive steps; keep simple edits lightweight.

## 2. Implementing Changes
- **Frontend features** – Follow structure and CSS conventions in `frontend-architecture.md`. Stage content now animates via `StagePlayer`; do not introduce bespoke containers—extend the existing segment renderer instead.
- **Teacher-paced modules** – Every curriculum track (IB, KS3, IGCSE) uses the shared `GamifiedModulePage`. When adding a summative, set `assessment.format` or stage metadata rather than creating custom panels; the end-of-unit assessment appears as the final stage automatically.
- **Content updates** – Use the schema guidelines in `content-authoring.md`; update unit previews/routes accordingly. Include teacher-only presenter segments where needed and keep pacing-friendly sequencing.
- **Scripts or deployment** – Ensure changes align with `deployment.md`. The deploy flow now purges InstantDB via `worker/reset-db.js` before reseeding; keep this behaviour intact and note any extra data requirements in the docs.
- **Data contracts** – If modifying InstantDB models or Worker endpoints, record decisions in both the relevant guide and the change log.

## 3. Documentation Hygiene
- When altering a workflow (e.g., new deployment flag, updated segment schema), immediately update the corresponding guide.
- Remove or replace outdated instructions elsewhere in the repo to keep `docs/` the single source of truth.
- Log noteworthy updates in `change-log.txt` (date, summary, files impacted).

## 4. Quality Checks
- Run `npm run lint` (frontend) before committing changes.
- For deployment changes, dry run `./deploy.sh` or the affected stage when feasible.
- Highlight verification steps in the PR/summary so maintainers can reproduce.

## 5. Communication
- Summaries should reference the updated docs when instructions change.
- Call out residual risks, manual follow-ups, or secrets the user must manage.


