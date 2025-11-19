# Cloudflare Worker (Minimal Auth API)

This worker now only handles login, token verification, and the admin/teacher endpoints for managing classes.

## Required Secrets
- `INSTANT_APP_ID` (InstantDB app id)
- `INSTANT_ADMIN_TOKEN` (InstantDB admin token)
- `TOKEN_SECRET` (HMAC key for JWT, e.g. `openssl rand -base64 32`)

Set each secret with `npx wrangler secret put SECRET_NAME`.

## Seeded credentials
- The worker automatically seeds an `admin` account plus the `MrStewart` teacher with the default password `SGSD2024!` (bcrypt-hashed) the first time it handles a request.
- Override the defaults by providing `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`, `SEED_TEACHER_USERNAME`, and/or `SEED_TEACHER_PASSWORD` via Wrangler secrets or the environment; legacy names like `ADMIN_USERNAME`/`TEACHER_PASSWORD` are still supported.
- Use `npm run set-credentials` whenever you need to rotate credentials manually—the script uses the same `SEED_*` variables so you can keep everything in sync.

## Commands
```
npx wrangler dev    # run locally
npx wrangler deploy # deploy to Cloudflare
npx wrangler tail   # stream logs
```

## Exposed Endpoints
- `POST /auth/login`
- `POST /auth/verify`
- `GET /admin/dashboard`
- `POST /admin/teachers`
- `DELETE /admin/teachers/:username`
- `GET /teacher/dashboard`
- `POST /teacher/classes`
- `POST /teacher/classes/:classId/students`
- `DELETE /teacher/classes/:classId/students/:studentId`

All admin/teacher routes expect a `Bearer` token issued from `POST /auth/login`.
