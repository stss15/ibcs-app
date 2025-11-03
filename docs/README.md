# IBCS App Documentation Hub

This folder centralises every operational guide the AI agent and human maintainers need when working on the IBCS App. Start here, then follow the linked playbooks for deeper detail.

| Guide | What it covers |
| --- | --- |
| `project-overview.md` | Product goals, scope, non-goals, roadmap, and success criteria. |
| `development-setup.md` | Local prerequisites, project layout, environment variables, and verification steps. |
| `frontend-architecture.md` | Application structure, shared components, global CSS tokens, and JS conventions. |
| `content-authoring.md` | Gamified unit schema, segment catalogue, analytics hooks, and authoring patterns. |
| `deployment.md` | End-to-end deployment flow (`fix-and-deploy.sh`), manual fallbacks, and secrets management. |
| `ai-agent-playbook.md` | How the AI agent should interpret and apply the docs during different task types. |
| `change-log.txt` | Chronological record of operational updates that affect the docs or automation. |

> **Conventions**
>
> - Treat these documents as the single source of truth. Remove superseded guidance from scattered files when updating the app.
> - Reference the change log whenever a process or script changes due to fixes, upgrades, or platform updates.
> - Keep product-facing curriculum markdown in `src/content/**` self-contained; only operational guidance belongs in `docs/`.


