const WORKER_BASE = __WORKER_BASE__;

function resolve(path) {
  if (!WORKER_BASE) {
    throw new Error("WORKER_BASE environment variable is not set.");
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${WORKER_BASE}${normalized}`;
}

export async function request(path, options = {}) {
  const response = await fetch(resolve(path), {
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || "Request failed");
    error.status = response.status;
    error.details = body;
    throw error;
  }
  return body;
}

export function withAuthHeaders(token) {
  return token
    ? {
        authorization: `Bearer ${token}`,
      }
    : {};
}
