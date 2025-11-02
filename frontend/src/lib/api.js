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

export async function createClass(token, { className, description, yearGroup }) {
  return request("/teacher/classes", {
    method: "POST",
    token,
    body: { className, description, yearGroup },
  });
}

export async function createStudent(token, payload) {
  return request("/teacher/students", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function bulkCreateStudents(token, payload) {
  return request("/teacher/students/bulk", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function unlockClassStage(token, payload) {
  return request("/teacher/classes/unlocks", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function unlockStudentStage(token, payload) {
  return request("/teacher/students/unlocks", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function archiveStudent(token, payload) {
  return request("/teacher/students/archive", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function exportClassProgress(token, classId) {
  return request(`/teacher/classes/${classId}/export`, {
    method: "GET",
    token,
  });
}

export async function getStudentDashboard(token) {
  return request("/student/dashboard", {
    method: "GET",
    token,
  });
}

export async function getAdminDashboard(token) {
  return request("/admin/dashboard", {
    method: "GET",
    token,
  });
}

export async function createTeacher(token, payload) {
  return request("/admin/teachers", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function deleteTeacher(token, username) {
  return request(`/admin/teachers/${encodeURIComponent(username)}`, {
    method: "DELETE",
    token,
  });
}

