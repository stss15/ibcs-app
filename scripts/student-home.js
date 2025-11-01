import { getWorkerUrl } from "../src/lib/config.js";
import {
  loadSession,
  saveSession,
  clearSession,
} from "../src/lib/session.js";

const loginForm = document.querySelector("#student-login");
const authCard = document.querySelector("#student-auth");
const dashboard = document.querySelector("#student-dashboard");
const greeting = document.querySelector("#student-greeting");
const currentTopic = document.querySelector("#current-topic");
const unlockGrid = document.querySelector("#student-unlocks");
const progressGrid = document.querySelector("#student-progress");
const signOutButton = document.querySelector("#student-sign-out");

let session = null;

init();

function init() {
  session = loadSession();
  if (session?.role === "student" && session?.token) {
    toggleAuth(true);
    hydrateStudentView();
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const credentials = {
      classCode: formData.get("classCode")?.toString().trim(),
      username: formData.get("username")?.toString().trim(),
      password: formData.get("password")?.toString(),
    };

    if (!credentials.classCode || !credentials.username || !credentials.password) {
      return setStatus(loginForm, "Fill in all fields.", "error");
    }

    setStatus(loginForm, "Signing in…");

    try {
      const response = await fetch(getWorkerUrl("/s/login"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          classCode: credentials.classCode,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({}));
        throw new Error(error || "Login failed");
      }

      const payload = await response.json();
      session = {
        role: "student",
        token: payload.token,
        classCode: credentials.classCode,
        username: credentials.username,
      };
      saveSession(session);
      toggleAuth(true);
      setStatus(loginForm, "");
      hydrateStudentView();
    } catch (error) {
      console.error(error);
      setStatus(loginForm, error.message || "Unable to sign in", "error");
    }
  });

  signOutButton?.addEventListener("click", () => {
    clearSession();
    session = null;
    toggleAuth(false);
    setStatus(loginForm, "Signed out.");
  });
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

function hydrateStudentView() {
  if (!session) return;
  greeting.textContent = `Welcome back, ${session.username || "student"}`;

  // TODO: Replace mocked data with InstantDB fetches (progress, unlocks, current topic).
  const unlockedTopics = getMockTopics();
  const progress = getMockProgress();

  renderTopics(unlockedTopics);
  renderProgress(progress);
  renderCurrentTopic(unlockedTopics[0] ?? null);
}

function renderTopics(topics) {
  if (!topics.length) {
    unlockGrid.innerHTML =
      '<p class="subtle">Your teacher has not unlocked any topics yet.</p>';
    return;
  }

  unlockGrid.innerHTML = "";
  for (const topic of topics) {
    const card = document.createElement("article");
    card.className = "topic-card";
    card.innerHTML = `
      <h4>${escapeHtml(topic.slug)}</h4>
      <p>${escapeHtml(topic.title)}</p>
      <div class="badge">${escapeHtml(topic.status)}</div>
    `;
    card.addEventListener("click", () => renderCurrentTopic(topic));
    unlockGrid.appendChild(card);
  }
}

function renderCurrentTopic(topic) {
  if (!topic) {
    currentTopic.textContent = "Select a topic to begin.";
    return;
  }
  currentTopic.innerHTML = `
    <h4>${escapeHtml(topic.title)}</h4>
    <p>${escapeHtml(topic.summary)}</p>
    <ul>
      <li><strong>Reading:</strong> ${topic.sections.reading}</li>
      <li><strong>Formative:</strong> ${topic.sections.formative}</li>
      <li><strong>Summative:</strong> ${topic.sections.summative}</li>
    </ul>
  `;
}

function renderProgress(progressItems) {
  if (!progressItems.length) {
    progressGrid.innerHTML =
      '<p class="subtle">Progress will appear once you complete activities.</p>';
    return;
  }

  progressGrid.innerHTML = "";
  for (const item of progressItems) {
    const div = document.createElement("div");
    div.className = "progress-item";
    div.innerHTML = `
      <strong>${escapeHtml(item.topic)}</strong>
      <div>${escapeHtml(item.stage)}</div>
      <div class="badge">${escapeHtml(item.status)}</div>
    `;
    progressGrid.appendChild(div);
  }
}

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

function getMockTopics() {
  return [
    {
      slug: "A1.1",
      title: "A1.1 — System fundamentals",
      status: "in progress",
      summary:
        "Understand the components required for successful system deployment.",
      sections: {
        reading: "System lifecycle overview",
        formative: "Concept check quiz",
        summative: "System planning case study",
      },
    },
    {
      slug: "A1.2",
      title: "A1.2 — System design",
      status: "locked",
      summary: "Analyze design approaches and requirements gathering.",
      sections: {
        reading: "Design diagrams and methodologies",
        formative: "Drag-and-drop UML builder",
        summative: "Design rationale write-up",
      },
    },
  ];
}

function getMockProgress() {
  return [
    {
      topic: "A1.1",
      stage: "Formative quiz",
      status: "complete",
    },
    {
      topic: "A1.1",
      stage: "Summative submission",
      status: "pending review",
    },
  ];
}
