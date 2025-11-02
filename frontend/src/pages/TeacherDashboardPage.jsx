import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  archiveStudent,
  bulkCreateStudents,
  createClass,
  createStudent,
  getTeacherDashboard,
} from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import "./TeacherDashboardPage.css";

const STAGE_CONFIG = [
  {
    id: "year7",
    label: "Year 7",
    yearGroupLabel: "Year 7",
    cohortOffset: 7,
    groups: ["A", "B", "C", "D"],
    programme: "ks3",
    buildCode: (cohort, group) => `CsC/${cohort}F${group}`,
  },
  {
    id: "year8",
    label: "Year 8",
    yearGroupLabel: "Year 8",
    cohortOffset: 6,
    groups: ["A", "B", "C", "D"],
    programme: "ks3",
    buildCode: (cohort, group) => `CsC/${cohort}F${group}`,
  },
  {
    id: "year9",
    label: "Year 9",
    yearGroupLabel: "Year 9",
    cohortOffset: 5,
    groups: ["A", "B", "C", "D"],
    programme: "ks3",
    buildCode: (cohort, group) => `CsC/${cohort}F${group}`,
  },
  {
    id: "igcse",
    label: "IGCSE",
    yearGroupLabel: "IGCSE",
    cohortOffset: 4,
    groups: ["G1", "G2"],
    programme: "igcse",
    buildCode: (cohort, group) => `CsC/${cohort}${group}`,
  },
  {
    id: "ib",
    label: "IB",
    yearGroupLabel: "IB",
    cohortOffset: 2,
    groups: ["SL", "HL"],
    programme: (group) => (group === "HL" ? "ib-hl" : "ib-sl"),
    buildCode: (cohort, group) => `CsC/${cohort}${group}`,
  },
];

const CSV_TEMPLATE = "firstName,lastName,username\n";
const PASSWORD_WORDS = [
  "Aero",
  "Blaze",
  "Comet",
  "Delta",
  "Echo",
  "Frost",
  "Glimmer",
  "Helio",
  "Iris",
  "Jade",
  "Kite",
  "Lumen",
  "Nova",
  "Orion",
  "Pip",
  "Quill",
  "Rune",
  "Sol",
  "Terra",
  "Vivid",
  "Wisp",
  "Xeno",
  "Yarrow",
  "Zephyr",
];
const PASSWORD_SYMBOLS = ["!", "?", "@", "#", "$"];

const PASSWORD_STORAGE_KEY = "ibcs.teacherPasswords";

function readStoredPasswords() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredPasswords(map) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage write failures (private browsing, etc.)
  }
}

function usernameKey(username) {
  return `username:${username.toLowerCase()}`;
}

function rememberPasswords(prev, entries) {
  const next = { ...prev };
  for (const entry of entries) {
    if (!entry?.password) continue;
    if (entry.id) {
      next[entry.id] = entry.password;
    }
    if (entry.username) {
      next[usernameKey(entry.username)] = entry.password;
    }
  }
  return next;
}

function resolveStoredPassword(map, student) {
  const byId = student?.id ? map[student.id] : undefined;
  if (byId) return byId;
  if (student?.username) {
    return map[usernameKey(student.username)];
  }
  return undefined;
}

function getStageConfig(stageId) {
  return STAGE_CONFIG.find((item) => item.id === stageId) ?? STAGE_CONFIG[0];
}

function padCohort(value) {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return digits.slice(-2).padStart(2, "0");
}

function defaultCohort(offsetYears) {
  const year = new Date().getFullYear();
  const cohort = (year % 100) + offsetYears;
  return padCohort(cohort);
}

function generateClassCode(stageId, cohort, group) {
  const config = getStageConfig(stageId);
  const cleanedGroup = group?.toUpperCase() ?? "";
  const cleanedCohort = padCohort(cohort || defaultCohort(config.cohortOffset));
  return config.buildCode(cleanedCohort, cleanedGroup);
}

function deriveProgramme(stageId, group) {
  const config = getStageConfig(stageId);
  if (typeof config.programme === "function") {
    return config.programme(group?.toUpperCase());
  }
  return config.programme;
}

function deriveYearGroupLabel(stageId, group) {
  const config = getStageConfig(stageId);
  if (stageId === "ib") {
    return `IB ${group?.toUpperCase() === "HL" ? "HL" : "SL"}`;
  }
  if (stageId === "igcse") {
    return "IGCSE";
  }
  return config.yearGroupLabel;
}

