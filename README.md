# ibcs-app

Static teaching app for IB Computer Science (first exams 2027) backed by a Cloudflare Worker and InstantDB.  
Teachers unlock topics, monitor progress, and export data; students progress through a gated learning journey.

## Project layout

```
public/                # Assets copied verbatim to GitHub Pages
scripts/               # Browser scripts (teacher dashboard, student portal, …)
src/components/        # UI components (placeholder)
src/content/           # Content tree grouped by syllabus code
src/lib/               # Shared browser-side helpers (config, session storage)
src/pages/             # Static HTML entrypoints
src/styles/            # Base styling shared across pages
tests/                 # Future integration/unit tests
worker/                # Placeholder for alternative Worker entry (ts-based)
src/worker.js          # Active Cloudflare Worker (deployed)
```

### Frontend skeleton

- `src/pages/index.html` routes teachers and students to their portals.
- `src/pages/teacher/dashboard.html` provides class management, enrollment, and unlock flows backed by Worker routes.
- `src/pages/student/home.html` scaffolds the gated journey (currently populated with mock data).
- `scripts/teacher-dashboard.js` and `scripts/student-home.js` handle login, local session management, and Worker calls.
- `src/lib/config.js` stores placeholders for `instantAppId` and `workerBaseUrl`. Replace before shipping.

### Cloudflare Worker

The Worker in `src/worker.js` exposes:

- `POST /t/login`, `POST /s/login` for credential verification.
- `GET /verify` to validate session tokens.
- `GET /t/dashboard`, `POST /t/add-class`, `POST /t/add-student`, `POST /t/unlock-topic` for teacher tooling.

It signs InstantDB requests with HMAC tokens derived from `INSTANT_APP_ID` and `TOKEN_SECRET`.

**Local development**

```bash
npx wrangler dev
```

**Deployment**

```bash
npx wrangler publish
```

Configure secrets prior to running:

```bash
wrangler secret put INSTANT_APP_ID
wrangler secret put TOKEN_SECRET
```

Ensure InstantDB collections (`teachers`, `classes`, `students`, `sessions`, `enrollments`, `topics`, `topic_unlocks`) are populated with the fields the Worker expects (`email`, `passwordHash`, etc.).

## Next steps

1. Swap the placeholders in `src/lib/config.js` for the real InstantDB app ID and Worker URL.
2. Flesh out the student journey by wiring InstantDB fetches for unlocked topics and progress.
3. Seed `src/content/**` with JSON stubs for each subtopic (per APP_AIM).
4. Implement formative/summative item components in `src/components/`.
5. Add CSV export and marking queue views to the teacher dashboard.
