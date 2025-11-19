import { loadConfig } from './config.js';

async function request(path, { method = 'GET', token, body, headers } = {}) {
  const { apiBase } = await loadConfig();
  const url = `${apiBase}${path}`;
  const init = {
    method,
    headers: {
      'content-type': 'application/json',
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
      // ignore
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function login({ role, username, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: { role, username, password },
  });
}

export async function verify(token) {
  return request('/auth/verify', {
    method: 'POST',
    body: { token },
  });
}

export async function getAdminDashboard(token) {
  return request('/admin/dashboard', {
    method: 'GET',
    token,
  });
}

export async function createTeacher(token, { count = 1 } = {}) {
  return request('/admin/teachers', {
    method: 'POST',
    token,
    body: { count },
  });
}

export async function deleteTeacher(token, username) {
  if (!username) throw new Error('Username is required to archive a teacher');
  return request(`/admin/teachers/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    token,
  });
}

export async function getTeacherDashboard(token) {
  return request('/teacher/dashboard', {
    method: 'GET',
    token,
  });
}

export async function createClass(token, payload) {
  return request('/teacher/classes', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function addStudentsToClass(token, classId, { count }) {
  if (!classId) throw new Error('Class ID is required');
  return request(`/teacher/classes/${encodeURIComponent(classId)}/students`, {
    method: 'POST',
    token,
    body: { count },
  });
}

export async function removeStudent(token, classId, studentId) {
  if (!classId || !studentId) throw new Error('Class ID and student ID are required');
  return request(`/teacher/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}`, {
    method: 'DELETE',
    token,
  });
}
