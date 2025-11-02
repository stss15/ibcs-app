import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStudentDashboard } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import "./StudentDashboardPage.css";

function formatLabel(value) {
  if (!value) return "";
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StudentDashboardPage() {
  const { session, clear, ready } = useSession();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [unlocks, setUnlocks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [status, setStatus] = useState(null);

  const studentSession = session?.user?.role === "student" ? session.user : null;
  const token = session?.token || null;
  const studentName = studentSession?.displayName ?? studentSession?.username ?? "Student";

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!studentSession) {
      navigate("/", { replace: true });
      return;
    }

    let active = true;
    setStatus({ tone: "info", message: "Loading your journey…" });

    (async () => {
      try {
        if (!token) {
          throw new Error("Session expired");
        }
        const payload = await getStudentDashboard(token);
        if (!active) return;
        setStudent(payload?.student || null);
        setClassInfo(payload?.class || null);
        setUnlocks(payload?.unlocks || []);
        setProgress(payload?.progress || []);
        setStatus(null);
      } catch (error) {
        if (!active) return;
        setStatus({ tone: "error", message: error.message || "Failed to load student" });
      }
    })();

    return () => {
      active = false;
    };
  }, [studentSession, navigate, token, ready]);

  const progressSummary = useMemo(() => {
    const totals = {
      locked: 0,
      available: 0,
      "formative-complete": 0,
      "summative-complete": 0,
    };
    for (const record of progress) {
      if (record?.status && totals[record.status] !== undefined) {
        totals[record.status] += 1;
      }
    }
    return totals;
  }, [progress]);

  if (!ready) {
    return (
      <div className="student-grid">
        <section className="card">
          <p className="muted">Checking session…</p>
        </section>
      </div>
    );
  }

  if (!studentSession) {
    return null;
  }

  return (
    <div className="student-grid">
      <section className="card">
        <header className="card-header">
          <div>
            <h2>Hi {studentName}</h2>
            <p>
              Track your progress through the Computer Science curriculum. Unlocks appear here as your teacher enables
              new lessons.
            </p>
          </div>
          <div className="card-actions">
            <Link to="/curriculum" className="button-outline">
              Curriculum map
            </Link>
            <button
              className="button-outline button-outline--danger"
              onClick={() => {
                clear();
                navigate("/", { replace: true });
              }}
            >
              Sign out
            </button>
          </div>
        </header>
        {status && <p className={`status status--${status.tone}`}>{status.message}</p>}
        {student && (
          <div className="student-summary">
            <div>
              <span className="muted">Learning track</span>
              <strong>{formatLabel(student.curriculumTrack) || "TBC"}</strong>
            </div>
            <div>
              <span className="muted">Active stage</span>
              <strong>{formatLabel(student.activeStage)}</strong>
            </div>
            <div>
              <span className="muted">Year group</span>
              <strong>{student.yearGroup}</strong>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Your class</h3>
        {classInfo ? (
          <div className="student-class">
            <div>
              <strong>{classInfo.className}</strong>
              {classInfo.description && <p className="muted">{classInfo.description}</p>}
            </div>
            <ul>
              <li>
                <span className="muted">Class ID</span>
                <span>{classInfo.id}</span>
              </li>
              <li>
                <span className="muted">Teacher</span>
                <span>{classInfo.teacherUsername ?? "Your teacher"}</span>
              </li>
              {classInfo.yearGroup && (
                <li>
                  <span className="muted">Year group</span>
                  <span>{classInfo.yearGroup}</span>
                </li>
              )}
            </ul>
          </div>
        ) : (
          <p className="muted">No class assigned yet. Check in with your teacher.</p>
        )}
      </section>

      <section className="card">
        <h3>Unlocked milestones</h3>
        <ul className="list">
          {unlocks.length === 0 && <li className="muted">No additional unlocks yet — complete your current lesson.</li>}
          {unlocks.map((unlock) => (
            <li key={unlock.id}>
              <strong>{formatLabel(unlock.stageKey)}</strong>
              <span className="muted">
                {unlock.scope === "lesson" ? "Lesson" : "Stage"} unlock · {new Date(unlock.unlockedAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Your progress</h3>
        <div className="student-progress-grid">
          <article>
            <span className="progress-big">{progressSummary["summative-complete"]}</span>
            <span className="muted">Summative complete</span>
          </article>
          <article>
            <span className="progress-big">{progressSummary["formative-complete"]}</span>
            <span className="muted">Formative complete</span>
          </article>
          <article>
            <span className="progress-big">{progressSummary.available}</span>
            <span className="muted">Available lessons</span>
          </article>
          <article>
            <span className="progress-big">{progressSummary.locked}</span>
            <span className="muted">Locked lessons</span>
          </article>
        </div>
        <div className="student-progress-list">
          <h4>Lesson details</h4>
          <ul>
            {progress.length === 0 && <li className="muted">Lesson tracking will appear here once you begin.</li>}
            {progress.map((record) => (
              <li key={record.id}>
                <div>
                  <strong>{formatLabel(record.lessonSlug)}</strong>
                  <span className="badge">{formatLabel(record.status)}</span>
                </div>
                <div className="muted">
                  Updated {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "recently"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default StudentDashboardPage;
