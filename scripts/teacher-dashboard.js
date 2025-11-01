import { CONFIG, getWorkerUrl } from "../src/lib/config.js";
import {
  loadSession,
  saveSession,
  clearSession,
} from "../src/lib/session.js";

const loginForm = document.querySelector("#teacher-login");
const authCard = document.querySelector("#auth-card");
const dashboard = document.querySelector("#dashboard");
const greeting = document.querySelector("#teacher-greeting");
const classList = document.querySelector("#class-list");
const rosterContainer = document.querySelector("#roster");
const unlocksContainer = document.querySelector("#unlocks");
const addClassForm = document.querySelector("#add-class");
const addStudentForm = document.querySelector("#add-student");
const unlockTopicForm = document.querySelector("#unlock-topic");
const signOutButton = document.querySelector("#sign-out");

let session = null;

init();

function init() {
  session = loadSession();
  if (session?.role === "teacher" && session?.token) {
    hydrateDashboard();
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const credentials = {
      email: formData.get("email")?.toString().trim(),
      password: formData.get("password")?.toString(),
    };

    if (!credentials.email || !credentials.password) {
      return setStatus(loginForm, "Enter login ID and password.", "error");
    }

    setStatus(loginForm, "Signing in…");

    try {
      const response = await fetch(getWorkerUrl("/t/login"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({}));
        throw new Error(error || "Login failed");
      }

      const payload = await response.json();
      session = {
        role: "teacher",
        token: payload.token,
      };
      saveSession(session);
      setStatus(loginForm, "Signed in!", "success");
      hydrateDashboard(true);
    } catch (error) {
      console.error(error);
      setStatus(loginForm, error.message || "Unable to sign in", "error");
    }
  });

  addClassForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ensureSession()) return;
    const formData = new FormData(addClassForm);
    const body = {
      name: formData.get("name")?.toString().trim(),
      description: formData.get("description")?.toString(),
    };

    if (!body.name) {
      return setStatus(addClassForm, "Class name is required.", "error");
    }

    await submitProtected("/t/add-class", body, addClassForm, {
      success: "Class created.",
    });
    addClassForm.reset();
    await hydrateDashboard();
  });

  addStudentForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ensureSession()) return;
    const formData = new FormData(addStudentForm);
    const classId = formData.get("classId")?.toString().trim();

    const student = {};
    const username = formData.get("username")?.toString().trim();
    const name = formData.get("name")?.toString().trim();
    if (username) student.username = username;
    if (name) student.name = name;

    if (!classId) {
      return setStatus(addStudentForm, "Class ID is required.", "error");
    }

    const body = {
      classId,
    };

    if (Object.keys(student).length > 0) {
      body.student = student;
    }

    await submitProtected("/t/add-student", body, addStudentForm, {
      success: "Student enrolled.",
    });
    addStudentForm.reset();
    await hydrateDashboard();
  });

  unlockTopicForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ensureSession()) return;
    const formData = new FormData(unlockTopicForm);
    const classId = formData.get("classId")?.toString().trim();
    const topicId = formData.get("topicId")?.toString().trim();

    if (!classId || !topicId) {
      return setStatus(
        unlockTopicForm,
        "Provide both class ID and topic ID.",
        "error",
      );
    }

    const body = {
      classId,
      topicId,
    };

    await submitProtected("/t/unlock-topic", body, unlockTopicForm, {
      success: "Topic unlocked.",
    });
    unlockTopicForm.reset();
    await hydrateDashboard();
  });

  signOutButton?.addEventListener("click", () => {
    clearSession();
    session = null;
    toggleAuth(false);
    setStatus(loginForm, "Signed out.");
  });
}

function ensureSession() {
  if (!session?.token) {
    setStatus(loginForm, "Sign in to continue.", "error");
    toggleAuth(false);
    return false;
  }
  return true;
}

