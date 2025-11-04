# Development Environment & Initial Setup

## Prerequisites
- Node.js 18 or newer (with npm)
- GitHub access to `stss15/ibcs-app` with Pages enabled
- Cloudflare account with Workers enabled
- InstantDB App ID and Admin Token

## Project Layout
```
ibcs-app/
├── frontend/                # React + Vite SPA (primary app)
│   └── src/lib/api.js       # Worker API client
│   └── src/lib/config.js    # Loads app-config.json (Worker URL)
├── worker/                  # Cloudflare Worker (auth + data access)
├── docs/                    # Operational playbooks (this folder)
├── assets/                  # Production bundle copied from frontend/dist
└── src/                     # Legacy static pages (todo: retire)
```

## Install Dependencies
```bash
npm install --prefix frontend
npm install --prefix worker
```

The deployment script automatically skips `npm install` when `node_modules` already exists (see `deploy.sh`).

## Configure Runtime
Update `frontend/public/app-config.json` with the Cloudflare Worker URL:
```json
{
  "API_BASE": "https://ibcs-auth.<your-subdomain>.workers.dev"
}
```
The deployment script copies this into the root for GitHub Pages (`app-config.json`).

## Local Development
```bash
npm run dev --prefix frontend
```
Vite serves the SPA at `http://localhost:5173/ibcs-app/` (the base URL is preconfigured).

## Build Locally
```bash
npm run build --prefix frontend
```
Artifacts are produced in `frontend/dist/` and mirrored to the project root during deployment.

## Cloudflare Worker
- Required secrets: `INSTANT_APP_ID`, `INSTANT_ADMIN_TOKEN`, `TOKEN_SECRET`, `SEED_KEY`
- Deploy manually: `cd worker && npx wrangler deploy`
- Seed initial teacher: `node worker/seed-teacher.js`

## InstantDB Collections (current model)
The schema is defined in `instant.schema.ts`. Key collections:

- **`admins`**: `{ username, usernameLower, password, firstName, lastName, displayName, createdAt }`
- **`teachers`**: `{ username, usernameLower, password, firstName, lastName, displayName, createdAt, archivedAt? }`
- **`classes`**: `{ className, description?, teacherId, teacherUsername, yearGroup?, createdAt, archivedAt? }`
- **`students`**: `{ username?, usernameLower?, password, firstName, lastName, displayName, yearGroup, curriculumTrack, classId, teacherId, teacherUsername, activeStage, status, archivedAt?, createdAt }`
- **`classUnlocks`**: `{ classId, teacherId, teacherUsername, stageKey, unlockedBy, unlockedAt }`
- **`studentUnlocks`**: `{ studentId, classId, teacherId, teacherUsername, stageKey, unlockedBy, unlockedAt, scope, targetId? }`
- **`lessons`**: `{ slug, title, stageKey, order, createdAt, isActive? }`
- **`studentProgress`**: `{ studentId, lessonSlug, classId, teacherId, teacherUsername, status, formativeAttempts?, summativeScore?, updatedAt }`
- **`classPacing`**: `{ classId, track?, unitId, lessonId, updatedAt, updatedBy? }`

Note: Username lookups are case-insensitive via `usernameLower` fields. Students have curriculum tracks (e.g., `ib-sl`, `ib-hl`, `igcse`, `ks3`) and active stage pointers for pacing.

## Verification Checklist
1. Open `https://stss15.github.io/ibcs-app/` (or your Pages URL).
2. Log in with teacher seed credentials.
3. Create a class and add a student.
4. Refresh to confirm persistence via InstantDB.
5. Log in as the student to confirm curriculum access.

## Security Hygiene
- Rotate InstantDB admin tokens after demos.
- Rotate `TOKEN_SECRET` and invalidate old session cookies when necessary.
- Apply Cloudflare Worker rate limits and logging before production usage.


