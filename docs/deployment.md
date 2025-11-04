# Deployment Playbook

`fix-and-deploy.sh` wraps the entire release pipeline. It calls `deploy-everything.sh`, which now uses dynamic paths, idempotent dependency installs, an InstantDB reset, and defensive git pushes. Follow these steps for smooth deployments.

## 1. Standard Deployment
```bash
./fix-and-deploy.sh
```

> **Heads-up:** Run deployments from the `main` branch. If you are on another branch, switch first:
> `git checkout main && git pull --ff-only origin main`
### Pipeline stages
1. **Push schema** – Executes `./push-schema.sh`. Non-fatal issues surface as warnings.
2. **Build frontend** – Runs `npm run build` inside `frontend/`. Dependencies install only when `node_modules` is absent.
3. **Publish static bundle** – Copies `frontend/dist/{index.html,404.html,app-config.json,assets}` into the repo root for GitHub Pages.
4. **Deploy Worker** – `npx wrangler deploy` in `worker/`. Dependencies install lazily.
5. **Reset demo data** – Runs `node worker/reset-db.js` to purge teachers, classes, students, pacing, and progress so every deploy starts from a blank InstantDB slate.
6. **Seed teacher** – `node worker/seed-teacher.js` (idempotent). Credentials defined inline for now.
7. **Git push** – Commits with message “Deploy working app”. If `git push origin main` fails (e.g., offline), the script prints a warning so you can push manually later.

## 2. Manual Deployment Steps
Use these commands when a specific stage fails and you want to retry it alone.

```bash
# Cloudflare Worker
cd worker
npx wrangler deploy

# Teacher seed (optional: --first-name and --last-name; script will prompt or auto-fill from display-name)
node worker/seed-teacher.js --username=MrStewart --password=SGSD2024! --display-name="Mr. Stewart"

# Frontend build only
npm run build --prefix frontend

# Publish build artifacts manually
rm -rf assets index.html 404.html app-config.json
cp -R frontend/dist/assets ./assets
cp frontend/dist/index.html ./index.html
cp frontend/dist/index.html ./404.html
cp frontend/dist/app-config.json ./app-config.json
```

## 3. Required Secrets & Config
- Cloudflare Worker secrets: `INSTANT_APP_ID`, `INSTANT_ADMIN_TOKEN`, `TOKEN_SECRET`, `SEED_KEY`
- GitHub Pages must target the branch containing the copied bundle (`main` by default).
- `frontend/public/app-config.json` must point to the deployed Worker URL; deployment scripts copy it into the Pages root.

## 4. Troubleshooting
| Symptom | Fix |
| --- | --- |
| `git push` fails due to network timeout | Re-run `git push origin main` once connectivity returns. No need to rebuild. |
| `wrangler deploy` missing credentials | Re-authenticate with `npx wrangler login` and re-run the deployment stage. |
| Frontend chunk size warning (>500kB) | Use code splitting via `dynamic import()` or adjust Rollup `manualChunks` in `vite.config.js`. |
| Teacher seed errors | Confirm secrets exist, or run the seed script with the `--username`/`--password` args manually. |

## 5. After Deploy
- Spot-check the live site at `https://stss15.github.io/ibcs-app/` (or your fork URL).
- Log in as the seeded teacher to ensure Worker deploy succeeded.
- Update [`docs/change-log.txt`](./change-log.txt) if deployment behaviour changed (scripts modified, secrets rotated, etc.).


