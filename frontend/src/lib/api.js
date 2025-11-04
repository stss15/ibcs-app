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

export async function getClassPacing(token, classId) {
  return request(`/teacher/classes/${encodeURIComponent(classId)}/pacing`, {
    method: "GET",
    token,
  });
}

export async function getStudentClassPacing(token, classId) {
  return request(`/student/classes/${encodeURIComponent(classId)}/pacing`, {
    method: "GET",
    token,
  });
}

export async function joinLiveSession(token, joinCode) {
  return request("/student/live-sessions/join", {
    method: "POST",
    token,
    body: { joinCode },
  });
}

export async function regenerateClassCredentials(token, classId, options = {}) {
  const payload = {};
  if (Array.isArray(options.studentIds) && options.studentIds.length > 0) {
    payload.studentIds = options.studentIds;
  }
  return request(`/teacher/classes/${encodeURIComponent(classId)}/credentials`, {
    method: "POST",
    token,
    body: payload,
  });
}

export async function getTeacherStudentDashboard(token, studentId) {
  return request(`/teacher/students/${encodeURIComponent(studentId)}/dashboard`, {
    method: "GET",
    token,
  });
}

export async function updateClassPacing(token, classId, payload) {
  return request(`/teacher/classes/${encodeURIComponent(classId)}/pacing`, {
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

export async function getStudentGamification(token) {
  return request("/student/gamification", {
    method: "GET",
    token,
  });
}

export async function syncStudentGamification(token, gamificationData) {
  return request("/student/gamification", {
    method: "POST",
    token,
    body: gamificationData,
  });
}

export async function syncStudentProgress(token, progressData) {
  return request("/student/progress", {
    method: "POST",
    token,
    body: progressData,
  });
}

export async function updateLiveAssessmentStatus(token, statusData) {
  return request("/student/live-assessment-status", {
    method: "POST",
    token,
    body: statusData,
  });
}

export async function getLiveAssessmentStatus(token, classId, { unitId, segmentId }) {
  if (!classId) {
    throw new Error("classId is required to fetch live assessment status");
  }
  const params = new URLSearchParams();
  if (unitId) params.append("unitId", unitId);
  if (segmentId) params.append("segmentId", segmentId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/teacher/classes/${encodeURIComponent(classId)}/live-assessment-status${query}`, {
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