async function hydrateDashboard(force = false) {
  if (!ensureSession()) return;
  if (!force && !session?.token) return;
  toggleAuth(true);
  setStatus(loginForm, "");
  setStatus(addClassForm, "");
  setStatus(addStudentForm, "");
  setStatus(unlockTopicForm, "");

  try {
    const response = await fetch(getWorkerUrl("/t/dashboard"), {
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearSession();
        session = null;
        throw new Error("Session expired. Please sign in again.");
      }
      const { error } = await response.json().catch(() => ({}));
      throw new Error(error || "Failed to load dashboard.");
    }

    const data = await response.json();
    greeting.textContent = `Welcome, ${data.teacherId ?? "teacher"}`;
    renderClasses(data.classes || []);
    renderRoster(data.roster || []);
    renderUnlocks(data.unlocks || []);
  } catch (error) {
    console.error(error);
    setStatus(loginForm, error.message || "Unable to load dashboard", "error");
    toggleAuth(false);
  }
}

function renderClasses(classes) {
  if (!classes.length) {
    classList.innerHTML =
      '<li class="subtle">No classes yet. Create one to get started.</li>';
    return;
  }

  classList.innerHTML = "";
  for (const entry of classes) {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${escapeHtml(entry.name ?? "Class")}</strong><br />
      <span class="subtle">ID: ${escapeHtml(
        entry.id ?? entry.classId ?? "unknown",
      )}</span>
    `;
    classList.appendChild(li);
  }
}

function renderRoster(roster) {
  if (!roster.length) {
    rosterContainer.innerHTML =
      '<p class="subtle">No students enrolled for the selected classes.</p>';
    return;
  }

  rosterContainer.innerHTML = "";
  for (const record of roster) {
    const div = document.createElement("div");
    const student = record.student || {};
    const studentName = student.name || student.username || record.studentId;

    div.className = "list-item";
    div.innerHTML = `
      <strong>${escapeHtml(studentName ?? "Student")}</strong>
      <div class="subtle">Class: ${escapeHtml(
        record.classId ?? "unknown",
      )}</div>
      <div class="badge">${escapeHtml(record.status ?? "active")}</div>
    `;
    rosterContainer.appendChild(div);
  }
}

function renderUnlocks(unlocks) {
  if (!unlocks.length) {
    unlocksContainer.innerHTML =
      '<p class="subtle">Topics not yet unlocked.</p>';
    return;
  }

  unlocksContainer.innerHTML = "";
  for (const unlock of unlocks) {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <strong>${escapeHtml(unlock.topic?.title ?? unlock.topicId)}</strong>
      <div class="subtle">Class: ${escapeHtml(
        unlock.classId ?? "unknown",
      )}</div>
      <div class="subtle">Unlocked at: ${escapeHtml(
        unlock.unlockedAt ?? "recently",
      )}</div>
    `;
    unlocksContainer.appendChild(div);
  }
}

/**
 * @param {string} endpoint
 * @param {any} body
 * @param {HTMLFormElement} form
 * @param {{success?: string}} options
 */
async function submitProtected(endpoint, body, form, options = {}) {
  if (!session?.token) {
    throw new Error("Session missing.");
  }

  setStatus(form, "Saving…");

  try {
    const response = await fetch(getWorkerUrl(endpoint), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const { error } = await response.json().catch(() => ({}));
      throw new Error(error || "Request failed");
    }

    setStatus(form, options.success ?? "Done.", "success");
  } catch (error) {
    console.error(error);
    setStatus(form, error.message || "Request failed", "error");
  }
}

/**
 * @param {HTMLElement | null} element
 * @param {string} message
 * @param {"error" | "success" | ""} tone
 */
function setStatus(element, message, tone = "") {
  if (!element) return;
  let status = element.querySelector(".form-status");
  if (!status) {
    status = document.createElement("p");
    status.className = "form-status";
    element.appendChild(status);
  }
  status.textContent = message;
  status.classList.remove("error", "success");
  if (tone) {
    status.classList.add(tone);
  }
}

function toggleAuth(showDashboard) {
  if (showDashboard) {
    authCard?.classList.add("hidden");
    dashboard?.classList.remove("hidden");
  } else {
    authCard?.classList.remove("hidden");
    dashboard?.classList.add("hidden");
  }
}

function escapeHtml(value) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Display configuration hints in the console for quick validation
console.info("InstantDB App:", CONFIG.instantAppId);
console.info("Worker Base:", CONFIG.workerBaseUrl);
