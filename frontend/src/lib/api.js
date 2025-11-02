import { loadConfig } from "./config.js";

async function request(path, { method = "GET", token, body, headers } = {}) {
  const { apiBase } = await loadConfig();
  const url = `${apiBase}${path}`;
  const init = {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, init);
  const text = await response.text();

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.error) message = data.error;
    } catch {
      // ignore JSON parse errors
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function login({ role, username, password }) {
  return request("/auth/login", {
    method: "POST",
    body: { role, username, password },
  });
}

export async function verify(token) {
  return request("/auth/verify", {
    method: "POST",
    body: { token },
  });
}

export async function getTeacherDashboard(token) {
  return request("/teacher/dashboard", {
    method: "GET",
    token,
  });
}

export async function createClass(token, { className, description }) {
  return request("/teacher/classes", {
    method: "POST",
    token,
    body: { className, description },
  });
}

export async function createStudent(token, payload) {
  return request("/teacher/students", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function getStudentDashboard(token) {
  return request("/student/dashboard", {
    method: "GET",
    token,
  });
}


