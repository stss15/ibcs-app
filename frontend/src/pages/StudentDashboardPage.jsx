import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStudentDashboard } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import { useCurriculumManifest } from "../hooks/useCurriculumManifest.js";
import "./StudentDashboardPage.css";

function normaliseStatus(status) {
  if (!status) return "locked";
  return status.toLowerCase();
}

function isLessonComplete(status) {
  const value = normaliseStatus(status);
  return value === "formative-complete" || value === "summative-complete";
}

function progressLabel(status) {
  switch (normaliseStatus(status)) {
    case "summative-complete":
      return "Summative complete";
    case "formative-complete":
      return "Formative complete";
    case "available":
      return "Ready to start";
    default:
      return "Locked";
  }
}

function StudentDashboardPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const token = session?.token ?? null;
  const studentSession = session?.user?.role === "student" ? session.user : null;

  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState(null);

  const { manifest } = useCurriculumManifest();

  useEffect(() => {
    if (!ready) return;
    if (!studentSession) {
      navigate("/", { replace: true });
      return;
    }

    let active = true;
    setStatus({ tone: "info", message: "Loading your dashboard…" });

    (async () => {
      try {
        if (!token) throw new Error("Session expired");
        const response = await getStudentDashboard(token);
        if (!active) return;
        setPayload(response);
        setStatus(null);
      } catch (error) {
        if (!active) return;
        setStatus({ tone: "error", message: error.message || "Unable to load dashboard" });
      }
    })();

    return () => {
      active = false;
    };
  }, [ready, studentSession, token, navigate]);

  const student = payload?.student ?? null;
  const classInfo = payload?.class ?? null;
  const progress = payload?.progress ?? [];

  const lessonStatusMap = useMemo(() => {
    const map = new Map();
    for (const record of progress) {
      map.set(record.lessonSlug, normaliseStatus(record.status));
    }
    return map;
  }, [progress]);

  const track = student?.curriculumTrack ?? studentSession?.curriculumTrack ?? "ib-sl";

  const unitSummaries = useMemo(() => {
    if (!manifest) return [];
    const units = manifest.units ?? [];
    return units
      .filter((unit) => !unit.availableFor || unit.availableFor.includes(track))
      .map((unit) => {
        const chapters = unit.subtopics ?? [];
        const lessons = [];
        chapters.forEach((chapter) => {
          (chapter.lessons ?? [])
            .filter((lesson) => !lesson.availableFor || lesson.availableFor.includes(track))
            .forEach((lesson) => {
              lessons.push({
                id: lesson.id,
                title: lesson.title,
                status: lessonStatusMap.get(lesson.id) ?? "locked",
              });
            });
        });
        const total = lessons.length || 1;
        const completed = lessons.filter((lesson) => isLessonComplete(lesson.status)).length;
        const unlocked = lessons.filter((lesson) => lesson.status !== "locked").length;
        const percentage = Math.round((completed / total) * 100);
        return {
          id: unit.id,
          title: unit.title,
          description: unit.summary,
          completed,
          unlocked,
          total,
          percentage,
          firstChapter: chapters[0]?.id ?? null,
        };
      });
  }, [manifest, lessonStatusMap, track]);

  const totalLessons = unitSummaries.reduce((sum, unit) => sum + unit.total, 0);
  const totalCompleted = unitSummaries.reduce((sum, unit) => sum + unit.completed, 0);
  const overallPercentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  if (!ready) {
    return null;
  }

  if (!studentSession) {
    return null;
  }

  return (
    <div className="page-shell page-shell--fluid student-page">
      <section className="page-hero student-hero">
        <div className="page-hero__content">
          <span className="page-hero__eyebrow">Student dashboard</span>
          <h1 className="page-hero__title">Hi {studentSession.displayName ?? studentSession.username}</h1>
          <p className="muted">
            Your progress through the IB Computer Science pathway lives here. Lessons unlock as your teacher enables
            them—use this page to see what to tackle next.
          </p>
        </div>
        <div className="student-overview">
          <div>
            <span className="student-overview__label">Track</span>
            <strong>{track.toUpperCase()}</strong>
          </div>
          <div>
            <span className="student-overview__label">Active stage</span>
            <strong>{student?.activeStage ?? "Pending"}</strong>
          </div>
          <div>
            <span className="student-overview__label">Overall progress</span>
            <strong>{overallPercentage}%</strong>
          </div>
        </div>
      </section>

      {status && <p className={`status-banner status-banner--${status.tone}`}>{status.message}</p>}

      <section className="student-class-card">
        <header>
          <h2>Your class</h2>
          <Link to="/curriculum/ib" className="pill">
            View curriculum map
          </Link>
        </header>
        {classInfo ? (
          <div className="student-class-card__body">
            <div>
              <strong>{classInfo.className}</strong>
              {classInfo.description && <p className="muted">{classInfo.description}</p>}
            </div>
            <div className="student-class-card__meta">
              <span>Teacher · {classInfo.teacherUsername ?? "Assigned"}</span>
              {classInfo.yearGroup && <span>Year group · {classInfo.yearGroup}</span>}
              <span>Class code · {classInfo.id}</span>
            </div>
          </div>
        ) : (
          <p className="muted">Your teacher will place you into a class soon.</p>
        )}
      </section>

      <section className="student-units">
        <header>
          <div>
            <h2>IB Computer Science units</h2>
            <p className="muted">Work through each unit in turn. Completed lessons fill the bar for that topic.</p>
          </div>
          <span className="student-unit-progress">{totalCompleted} of {totalLessons} lessons complete</span>
        </header>
        <div className="student-unit-grid">
          {unitSummaries.map((unit) => (
            <article key={unit.id} className="student-unit-card">
              <header>
                <h3>{unit.title}</h3>
                <span>{unit.percentage}%</span>
              </header>
              {unit.description && <p className="muted">{unit.description}</p>}
              <div className="student-progress-bar" aria-label={`${unit.completed} of ${unit.total} lessons complete`}>
                <div style={{ width: `${Math.min(unit.percentage, 100)}%` }} />
              </div>
              <div className="student-unit-stats">
                <span>{unit.completed} complete</span>
                <span>{unit.unlocked} unlocked</span>
                <span>{unit.total} total</span>
              </div>
              <Link to={`/curriculum/ib`} state={{ focusUnit: unit.id, focusChapter: unit.firstChapter }}>
                Continue unit
              </Link>
            </article>
          ))}
          {unitSummaries.length === 0 && (
            <p className="muted">Units will appear once your teacher shares the curriculum with your class.</p>
          )}
        </div>
      </section>

      <section className="student-lesson-feed">
        <header>
          <h2>Recent lesson updates</h2>
        </header>
        <ul>
          {progress.length === 0 && <li className="muted">No lessons tracked yet — start with your first unlocked topic.</li>}
          {progress.map((record) => (
            <li key={record.id}>
              <div>
                <strong>{record.lessonSlug}</strong>
                <span className={`student-tag student-tag--${normaliseStatus(record.status)}`}>
                  {progressLabel(record.status)}
                </span>
              </div>
              <span className="muted">
                Updated {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "recently"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default StudentDashboardPage;

