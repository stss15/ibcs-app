const DEFAULT_LEVEL = 'info';
const MAX_DEPTH = 4;
const MAX_ARRAY_LENGTH = 25;
const MAX_STRING_LENGTH = 600;

const SENSITIVE_KEYS = [
  'password',
  'token',
  'authorization',
  'secret',
  'seedkey',
  'admin_token',
  'adminToken',
  'teacherPassword',
  'studentPassword',
];

function generateRequestId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createRequestContext({ request, route = 'unknown', source = 'worker' }) {
  const url = new URL(request.url);
  return {
    id: generateRequestId(),
    startedAt: Date.now(),
    method: request.method,
    route,
    path: url.pathname,
    query: url.search || '',
    source,
    requestHeaders: extractHeaders(request.headers),
  };
}

export function updateRoute(ctx, route) {
  if (route) {
    ctx.route = route;
  }
}

export function attachSession(ctx, session) {
  if (!session) return;
  ctx.session = sanitize({
    id: session.sub || session.id || null,
    role: session.role || null,
    username: session.username || null,
  });
}

export function attachActor(ctx, actor) {
  if (!actor) return;
  ctx.actor = sanitize(actor);
}

export function logRequestStart(ctx, details = {}) {
  emit(ctx, 'request.start', details);
}

export function logRequestPayload(ctx, payload) {
  if (payload === undefined) return;
  emit(ctx, 'request.body', { body: sanitize(payload) });
}

export function logAuthResult(ctx, result) {
  emit(ctx, 'auth.result', sanitize(result));
}

export function logDbOperation(ctx, details) {
  emit(ctx, 'db.operation', sanitize(details));
}

export function logEvent(ctx, event, details = {}, level = DEFAULT_LEVEL) {
  emit(ctx, event, sanitize(details), level);
}

export async function logResponse(ctx, response) {
  const durationMs = Date.now() - (ctx.startedAt || Date.now());
  const summary = {
    status: response?.status ?? null,
    durationMs,
  };

  if (!response) {
    emit(ctx, 'response.missing', summary, 'warn');
    return response;
  }

  let bodyPreview = null;
  try {
    const clone = response.clone();
    const contentType = clone.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await clone.json();
      bodyPreview = sanitize(json);
    } else if (contentType.startsWith('text/')) {
      const text = await clone.text();
      bodyPreview = sanitizeText(text);
    }
  } catch (error) {
    emit(ctx, 'response.read_error', { error: serializeError(error) }, 'warn');
  }

  emit(ctx, 'response.sent', { ...summary, body: bodyPreview });
  return response;
}

export function logError(ctx, error, details = {}) {
  emit(ctx, 'error', { error: serializeError(error), details: sanitize(details) }, 'error');
}

function emit(ctx, event, details = {}, level = DEFAULT_LEVEL) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    requestId: ctx?.id ?? null,
    route: ctx?.route ?? null,
    method: ctx?.method ?? null,
    path: ctx?.path ?? null,
    query: ctx?.query ?? null,
    source: ctx?.source ?? 'worker',
    session: ctx?.session ?? null,
    actor: ctx?.actor ?? null,
    ...details,
  };

  try {
    console.log(JSON.stringify(payload));
  } catch (error) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        event: 'logger.serialization_failed',
        details: serializeError(error),
      }),
    );
  }
}

function sanitize(value, depth = 0) {
  if (value === null || value === undefined) {
    return value;
  }

  if (depth > MAX_DEPTH) {
    return '[MaxDepth]';
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_LENGTH).map((item) => sanitize(item, depth + 1));
  }

  if (typeof value === 'string') {
    return sanitizeText(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    const output = {};
    for (const [key, val] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        output[key] = maskSensitive(val);
      } else {
        output[key] = sanitize(val, depth + 1);
      }
    }
    return output;
  }

  return String(value);
}

function sanitizeText(text) {
  const normalized = String(text ?? '');
  if (normalized.length <= MAX_STRING_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, MAX_STRING_LENGTH)}…[truncated ${normalized.length - MAX_STRING_LENGTH} chars]`;
}

function isSensitiveKey(key) {
  const lower = String(key).toLowerCase();
  return SENSITIVE_KEYS.some((token) => lower.includes(token));
}

function maskSensitive(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const preview = typeof value === 'string' ? value : JSON.stringify(value);
  return `***redacted:${Math.min(preview.length, 32)}***`;
}

function extractHeaders(headers) {
  const output = {};
  if (!headers) return output;
  for (const [key, value] of headers.entries()) {
    if (isSensitiveKey(key)) {
      output[key] = maskSensitive(value);
    } else if (key.toLowerCase() === 'cookie') {
      output[key] = maskSensitive(value);
    } else {
      output[key] = sanitizeText(value);
    }
  }
  return output;
}

function serializeError(error) {
  if (!error) return null;
  if (typeof error === 'string') {
    return { message: error };
  }
  return {
    name: error.name || 'Error',
    message: error.message || String(error),
    stack: typeof error.stack === 'string' ? sanitizeText(error.stack) : undefined,
  };
}

