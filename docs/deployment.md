# Deployment Playbook

`deploy.sh` wraps the entire release pipeline. Run it from the repo root to publish both the GitHub Pages bundle and the Cloudflare Worker in one command.

## 1. Standard Deployment

```bash
chmod +x deploy.sh   # first time only
./deploy.sh
```

> **Heads-up:** Deployments must run from the `main` branch with a clean working tree. Commit (or stash) feature changes first, then run `git checkout main && git pull --ff-only origin main` before executing the script.

### What the script does
1. **Pre-flight checks** – Verifies required tooling (`git`, `node`, `npm`, `npx`), ensures `instant.config.json` exists, confirms you are on `main`, pulls the latest commits, and refuses to run against a dirty working tree.
2. **Schema push** – Executes `./push-schema.sh` (non-blocking warning on failure).
3. **Install & lint** – Installs dependencies in `frontend/` and `worker/`, then runs `npm run lint` (skip with `SKIP_LINT=1`).
4. **Build frontend** – Runs `npm run build` in `frontend/` and publishes `dist/{assets,index.html,404.html,app-config.json}` into the repo root for GitHub Pages.
5. **Deploy Worker** – Executes `npx wrangler deploy` inside `worker/`.
6. **Reset & seed data** – Runs `node worker/reset-db.js`, `node worker/seed-admin.js`, and `node worker/seed-teacher.js` using the default credentials (override via environment variables).
7. **Commit & push** – Adds the static bundle, commits with `DEPLOY_COMMIT_MESSAGE` (defaults to `Deploy <timestamp>`), and pushes `origin/main`.

### Useful environment overrides
- `SKIP_LINT=1 ./deploy.sh` – Skip the frontend lint step.
- `DEPLOY_COMMIT_MESSAGE="Deploy: live deck" ./deploy.sh` – Custom commit message.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` – Override seeded admin account.
- `TEACHER_USERNAME`, `TEACHER_PASSWORD`, `TEACHER_DISPLAY_NAME`, `TEACHER_FIRST_NAME`, `TEACHER_LAST_NAME` – Override seeded teacher account.

## 2. Manual Deployment Steps
Use these commands when a specific stage fails and you want to retry it alone.

```bash
# Cloudflare Worker
git checkout main
cd worker
npx wrangler deploy

# Reset and seed demo data
cd ..
node worker/reset-db.js
node worker/seed-admin.js --username=admin --password=AdminReset123!
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
- `frontend/public/app-config.json` must point to the deployed Worker URL; `deploy.sh` copies the generated file into the Pages root during each run.

## 4. Troubleshooting
| Symptom | Fix |
| --- | --- |
| `git push` fails due to network timeout | Re-run `git push origin main` once connectivity returns. No need to rebuild. |
| `wrangler deploy` missing credentials | Re-authenticate with `npx wrangler login` and re-run the deployment stage. |
| Frontend chunk size warning (>500kB) | Use code splitting via `dynamic import()` or adjust Rollup `manualChunks` in `vite.config.js`. |
| Admin/teacher seed errors | Confirm `instant.config.json` exists and the credentials do not already exist. Supply overrides inline if needed. |

## 5. After Deploy
- Spot-check the live site at `https://stss15.github.io/ibcs-app/` (or your fork URL).
- Log in as the seeded teacher to ensure Worker deploy succeeded.
- Update [`docs/change-log.txt`](./change-log.txt) if deployment behaviour changed (scripts modified, secrets rotated, etc.).


