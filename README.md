# ibcs-app (POC)

Proof-of-concept for the IB Computer Science learning platform using a **flat stack**:

- **Frontend**: React + Vite single-page app hosted on **GitHub Pages** (`https://stss15.github.io/ibcs-app/`).
- **Backend**: none (for this POC). The browser talks directly to **InstantDB** using a temporary admin token.
- **Database**: InstantDB collections (`teachers`, `classes`, `students`).

> ⚠️ **Security warning**: The admin token is exposed client-side (`public/app-config.json`) strictly for this prototype. Rotate the token immediately after demos and move to a server-issued token flow when productionising.

---

## Project structure

```
frontend/               # React + Vite SPA (login, dashboard, student view)
  src/lib/instant.js   # Thin InstantDB client (list/create/findOne)
  src/lib/hash.js      # SHA-256 hashing helper
  src/lib/bootstrap.js # Seeds the demo teacher (MrStewart) once
  src/hooks/useSession.js
  src/pages/           # LoginPage, TeacherDashboardPage, StudentDashboardPage, TopicPage
  src/components/Layout
  index.html           # CSP-enabled entrypoint for the SPA
public/app-config.json # APP_ID + dev admin token (downloaded at runtime)
src/pages/             # Legacy static pages now pointing to the SPA
src/styles/landing.css # Styling for the GitHub Pages landing splash
```

---

## InstantDB setup

Collections used in this POC (schemaless, but recommended fields):

1. **teachers**
   - `username` (string, unique)
   - `password` (string, SHA-256 hash)
   - `createdAt` (ISO timestamp)
2. **classes**
   - `className` (string)
   - `description` (string, optional)
   - `teacherUsername` (string, links to teachers.username)
   - `createdAt` (ISO timestamp)
3. **students**
   - `name` (string)
   - `username` (string, optional but useful for student login later)
   - `password` (string, SHA-256 hash)
   - `classId` (string, InstantDB document id)
   - `teacherUsername` (string)
   - `createdAt` (ISO timestamp)

The app seeds the demo teacher automatically:

```
username: MrStewart
password: Dragon-S25052 (stored as SHA-256 hash)
```

---

## Running locally

```bash
npm install
npm run dev --prefix frontend
```

Vite automatically serves the SPA at `http://localhost:5173/ibcs-app/` (because the base is set to `/ibcs-app/`).

To build:

```bash
npm run build --prefix frontend
```

Deploy the contents of `frontend/dist/` to the branch that GitHub Pages uses (typically `main` or `gh-pages`).

---

## Runtime config

`public/app-config.json` contains:

```json
{
  "APP_ID": "fa61cd0c-d77e-44e5-919d-90a90ead7039",
  "INSTANT_ADMIN_TOKEN": "c88b98ee-4a55-4d83-ae15-57fdc04ed886"
}
```

At startup the SPA fetches this JSON, caches it, and uses it to call InstantDB.

---

## Application flow

1. **Bootstrap** (`frontend/src/lib/bootstrap.js`)
   - On first load we check whether `teachers` contains `MrStewart`.
   - If missing, the app inserts the teacher with a SHA-256 hash of `Dragon-S25052`.

2. **Login** (`LoginPage`)
   - User selects Teacher or Student.
   - We SHA-256 the entered password client-side and compare with InstantDB.
   - Session is stored in `localStorage` (`ibcs.session`).

3. **Teacher dashboard** (`/dashboard`)
   - Lists classes where `teacherUsername` matches the session.
   - Create class → `create("classes", {...})`.
   - Add student → `create("students", {..., password: <sha256>})`.
   - Roster shows students filtered by class ID.

4. **Student view** (`/student`)
   - Displays the assigned class for the logged-in student.

All writes/read go straight to InstantDB’s REST API via `frontend/src/lib/instant.js`.

---

## Production caveats

- **Token exposure**: anyone can inspect the network tab and use the admin token. Rotate immediately after demos.
- **No server-side validation**: class ownership, password hashing, and auth are enforced client-side only in this POC.
- **Rate limits**: the InstantDB helper includes a very small retry/backoff but you should harden it if you spike requests.
- **Password storage**: SHA-256 is used purely for simplicity. Switch to bcrypt/argon2 on the server later.

---

## Verification checklist

1. Load `https://stss15.github.io/ibcs-app/`.
2. If prompted, the app silently seeds `MrStewart` (toast appears once).
3. Log in as Teacher: `MrStewart / Dragon-S25052`.
4. Create a class (e.g., “HL Year 1”).
5. Add a student (e.g., `username: Alice`, `password: student123`).
6. Refresh the page → class and student persist (read from InstantDB).
7. Sign out, log in as Student (`Alice / student123`) → see the class summary.

---

## After the demo

- Rotate the InstantDB admin token (`INSTANT_ADMIN_TOKEN`).
- Migrate sensitive operations server-side (Cloudflare Worker, Flask, etc.).
- Replace SHA-256 with a stronger password scheme on the server.
- Remove `public/app-config.json` or replace it with runtime-configured values.