function parseClassMeta(classItem) {
  const className = classItem?.className ?? "";
  const yearGroup = (classItem?.yearGroup ?? "").toLowerCase();
  let stageId = null;
  if (yearGroup.includes("year 7")) stageId = "year7";
  else if (yearGroup.includes("year 8")) stageId = "year8";
  else if (yearGroup.includes("year 9")) stageId = "year9";
  else if (yearGroup.includes("igcse")) stageId = "igcse";
  else if (yearGroup.includes("hl") || yearGroup.includes("sl") || yearGroup.includes("ib")) stageId = "ib";

  const match = className.match(/^CsC\/(\d{2})([A-Za-z0-9]+)$/);
  const cohort = match ? match[1] : "";
  let group = match ? match[2].toUpperCase() : "";

  if (stageId === "year7" || stageId === "year8" || stageId === "year9") {
    group = group.replace(/^F/, "");
  }
  if (stageId === "igcse" && !group.startsWith("G")) {
    group = `G${group}`;
  }
  if (stageId === "ib") {
    group = group === "HL" ? "HL" : "SL";
  }

  const programme = deriveProgramme(stageId ?? "year7", group);
  const yearGroupLabel = deriveYearGroupLabel(stageId ?? "year7", group);

  return {
    stageId: stageId ?? "year7",
    cohort: cohort || defaultCohort(getStageConfig(stageId ?? "year7").cohortOffset),
    group: group || getStageConfig(stageId ?? "year7").groups[0],
    programme,
    yearGroupLabel,
  };
}

