# Debug Logging Toolkit

This project now exposes structured JSON logs for every request that reaches the worker. Each log line includes:

- Request metadata (method, path, route, request id)
- Sanitised request bodies (passwords/tokens are masked)
- Authorisation results
- Database mutations (`setClassPacing`, unlocks, student creation, etc.)
- Response status codes and latency
- Errors, with stack traces truncated to keep output readable

## Tail the Worker in Real Time

```bash
node scripts/tail-worker-logs.mjs
```

The script wraps `npx wrangler tail --format=json`, persists the raw stream under `logs/worker/`, and emits a readable summary to the terminal (event name, request id, URL, duration, etc.).

> ℹ️ You must be logged into Cloudflare (`npx wrangler whoami`) before running the tail command.

Resulting NDJSON files can be opened in any log viewer or processed later with `jq`. Every entry is already sanitised, so you can safely share the log with collaborators without leaking credentials.

## Interpreting Events

Key events to watch for while reproducing pacing issues:

- `pacing.teacher.update_request` — a teacher attempted to change pacing for a class.
- `db.operation` with `action: setClassPacing` — the worker wrote the new pacing pointer to InstantDB.
- `response.sent` — final response status and latency for the request.
- `error` — surfaced whenever a handler throws (payload includes stack snippet).

Each request carries a `requestId`; search for that id in the log file to reconstruct the full lifecycle (body → auth → mutations → response).

## Frontend Traffic Coverage

All frontend API calls flow through the worker, so the tail already captures “every time someone clicks a button” in the app. For local testing, point `VITE_API_BASE` at your worker/dev URL so that requests pass through the same instrumentation.

If you also need in-browser logging (e.g. to confirm which component triggered a fetch), use the browser devtools network tab alongside these server-side traces.

