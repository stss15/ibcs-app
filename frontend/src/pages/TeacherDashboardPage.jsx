import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  archiveStudent,
  bulkCreateStudents,
  createClass,
  createStudent,
  exportClassProgress,
  getTeacherDashboard,
  unlockClassStage,
  unlockStudentStage,
} from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import "./TeacherDashboardPage.css";

const STAGE_PRESETS = [
  "middle-years-lesson-1",
  "middle-years-lesson-2",
  "middle-years-lesson-3",
  "igcse-lesson-1",
  "igcse-lesson-2",
  "igcse-lesson-3",
  "ib-lesson-1",
  "ib-lesson-2",
  "ib-lesson-3",
];

const PROGRAMMES = [
  { value: "ks3", label: "Key Stage 3" },
  { value: "igcse", label: "IGCSE" },
  { value: "ib-sl", label: "IB Computer Science SL" },
  { value: "ib-hl", label: "IB Computer Science HL" },
];

const REQUIRED_STUDENT_FIELDS = ["programme", "firstName", "lastName", "password"];

function normalizeProgramme(programme, yearGroup) {
  const value = String(programme || "").trim().toLowerCase();
  if (PROGRAMMES.some((option) => option.value === value)) {
    return value;
  }
  const numeric = Number(String(yearGroup || "").replace(/\D/g, ""));
  if (Number.isFinite(numeric)) {
    if (numeric >= 12) return "ib-hl";
    if (numeric >= 10) return "igcse";
    return "ks3";
  }
  return "igcse";
}