function generatePassword() {
  const word = PASSWORD_WORDS[Math.floor(Math.random() * PASSWORD_WORDS.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  const symbol = PASSWORD_SYMBOLS[Math.floor(Math.random() * PASSWORD_SYMBOLS.length)];
  return `${word}${number}${symbol}`;
}

function extractPlainPassword(student) {
  const candidates = [
    student?.passwordPlain,
    student?.initialPassword,
    student?.passwordPreview,
    student?.defaultPassword,
    student?.password,
  ];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    if (/^\$2[aby]\$/.test(trimmed)) {
      continue;
    }
    return trimmed;
  }
  return "";
}

function parseCsvStudents(text) {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length <= 1) {
    return [];
  }

  const header = rows[0].split(/\s*,\s*/).map((h) => h.toLowerCase());
  const firstNameIndex = header.indexOf("firstname");
  const lastNameIndex = header.indexOf("lastname");
  const usernameIndex = header.indexOf("username");

  if (firstNameIndex === -1 || lastNameIndex === -1) {
    throw new Error("Template must include firstName and lastName columns.");
  }

  return rows.slice(1).map((row) => {
    const cells = row.split(/\s*,\s*/);
    return {
      firstName: cells[firstNameIndex] ?? "",
      lastName: cells[lastNameIndex] ?? "",
      username: usernameIndex === -1 ? "" : cells[usernameIndex] ?? "",
    };
  });
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ibcs-student-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function TeacherDashboardPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const token = session?.token ?? null;
  const isTeacher = session?.user?.role === "teacher";

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [expandedClassId, setExpandedClassId] = useState(null);

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [studentModal, setStudentModal] = useState(null); // { class: object, mode: "single" | "bulk" }

  const [classForm, setClassForm] = useState(() => {
    const stage = STAGE_CONFIG[0];
    const cohort = defaultCohort(stage.cohortOffset);
    const group = stage.groups[0];
    return {
      stageId: stage.id,
      cohort,
      group,
      className: generateClassCode(stage.id, cohort, group),
      description: "",
    };
  });

  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: generatePassword(),
  });

  const [bulkCsv, setBulkCsv] = useState(null);
  const [bulkStatus, setBulkStatus] = useState(null);
  const [passwordLookup, setPasswordLookupState] = useState(() => readStoredPasswords());
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const updatePasswordLookup = useCallback((updater) => {
    setPasswordLookupState((prev) => {
      const result = typeof updater === "function" ? updater(prev) : updater;
      const next = result ? result : {};
      writeStoredPasswords(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!isTeacher) {
      updatePasswordLookup({});
      navigate("/", { replace: true });
    }
  }, [ready, isTeacher, navigate, updatePasswordLookup]);

  const loadDashboard = useCallback(async () => {
    if (!token || !isTeacher) return;
    setLoading(true);
    try {
      const data = await getTeacherDashboard(token);
      setDashboard(data);
      if (Array.isArray(data?.students)) {
        const entries = [];
        for (const student of data.students) {
          const plain = extractPlainPassword(student);
          if (plain) {
            entries.push({ id: student.id, username: student.username, password: plain });
          }
        }
        if (entries.length > 0) {
          updatePasswordLookup((prev) => rememberPasswords(prev, entries));
        }
      }
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to load dashboard." });
    } finally {
      setLoading(false);
    }
  }, [token, isTeacher, updatePasswordLookup]);

  useEffect(() => {
    if (!ready || !isTeacher) return;
    loadDashboard();
  }, [ready, isTeacher, loadDashboard]);

  const classes = useMemo(() => {
    const list = dashboard?.classes ?? [];
    return [...list].sort((a, b) => a.className.localeCompare(b.className));
  }, [dashboard?.classes]);

  const studentsByClass = useMemo(() => {
    const map = new Map();
    for (const student of dashboard?.students ?? []) {
      if (!map.has(student.classId)) {
        map.set(student.classId, []);
      }
      map.get(student.classId).push(student);
    }
    for (const value of map.values()) {
      value.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }
    return map;
  }, [dashboard?.students]);

  const teacherName =
    dashboard?.teacher?.displayName ?? session?.user?.displayName ?? session?.user?.username ?? "Teacher";

  const overallStudentCount = dashboard?.students?.length ?? 0;
  const lockedLessons = dashboard?.lessonSummary?.locked ?? 0;
  const availableLessons = dashboard?.lessonSummary?.available ?? 0;
  const formativeComplete = dashboard?.lessonSummary?.["formative-complete"] ?? 0;
  const summativeComplete = dashboard?.lessonSummary?.["summative-complete"] ?? 0;

  const summaryCards = [
    { label: "Active classes", value: classes.length },
    { label: "Active students", value: overallStudentCount },
    { label: "Available lessons", value: availableLessons },
  ];

  const handleClassStageChange = (key, value) => {
    setClassForm((prev) => {
      if (key === "stageId") {
        const config = getStageConfig(value);
        const cohort = defaultCohort(config.cohortOffset);
        const group = config.groups[0];
        return {
          stageId: value,
          cohort,
          group,
          description: "",
          className: generateClassCode(value, cohort, group),
        };
      }
      if (key === "cohort") {
        return {
          ...prev,
          cohort: value,
          className: generateClassCode(prev.stageId, value, prev.group),
        };
      }
      if (key === "group") {
        return {
          ...prev,
          group: value,
          className: generateClassCode(prev.stageId, prev.cohort, value),
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const openClassModal = () => {
    const stage = STAGE_CONFIG[0];
    const cohort = defaultCohort(stage.cohortOffset);
    const group = stage.groups[0];
    setClassForm({
      stageId: stage.id,
      cohort,
      group,
      description: "",
      className: generateClassCode(stage.id, cohort, group),
    });
    setStatus(null);
    setClassModalOpen(true);
  };

  const submitClass = async (event) => {
    event.preventDefault();
    if (!token) return;
    const config = getStageConfig(classForm.stageId);
    const cohort = padCohort(classForm.cohort) || defaultCohort(config.cohortOffset);
    const group = classForm.group || config.groups[0];
    const className = generateClassCode(classForm.stageId, cohort, group);
    const yearGroup = deriveYearGroupLabel(classForm.stageId, group);

    try {
      setStatus({ tone: "info", message: "Creating class…" });
      const created = await createClass(token, {
        className,
        description: classForm.description || undefined,
        yearGroup,
      });
      setStatus({ tone: "success", message: `Class ${className} created.` });
      setClassModalOpen(false);
      setExpandedClassId(created?.id ?? null);
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Unable to create class." });
    }
  };

  const openStudentModal = (classItem, mode = "single") => {
    const meta = parseClassMeta(classItem);
    setStudentForm({
      firstName: "",
      lastName: "",
      username: "",
      password: generatePassword(),
    });
    setBulkCsv(null);
    setBulkStatus(null);
    setStudentModal({ classItem: classItem, meta, mode });
  };

  const handleStudentFormChange = (field, value) => {
    setStudentForm((prev) => {
      const next = { ...prev, [field]: value };
      if ((field === "firstName" || field === "lastName") && !prev.username) {
        const first = (field === "firstName" ? value : prev.firstName).trim();
        const last = (field === "lastName" ? value : prev.lastName).trim();
        if (first && last) {
          next.username = `${first[0] ?? ""}${last}`.toLowerCase().replace(/[^a-z0-9]/g, "");
        }
      }
      return next;
    });
  };

  const submitStudent = async (event) => {
    event.preventDefault();
    if (!token || !studentModal) return;

    const meta = studentModal.meta;
    const classId = studentModal.classItem.id;
    const firstName = studentForm.firstName.trim();
    const lastName = studentForm.lastName.trim();
    const username = studentForm.username.trim();
    const password = studentForm.password || generatePassword();

    if (!firstName || !lastName) {
      setStatus({ tone: "error", message: "First name and surname are required." });
      return;
    }

    if (!username) {
      setStatus({ tone: "error", message: "Username is required." });
      return;
    }

    try {
      setStatus({ tone: "info", message: "Adding student…" });
      const created = await createStudent(token, {
        classId,
        firstName,
        lastName,
        username,
        password,
        yearGroup: meta.yearGroupLabel,
        programme: meta.programme,
      });
      updatePasswordLookup((prev) => rememberPasswords(prev, [{ id: created.id, username: created.username, password }]));
      setVisiblePasswords((prev) => ({ ...prev, [created.id]: true }));
      setStudentModal(null);
      await loadDashboard();
      setStatus({ tone: "success", message: `${firstName} ${lastName} added to ${studentModal.classItem.className}.` });
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Unable to add student." });
    }
  };

  const submitBulkStudents = async (event) => {
    event.preventDefault();
    if (!token || !studentModal || !bulkCsv) {
      setBulkStatus({ tone: "error", message: "Attach a CSV file to import." });
      return;
    }
    try {
      setBulkStatus({ tone: "info", message: "Parsing CSV…" });
      const text = typeof bulkCsv === "string" ? bulkCsv : await bulkCsv.text();
      const parsed = parseCsvStudents(text);
      if (parsed.length === 0) {
        throw new Error("The CSV file did not contain any students.");
      }
      const meta = studentModal.meta;
      const prepared = parsed.map((row) => {
        const firstName = row.firstName.trim();
        const lastName = row.lastName.trim();
        const username = row.username.trim() || `${firstName[0] ?? ""}${lastName}`.toLowerCase();
        const password = generatePassword();
        return {
          firstName,
          lastName,
          username,
          password,
          passwordPlain: password,
          programme: meta.programme,
          yearGroup: meta.yearGroupLabel,
        };
      });

      setBulkStatus({ tone: "info", message: "Uploading students…" });
      const sanitizedStudents = prepared.map((student) => {
        const copy = { ...student };
        delete copy.passwordPlain;
        return copy;
      });

      const created = await bulkCreateStudents(token, {
        classId: studentModal.classItem.id,
        students: sanitizedStudents,
      });

      const passwordEntries = created
        .map((student, index) => ({
          id: student.id,
          username: student.username,
          password: prepared[index]?.passwordPlain ?? "",
        }))
        .filter((entry) => entry.password);
      if (passwordEntries.length > 0) {
        updatePasswordLookup((prev) => rememberPasswords(prev, passwordEntries));
      }
      setVisiblePasswords((prev) => ({ ...prev, ...Object.fromEntries(created.map((student) => [student.id, true])) }));

      setBulkStatus({ tone: "success", message: `${created.length} students imported.` });
      setBulkCsv(null);
      setStudentModal(null);
      await loadDashboard();
    } catch (error) {
      setBulkStatus({ tone: "error", message: error.message || "Unable to import CSV." });
    }
  };

  const togglePassword = (studentId) => {
    setVisiblePasswords((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleArchive = async (studentId) => {
    if (!token || !studentId) return;
    const confirmArchive = window.confirm("Archive this student? They can be restored later by an administrator.");
    if (!confirmArchive) return;
    try {
      await archiveStudent(token, { studentId });
      setStatus({ tone: "success", message: "Student archived." });
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Unable to archive student." });
    }
  };

  if (!ready) {
    return null;
  }

  if (!isTeacher) {
    return null;
  }

  return (
    <div className="page-shell page-shell--fluid teacher-page">
      <section className="page-hero teacher-hero">
        <div className="page-hero__content">
          <span className="page-hero__eyebrow">Teacher dashboard</span>
          <h1 className="page-hero__title">Good day, {teacherName}</h1>
          <p className="muted">
            Manage classes, enrol students, and monitor lesson unlocks. Everything updates in real time as your classes
            progress through the IB Computer Science curriculum.
          </p>
        </div>
        <div className="page-hero__actions">
          <button type="button" className="pill pill--action" onClick={openClassModal}>
            Add class
          </button>
          {classes.length > 0 && (
            <button
              type="button"
              className="pill"
              onClick={() => openStudentModal(classes[0], "single")}
            >
              Add student
            </button>
          )}
        </div>
      </section>

      <section className="teacher-summary">
        {summaryCards.map((card) => (
          <article key={card.label}>
            <span className="teacher-summary__value">{card.value}</span>
            <span className="teacher-summary__label">{card.label}</span>
          </article>
        ))}
      </section>

      {status && <p className={`status-banner status-banner--${status.tone}`}>{status.message}</p>}

      <section className="teacher-class-list">
        {classes.length === 0 && !loading && (
          <div className="teacher-empty">
            <p>No classes yet. Start by adding a class so you can enrol students.</p>
          </div>
        )}

        {classes.map((clazz) => {
          const classMeta = parseClassMeta(clazz);
          const students = studentsByClass.get(clazz.id) ?? [];
          const isOpen = expandedClassId === clazz.id;
          return (
            <article key={clazz.id} className={`teacher-class ${isOpen ? "is-open" : ""}`}>
              <header
                className="teacher-class__header"
                onClick={() => setExpandedClassId(isOpen ? null : clazz.id)}
              >
                <div>
                  <h2>{clazz.className}</h2>
                  <p className="muted">{classMeta.yearGroupLabel}</p>
                </div>
                <div className="teacher-class__meta">
                  <span>{students.length} students</span>
                  <span>{classMeta.cohort}</span>
                </div>
              </header>

              {isOpen && (
                <div className="teacher-class__body">
                  <div className="teacher-class__toolbar">
                    <button type="button" className="pill" onClick={() => openStudentModal(clazz, "single")}>
                      Add student
                    </button>
                    <button type="button" className="pill" onClick={() => openStudentModal(clazz, "bulk")}>
                      Import CSV
                    </button>
                  </div>

                  <table className="teacher-class__table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Track</th>
                        <th>Stage</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const storedPassword = resolveStoredPassword(passwordLookup, student) ?? student.password ?? "";
                        const isHash = typeof storedPassword === "string" && storedPassword.startsWith("$2b$");
                        const plainPassword = isHash ? "" : storedPassword;
                        const isVisible = visiblePasswords[student.id];
                        return (
                          <tr key={student.id}>
                            <td>
                              <span className="teacher-student-name">{student.displayName}</span>
                              <span className="teacher-student-sub">Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                            </td>
                            <td>{student.username || "—"}</td>
                            <td>
                              {plainPassword ? (
                                <button
                                  type="button"
                                  className="teacher-password"
                                  onClick={() => togglePassword(student.id)}
                                >
                                  {isVisible ? plainPassword : "••••••"}
                                </button>
                              ) : (
                                <span className="muted">Not available</span>
                              )}
                            </td>
                            <td>{student.curriculumTrack ? student.curriculumTrack.toUpperCase() : "—"}</td>
                            <td>{student.activeStage ? student.activeStage.toUpperCase() : "—"}</td>
                            <td className="teacher-table-actions">
                              <button
                                type="button"
                                className="button-outline button-outline--danger"
                                onClick={() => handleArchive(student.id)}
                              >
                                Archive
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={6} className="muted">
                            No students yet. Use “Add student” to enrol the first learner.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="teacher-progress">
        <article>
          <h3>Lesson progress snapshot</h3>
          <div className="teacher-progress__cards">
            <div>
              <span className="teacher-summary__value">{summativeComplete}</span>
              <span className="teacher-summary__label">Summative complete</span>
            </div>
            <div>
              <span className="teacher-summary__value">{formativeComplete}</span>
              <span className="teacher-summary__label">Formative complete</span>
            </div>
            <div>
              <span className="teacher-summary__value">{availableLessons}</span>
              <span className="teacher-summary__label">Available lessons</span>
            </div>
            <div>
              <span className="teacher-summary__value">{lockedLessons}</span>
              <span className="teacher-summary__label">Locked lessons</span>
            </div>
          </div>
        </article>
      </section>

      {classModalOpen && (
        <div className="teacher-modal" role="dialog" aria-modal="true">
          <div className="teacher-modal__dialog">
            <header>
              <h2>Create class</h2>
              <button type="button" aria-label="Close" onClick={() => setClassModalOpen(false)}>
                ×
              </button>
            </header>
            <form onSubmit={submitClass} className="teacher-modal__content">
              <label>
                <span>Stage</span>
                <select
                  value={classForm.stageId}
                  onChange={(event) => handleClassStageChange("stageId", event.target.value)}
                  required
                >
                  {STAGE_CONFIG.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Cohort (two digits)</span>
                <input
                  value={classForm.cohort}
                  onChange={(event) => handleClassStageChange("cohort", event.target.value)}
                  placeholder="32"
                  required
                />
              </label>
              <label>
                <span>Group</span>
                <select
                  value={classForm.group}
                  onChange={(event) => handleClassStageChange("group", event.target.value)}
                  required
                >
                  {getStageConfig(classForm.stageId).groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Description (optional)</span>
                <input
                  value={classForm.description}
                  onChange={(event) => setClassForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Notes for this class"
                />
              </label>
              <div className="teacher-modal__preview">
                <span>Generated code</span>
                <strong>{generateClassCode(classForm.stageId, classForm.cohort, classForm.group)}</strong>
              </div>
              <footer>
                <button type="button" onClick={() => setClassModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="pill pill--action">
                  Create class
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {studentModal && (
        <div className="teacher-modal" role="dialog" aria-modal="true">
          <div className="teacher-modal__dialog">
            <header>
              <h2>
                {studentModal.mode === "bulk"
                  ? `Import students · ${studentModal.classItem.className}`
                  : `Add student · ${studentModal.classItem.className}`}
              </h2>
              <button type="button" aria-label="Close" onClick={() => setStudentModal(null)}>
                ×
              </button>
            </header>

            {studentModal.mode === "single" ? (
              <form onSubmit={submitStudent} className="teacher-modal__content">
                <label>
                  <span>First name</span>
                  <input
                    value={studentForm.firstName}
                    onChange={(event) => handleStudentFormChange("firstName", event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Surname</span>
                  <input
                    value={studentForm.lastName}
                    onChange={(event) => handleStudentFormChange("lastName", event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Username</span>
                  <input
                    value={studentForm.username}
                    onChange={(event) => handleStudentFormChange("username", event.target.value)}
                    placeholder="Enter unique username"
                    required
                  />
                </label>
                <label>
                  <span>Generated password</span>
                  <input
                    value={studentForm.password}
                    onChange={(event) => handleStudentFormChange("password", event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="teacher-modal__ghost"
                    onClick={() => setStudentForm((prev) => ({ ...prev, password: generatePassword() }))}
                  >
                    Regenerate
                  </button>
                </label>
                <footer>
                  <button type="button" onClick={() => setStudentModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="pill pill--action">
                    Add student
                  </button>
                </footer>
              </form>
            ) : (
              <form onSubmit={submitBulkStudents} className="teacher-modal__content">
                <p className="muted">
                  Upload a CSV with the columns <code>firstName</code>, <code>lastName</code>, and optional
                  <code>username</code>. Passwords are auto-generated for each row.
                </p>
                <button type="button" className="teacher-modal__ghost" onClick={downloadTemplate}>
                  Download blank template
                </button>
                <label>
                  <span>CSV file</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(event) => setBulkCsv(event.target.files?.[0] ?? null)}
                    required
                  />
                </label>
                {bulkStatus && <p className={`status status--${bulkStatus.tone}`}>{bulkStatus.message}</p>}
                <footer>
                  <button type="button" onClick={() => setStudentModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="pill pill--action">
                    Import students
                  </button>
                </footer>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboardPage;