function formatLabel(value) {
  if (!value) return "";
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function splitCsvRow(row) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function canonicaliseHeader(value) {
  return value.replace(/[\s_-]+/g, "").toLowerCase();
}

function parseCsvStudents(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headerCells = splitCsvRow(lines[0]);
  const headerMap = new Map();

  headerCells.forEach((header, index) => {
    const canonical = canonicaliseHeader(header);
    if (canonical === "username") headerMap.set("username", index);
    if (canonical === "firstname") headerMap.set("firstName", index);
    if (canonical === "lastname") headerMap.set("lastName", index);
    if (canonical === "yeargroup") headerMap.set("yearGroup", index);
    if (canonical === "programme" || canonical === "program") headerMap.set("programme", index);
    if (canonical === "password") headerMap.set("password", index);
  });

  const missing = REQUIRED_STUDENT_FIELDS.filter((field) => !headerMap.has(field));
  if (missing.length > 0) {
    throw new Error(`CSV is missing required columns: ${missing.join(", ")}`);
  }

  const students = [];
  for (let i = 1; i < lines.length; i += 1) {
    const row = splitCsvRow(lines[i]);
    if (row.every((cell) => cell === "")) continue;
    const student = {
      username: headerMap.has("username") ? row[headerMap.get("username")] : "",
      firstName: row[headerMap.get("firstName")] ?? "",
      lastName: row[headerMap.get("lastName")] ?? "",
      yearGroup: row[headerMap.get("yearGroup")] ?? "",
      programme: row[headerMap.get("programme")] ?? "",
      password: row[headerMap.get("password")] ?? "",
    };

    const missingField = REQUIRED_STUDENT_FIELDS.find((field) => !student[field]?.trim());
    if (missingField) {
      throw new Error(`Row ${i + 1} is missing ${missingField}.`);
    }

    student.programme = normalizeProgramme(student.programme, student.yearGroup);
    students.push(student);
  }

  return students;
}

function TeacherDashboardPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [bulkStatus, setBulkStatus] = useState(null);
  const [unlockStatus, setUnlockStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);

  const token = session?.token ?? null;
  const isTeacher = session?.user?.role === "teacher";
  const teacherName =
    dashboard?.teacher?.displayName ?? session?.user?.displayName ?? session?.user?.username ?? "Teacher";

  useEffect(() => {
    if (!ready) return;
    if (!isTeacher) {
      navigate("/", { replace: true });
    }
  }, [ready, isTeacher, navigate]);

  const loadDashboard = useCallback(async () => {
    if (!token || !isTeacher) return;
    setLoading(true);
    try {
      const data = await getTeacherDashboard(token);
      setDashboard(data);
      setStatus(null);
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to load dashboard." });
    } finally {
      setLoading(false);
    }
  }, [isTeacher, token]);

  useEffect(() => {
    if (!ready || !isTeacher) return;
    loadDashboard();
  }, [ready, isTeacher, loadDashboard]);

  const classOptions = useMemo(() => dashboard?.classes ?? [], [dashboard?.classes]);
  const studentOptions = useMemo(() => dashboard?.students ?? [], [dashboard?.students]);
  const archivedStudents = useMemo(() => dashboard?.archivedStudents ?? [], [dashboard?.archivedStudents]);
  const summaryMetrics = useMemo(
    () => [
      { label: "Active classes", value: classOptions.length },
      { label: "Active students", value: studentOptions.length },
      { label: "Archived students", value: archivedStudents.length },
    ],
    [archivedStudents.length, classOptions.length, studentOptions.length],
  );
  const recentUnlocks = useMemo(() => {
    const classItems =
      (dashboard?.classUnlocks ?? []).map((entry) => ({
        id: entry.id,
        label: formatLabel(entry.stageKey),
        detail: `Class ${entry.classId}`,
        when: entry.unlockedAt,
      })) ?? [];
    const studentItems =
      (dashboard?.studentUnlocks ?? []).map((entry) => ({
        id: entry.id,
        label: formatLabel(entry.stageKey),
        detail: entry.scope === "lesson" ? `Lesson unlock · ${entry.studentId}` : `Stage unlock · ${entry.studentId}`,
        when: entry.unlockedAt,
      })) ?? [];
    return [...classItems, ...studentItems]
      .filter((item) => item.when)
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, 6);
  }, [dashboard?.classUnlocks, dashboard?.studentUnlocks]);

  const handleCreateClass = async (event) => {
    event.preventDefault();
    if (!token) return;

    const form = event.currentTarget;
    const className = form.className.value.trim();
    const description = form.description.value.trim();
    const yearGroup = form.yearGroup.value.trim();

    if (!className) {
      setStatus({ tone: "error", message: "Class name is required." });
      return;
    }

    try {
      setStatus({ tone: "info", message: "Creating class…" });
      await createClass(token, {
        className,
        description: description || undefined,
        yearGroup: yearGroup || undefined,
      });
      form.reset();
      setStatus({ tone: "success", message: `Class "${className}" created.` });
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to create class." });
    }
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();
    if (!token) return;

    const form = event.currentTarget;
    const classId = form.classId.value;
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const username = form.username.value.trim();
    const password = form.password.value;
    const yearGroup = form.yearGroup.value.trim();
    const programme = form.programme.value;

    if (!classId) {
      setStatus({ tone: "error", message: "Select a class." });
      return;
    }
    if (!programme) {
      setStatus({ tone: "error", message: "Choose a programme." });
      return;
    }

    try {
      setStatus({ tone: "info", message: "Adding student…" });
      await createStudent(token, {
        classId,
        firstName,
        lastName,
        username: username || undefined,
        password,
        yearGroup: yearGroup || undefined,
        programme,
      });
      form.reset();
      setStatus({ tone: "success", message: "Student added." });
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to add student." });
    }
  };

  const handleBulkSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;

    const form = event.currentTarget;
    const classId = form.bulkClassId.value;
    if (!classId) {
      setBulkStatus({ tone: "error", message: "Choose a class for the import." });
      return;
    }
    if (!bulkFile) {
      setBulkStatus({ tone: "error", message: "Attach a CSV file first." });
      return;
    }

    try {
      setBulkStatus({ tone: "info", message: "Parsing CSV…" });
      const text = await bulkFile.text();
      const students = parseCsvStudents(text);
      if (students.length === 0) {
        throw new Error("CSV did not contain any students.");
      }
      setBulkStatus({ tone: "info", message: `Uploading ${students.length} students…` });
      await bulkCreateStudents(token, { classId, students });
      setBulkFile(null);
      form.reset();
      setBulkStatus({ tone: "success", message: `Added ${students.length} students.` });
      await loadDashboard();
    } catch (error) {
      setBulkStatus({ tone: "error", message: error.message || "Failed to process CSV." });
    }
  };

  const handleClassUnlock = async (event) => {
    event.preventDefault();
    if (!token) return;

    const form = event.currentTarget;
    const classId = form.unlockClassId.value;
    const stageKey = form.stageKey.value.trim();

    if (!classId || !stageKey) {
      setUnlockStatus({ tone: "error", message: "Select a class and enter a stage to unlock." });
      return;
    }

    try {
      setUnlockStatus({ tone: "info", message: "Recording unlock…" });
      await unlockClassStage(token, { classId, stageKey });
      form.reset();
      setUnlockStatus({ tone: "success", message: `Stage "${stageKey}" unlocked for the class.` });
      await loadDashboard();
    } catch (error) {
      setUnlockStatus({ tone: "error", message: error.message || "Failed to unlock stage." });
    }
  };

  const handleStudentUnlock = async (event) => {
    event.preventDefault();
    if (!token) return;

    const form = event.currentTarget;
    const studentId = form.unlockStudentId.value;
    const stageKey = form.studentStageKey.value.trim();
    const scope = form.scope.value;
    const targetId = form.targetId.value.trim();

    if (!studentId || !stageKey) {
      setUnlockStatus({ tone: "error", message: "Choose a student and enter a stage to unlock." });
      return;
    }

    try {
      setUnlockStatus({ tone: "info", message: "Unlocking for student…" });
      await unlockStudentStage(token, {
        studentId,
        stageKey,
        scope,
        targetId: targetId || undefined,
      });
      form.reset();
      setUnlockStatus({ tone: "success", message: `Stage "${stageKey}" unlocked for the student.` });
      await loadDashboard();
    } catch (error) {
      setUnlockStatus({ tone: "error", message: error.message || "Failed to unlock for student." });
    }
  };

  const handleArchiveStudent = async (studentId) => {
    if (!token || !studentId) return;
    const confirmArchive = window.confirm("Archive this student? They can be restored later by an administrator.");
    if (!confirmArchive) return;
    try {
      await archiveStudent(token, { studentId });
      setStatus({ tone: "success", message: "Student archived." });
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to archive student." });
    }
  };

  const handleExportClass = async (classId) => {
    if (!token || !classId) return;
    try {
      setExportStatus({ tone: "info", message: "Preparing CSV…" });
      const payload = await exportClassProgress(token, classId);
      if (!payload?.csv) {
        throw new Error("Export returned no data.");
      }
      const blob = new Blob([payload.csv], { type: payload.mimeType || "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = payload.filename || `class-${classId}-progress.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportStatus({ tone: "success", message: "CSV downloaded." });
    } catch (error) {
      setExportStatus({ tone: "error", message: error.message || "Unable to export class data." });
    }
  };

  if (!ready) {
    return (
      <div className="page-shell">
        <div className="dashboard-grid">
          <section className="card">
            <p className="muted">Preparing dashboard…</p>
          </section>
        </div>
      </div>
    );
  }

  if (!isTeacher) {
    return null;
  }

  return (
    <div className="page-shell">
      <div className="dashboard-grid">
      <section className="card card--wide card--summary">
        <header className="card-header">
          <div>
            <h2>Welcome back, {teacherName}</h2>
            <p className="muted">Snapshot of your classes, unlocks, and student progress at a glance.</p>
          </div>
          <div className="card-actions">
            <Link to="/curriculum" className="button-outline">
              Curriculum map
            </Link>
          </div>
        </header>
        {loading && <p className="muted">Refreshing dashboard…</p>}
        <div className="summary-grid">
          {summaryMetrics.map((metric) => (
            <article key={metric.label}>
              <span className="summary-value">{metric.value}</span>
              <span className="summary-label">{metric.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card card--wide">
        <header className="card-header">
          <div>
            <h3>Build classes and enrol students</h3>
            <p className="muted">Capture class context and roster quickly with direct or CSV import.</p>
          </div>
        </header>
        {status && <p className={`status status--${status.tone}`}>{status.message}</p>}
        <div className="card-columns">
          <article>
            <h4>Create class</h4>
            <form onSubmit={handleCreateClass}>
              <label>
                <span>Class name</span>
                <input name="className" required placeholder="e.g. HL Year 1" />
              </label>
              <label>
                <span>Description</span>
                <input name="description" placeholder="Optional" />
              </label>
              <label>
                <span>Year group</span>
                <input name="yearGroup" placeholder="e.g. 12" />
              </label>
              <button type="submit" className="dashboard-submit">
                Create
              </button>
            </form>
          </article>

          <article>
            <h4>Add student</h4>
            <form onSubmit={handleAddStudent}>
              <label>
                <span>Class</span>
                <select name="classId" required defaultValue="">
                  <option value="" disabled>
                    Select class
                  </option>
                  {classOptions.map((clazz) => (
                    <option key={clazz.id} value={clazz.id}>
                      {clazz.className}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Programme</span>
                <select name="programme" required defaultValue="">
                  <option value="" disabled>
                    Select programme
                  </option>
                  {PROGRAMMES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>First name</span>
                <input name="firstName" required placeholder="First name" />
              </label>
              <label>
                <span>Last name</span>
                <input name="lastName" required placeholder="Last name" />
              </label>
              <label>
                <span>Username (optional)</span>
                <input name="username" placeholder="username" />
              </label>
              <label>
                <span>Year group (optional)</span>
                <input name="yearGroup" placeholder="e.g. 10" />
              </label>
              <label>
                <span>Password</span>
                <input name="password" type="password" required placeholder="Temporary password" />
              </label>
              <button type="submit" className="dashboard-submit">
                Add student
              </button>
            </form>
          </article>

          <article>
            <h4>Bulk import from CSV</h4>
            <form onSubmit={handleBulkSubmit}>
              <label>
                <span>Class</span>
                <select name="bulkClassId" required defaultValue="">
                  <option value="" disabled>
                    Select class
                  </option>
                  {classOptions.map((clazz) => (
                    <option key={clazz.id} value={clazz.id}>
                      {clazz.className}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>CSV file</span>
                <input
                  name="bulkCsv"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0] ?? null;
                    setBulkFile(file);
                  }}
                  required
                />
              </label>
              <p className="muted small">
                Columns required: programme, firstName, lastName, password. Optional: username, yearGroup. Programme
                values: {PROGRAMMES.map((option) => option.value).join(", ")}.
              </p>
              <button type="submit" className="dashboard-submit">
                Import CSV
              </button>
            </form>
            {bulkStatus && <p className={`status status--${bulkStatus.tone}`}>{bulkStatus.message}</p>}
          </article>
        </div>
      </section>

      <section className="card">
        <h3>Your classes</h3>
        {exportStatus && <p className={`status status--${exportStatus.tone}`}>{exportStatus.message}</p>}
        <div className="class-grid">
          {classOptions.length === 0 && <p className="muted">No classes yet. Create one above to get started.</p>}
          {classOptions.map((clazz) => {
            const studentCount = studentOptions.filter((student) => student.classId === clazz.id).length;
            const createdOn = clazz.createdAt ? new Date(clazz.createdAt).toLocaleDateString() : "—";
            return (
              <article key={clazz.id} className="class-card">
                <header>
                  <strong>{clazz.className}</strong>
                  {clazz.yearGroup && <span className="badge">Year {clazz.yearGroup}</span>}
                </header>
                {clazz.description && <p className="muted">{clazz.description}</p>}
                <ul>
                  <li>
                    <span className="muted">Class ID</span>
                    <span>{clazz.id}</span>
                  </li>
                  <li>
                    <span className="muted">Students</span>
                    <span>{studentCount}</span>
                  </li>
                  <li>
                    <span className="muted">Created</span>
                    <span>{createdOn}</span>
                  </li>
                </ul>
                <div className="class-card__actions">
                  <button type="button" className="button-outline" onClick={() => handleExportClass(clazz.id)}>
                    Download CSV
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h3>Unlock curriculum</h3>
        <datalist id="stage-presets">
          {STAGE_PRESETS.map((preset) => (
            <option key={preset} value={preset} />
          ))}
        </datalist>
        <div className="unlock-grid">
          <article>
            <h4>Whole class</h4>
            <form onSubmit={handleClassUnlock}>
              <label>
                <span>Class</span>
                <select name="unlockClassId" required defaultValue="">
                  <option value="" disabled>
                    Select class
                  </option>
                  {classOptions.map((clazz) => (
                    <option key={clazz.id} value={clazz.id}>
                      {clazz.className}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Stage key</span>
                <input name="stageKey" list="stage-presets" placeholder="e.g. igcse-lesson-1" required />
              </label>
              <button type="submit" className="dashboard-submit">
                Unlock class stage
              </button>
            </form>
          </article>
          <article>
            <h4>Individual student</h4>
            <form onSubmit={handleStudentUnlock}>
              <label>
                <span>Student</span>
                <select name="unlockStudentId" required defaultValue="">
                  <option value="" disabled>
                    Select student
                  </option>
                  {studentOptions.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.displayName} · {student.classId}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Stage key</span>
                <input name="studentStageKey" list="stage-presets" placeholder="e.g. ib-lesson-2" required />
              </label>
              <label>
                <span>Scope</span>
                <select name="scope" defaultValue="stage">
                  <option value="stage">Stage</option>
                  <option value="lesson">Lesson</option>
                </select>
              </label>
              <label>
                <span>Target ID (optional)</span>
                <input name="targetId" placeholder="Use for specific lesson unlocks" />
              </label>
              <button type="submit" className="dashboard-submit">
                Unlock student stage
              </button>
            </form>
          </article>
        </div>
        {unlockStatus && <p className={`status status--${unlockStatus.tone}`}>{unlockStatus.message}</p>}
        <div className="timeline">
          <h4>Recent unlock activity</h4>
          <ul>
            {recentUnlocks.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong> · {item.detail} ·{" "}
                <span className="muted">{new Date(item.when).toLocaleString()}</span>
              </li>
            ))}
            {recentUnlocks.length === 0 && <li className="muted">No unlocks recorded yet.</li>}
          </ul>
        </div>
      </section>

      <section className="card">
        <h3>Active students</h3>
        <ul className="list">
          {studentOptions.length === 0 && <li className="muted">No students enrolled yet.</li>}
          {studentOptions.map((student) => (
            <li key={student.id}>
              <div className="student-header">
                <strong>{student.displayName}</strong>
                <span className="muted">{student.username || "No username"}</span>
              </div>
              <div className="student-meta">
                <span className="badge">{formatLabel(student.curriculumTrack) || "Track pending"}</span>
                <span className="muted">Year {student.yearGroup}</span>
                <span className="muted">Active stage: {formatLabel(student.activeStage)}</span>
              </div>
              <div className="student-meta">
                <span className="muted">Class ID: {student.classId}</span>
                <span className="muted">Enrolled: {new Date(student.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="student-actions">
                <button
                  type="button"
                  className="button-outline button-outline--danger"
                  onClick={() => handleArchiveStudent(student.id)}
                >
                  Archive student
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {archivedStudents.length > 0 && (
        <section className="card">
          <h3>Archived students</h3>
          <ul className="list">
            {archivedStudents.map((student) => (
              <li key={student.id}>
                <strong>{student.displayName}</strong>
                <span className="muted">Year {student.yearGroup}</span>
                <span className="muted">Archived: {new Date(student.archivedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h3>Progress snapshot</h3>
        <div className="progress-grid">
          <article>
            <span className="progress-value">{dashboard?.lessonSummary?.["summative-complete"] ?? 0}</span>
            <span className="muted">Summative complete</span>
          </article>
          <article>
            <span className="progress-value">{dashboard?.lessonSummary?.["formative-complete"] ?? 0}</span>
            <span className="muted">Formative complete</span>
          </article>
          <article>
            <span className="progress-value">{dashboard?.lessonSummary?.available ?? 0}</span>
            <span className="muted">Available</span>
          </article>
          <article>
            <span className="progress-value">{dashboard?.lessonSummary?.locked ?? 0}</span>
            <span className="muted">Locked</span>
          </article>
        </div>
      </section>
    </div>
  </div>
  );
}

export default TeacherDashboardPage;
