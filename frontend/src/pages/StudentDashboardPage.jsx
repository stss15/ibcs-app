import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStudentDashboard, getStudentGamification } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import { useCurriculumManifest } from "../hooks/useCurriculumManifest.js";
import { getYear7LessonById } from "../../../shared/year7Curriculum.js";
import { useGamification } from "../context/GamificationContext.jsx";
import { progressStorageKey, readUnitProgress } from "../lib/progressStorage.js";
import b1Unit from "../content/b1ComputationalThinking.jsx";
import b2Unit from "../content/b2ProgrammingFundamentals.jsx";
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

function buildAttemptRows(unit, insights) {
  if (!insights?.attempts) return [];
  const rows = [];
  const attempts = insights.attempts;
  unit.stages.forEach((stage) => {
    (stage.segments ?? []).forEach((segment) => {
      if (["activity", "micro-quiz", "python-playground"].includes(segment.type)) {
        const stats = attempts?.[segment.id];
        if (!stats) return;
        const count = stats.count ?? 0;
        const correct = stats.correct ?? 0;
        rows.push({
          stage: stage.title,
          segment: segment.heading ?? segment.title ?? segment.id,
          attempts: count,
          correct,
          successRate: count > 0 ? Math.round((correct / count) * 100) : null,
        });
      }
    });
  });
  rows.sort((a, b) => b.attempts - a.attempts);
  return rows;
}

function describeTrack(track) {
  const value = (track || "").toLowerCase();
  if (value.startsWith("ib")) {
    return "IB Computer Science";
  }
  if (value === "igcse") {
    return "IGCSE Computer Science";
  }
  if (value.startsWith("ks3")) {
    return "Key Stage 3 Computer Science";
  }
  return "Curriculum";
}

function createUnitSummaries(manifest, lessonStatusMap, track) {
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
              chapterTitle: chapter.title,
              status: lessonStatusMap.get(lesson.id) ?? "locked",
            });
          });
      });
      const total = lessons.length || 1;
      const completed = lessons.filter((lesson) => isLessonComplete(lesson.status)).length;
      const unlocked = lessons.filter((lesson) => lesson.status !== "locked").length;
      const inProgress = Math.max(unlocked - completed, 0);
      const locked = Math.max(total - unlocked, 0);
      const percentage = Math.round((completed / total) * 100);
      const nextLesson = lessons.find((lesson) => !isLessonComplete(lesson.status));
      return {
        id: unit.id,
        title: unit.title,
        description: unit.summary,
        completedCount: completed,
        unlockedCount: unlocked,
        inProgressCount: inProgress,
        lockedCount: locked,
        totalCount: total,
        percentage,
        lessons,
        nextLesson,
      };
    });
}

function createRecentUpdates(progress) {
  const sorted = [...progress].sort((a, b) => {
    const aTime = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });
  return sorted.slice(0, 6).map((record, index) => ({
    ...record,
    id: record.id ?? `${record.lessonSlug ?? "lesson"}-${index}`,
  }));
}

function StudentDashboardLayout({
  studentName,
  track,
  trackDisplayName,
  curriculumLink,
  curriculumCtaLabel,
  overallPercentage,
  totalCompleted,
  totalLessons,
  classInfo,
  activeStage,
  pointerLesson,
  pointerUpdatedAt,
  gamification,
  unitSummaries,
  interactiveAttemptSections,
  recentUpdates,
  status,
  isIBTrack,
}) {
  const [selectedUnitId, setSelectedUnitId] = useState(() => unitSummaries[0]?.id ?? null);
  const [activeInsightId, setActiveInsightId] = useState(() => interactiveAttemptSections[0]?.id ?? null);

  useEffect(() => {
    if (unitSummaries.length === 0) {
      setSelectedUnitId(null);
      return;
    }
    setSelectedUnitId((prev) => {
      if (prev && unitSummaries.some((unit) => unit.id === prev)) {
        return prev;
      }
      return unitSummaries[0].id;
    });
  }, [unitSummaries]);

  useEffect(() => {
    if (interactiveAttemptSections.length === 0) {
      setActiveInsightId(null);
      return;
    }
    setActiveInsightId((prev) => {
      if (prev && interactiveAttemptSections.some((section) => section.id === prev)) {
        return prev;
      }
      return interactiveAttemptSections[0].id;
    });
  }, [interactiveAttemptSections]);

  const selectedUnit = useMemo(() => {
    if (unitSummaries.length === 0) return null;
    return unitSummaries.find((unit) => unit.id === selectedUnitId) ?? unitSummaries[0];
  }, [unitSummaries, selectedUnitId]);

  const breakdown = useMemo(() => {
    if (!selectedUnit) return [];
    return [
      { id: "complete", label: "Complete", value: selectedUnit.completedCount },
      { id: "progress", label: "In progress", value: selectedUnit.inProgressCount },
      { id: "locked", label: "Locked", value: selectedUnit.lockedCount },
    ];
  }, [selectedUnit]);

  const breakdownTotal = breakdown.reduce((sum, item) => sum + item.value, 0);

  const activeInsight = useMemo(() => {
    if (interactiveAttemptSections.length === 0) return null;
    return interactiveAttemptSections.find((section) => section.id === activeInsightId) ?? interactiveAttemptSections[0];
  }, [interactiveAttemptSections, activeInsightId]);

  const focusSegments = useMemo(() => {
    if (!activeInsight?.rows?.length) return [];
    const sorted = [...activeInsight.rows].sort((a, b) => {
      const aRate = a.successRate ?? 0;
      const bRate = b.successRate ?? 0;
      return aRate - bRate;
    });
    return sorted.slice(0, 3);
  }, [activeInsight]);

  const nextLesson = selectedUnit?.nextLesson ?? null;
  const nextLessonIsUnlocked = nextLesson && nextLesson.status !== "locked";

  const gamificationLevel = typeof gamification?.level === "number" ? gamification.level : null;
  const gamificationXp = typeof gamification?.xp === "number" ? gamification.xp : null;
  const gamificationStreak = typeof gamification?.streak === "number" ? gamification.streak : null;
  const computedAccuracy = useMemo(() => {
    if (typeof gamification?.accuracy === "number") return gamification.accuracy;
    if (typeof gamification?.totalAttempts === "number" && gamification.totalAttempts > 0 && typeof gamification?.totalCorrect === "number") {
      return Math.round((gamification.totalCorrect / gamification.totalAttempts) * 100);
    }
    return null;
  }, [gamification?.accuracy, gamification?.totalAttempts, gamification?.totalCorrect]);

  return (
    <div className="page-shell page-shell--fluid student-dashboard">
      <section className="student-dashboard__hero">
        <div className="student-dashboard__hero-left">
          <span className="student-dashboard__eyebrow">Student dashboard</span>
          <h1>Hi {studentName}</h1>
          <p className="muted">
            Your progress through the {trackDisplayName} pathway lives here. Lessons unlock as your teacher enables
            them—use this page to see what to tackle next.
          </p>

          <div className="student-dashboard__meta-grid">
            <div className="student-dashboard__meta-card">
              <span>Track</span>
              <strong>{track.toUpperCase()}</strong>
            </div>
            <div className="student-dashboard__meta-card">
              <span>Active stage</span>
              <strong>{activeStage ?? "Pending"}</strong>
            </div>
            <div className="student-dashboard__meta-card">
              <span>Overall progress</span>
              <strong>{overallPercentage}%</strong>
            </div>
          </div>

          <div className="student-dashboard__class-card">
            <div>
              <span className="student-dashboard__class-eyebrow">Your class</span>
              <strong>{classInfo ? classInfo.className : "Awaiting placement"}</strong>
              <p className="muted">
                {classInfo
                  ? classInfo.description || classInfo.yearGroup || "Connected to your class"
                  : "Your teacher will place you into a class soon."}
              </p>
              {track.startsWith("ks3") && (
                <div className="student-dashboard__pointer">
                  <span>Teacher pointer</span>
                  <strong>
                    {pointerLesson
                      ? `${pointerLesson.unitTitle}: ${pointerLesson.title}`
                      : "Your teacher will set the next lesson in class"}
                  </strong>
                  {pointerUpdatedAt && <small>Updated {pointerUpdatedAt}</small>}
                </div>
              )}
            </div>
            {classInfo && (
              <div className="student-dashboard__class-meta">
                <span>Teacher · {classInfo.teacherUsername ?? "Assigned"}</span>
                {classInfo.yearGroup && <span>Year group · {classInfo.yearGroup}</span>}
                <span>Class code · {classInfo.id}</span>
              </div>
            )}
          </div>

          <div className="student-dashboard__hero-actions">
            <Link to={curriculumLink} className="pill">
              {curriculumCtaLabel}
            </Link>
          </div>
        </div>

        <div className="student-dashboard__summary">
          <CircularProgress
            value={overallPercentage}
            label="overall progress"
            caption={`${totalCompleted}/${totalLessons} lessons`}
          />
          <div className="student-dashboard__stat-grid">
            <div className="student-dashboard__stat-card">
              <span>Level</span>
              <strong>{gamificationLevel != null ? `Lv ${gamificationLevel}` : "—"}</strong>
            </div>
            <div className="student-dashboard__stat-card">
              <span>XP</span>
              <strong>{gamificationXp != null ? gamificationXp : "—"}</strong>
            </div>
            <div className="student-dashboard__stat-card">
              <span>Streak</span>
              <strong>{gamificationStreak != null ? gamificationStreak : "—"}</strong>
            </div>
            <div className="student-dashboard__stat-card">
              <span>Accuracy</span>
              <strong>{computedAccuracy != null ? `${computedAccuracy}%` : "—"}</strong>
            </div>
          </div>
        </div>
      </section>

      {status && <p className={`status-banner status-banner--${status.tone}`}>{status.message}</p>}

      <section className="student-dashboard__view">
        <div className="student-dashboard__unit-column">
          <header>
            <h2>{trackDisplayName} units</h2>
            <p className="muted">Select a unit to explore detailed progress.</p>
          </header>
          <div className="student-dashboard__unit-list">
            {unitSummaries.map((unit) => (
              <button
                key={unit.id}
                type="button"
                className={`student-dashboard__unit-button ${selectedUnit?.id === unit.id ? "is-active" : ""}`}
                onClick={() => setSelectedUnitId(unit.id)}
              >
                <div>
                  <strong>{unit.title}</strong>
                  {unit.description && <span>{unit.description}</span>}
                </div>
                <div className="student-dashboard__mini-summary">
                  <span>{unit.percentage}%</span>
                  <div className="student-dashboard__mini-bar">
                    <div style={{ width: `${Math.min(unit.percentage, 100)}%` }} />
                  </div>
                  <small>
                    {unit.completedCount} / {unit.totalCount} lessons
                  </small>
                </div>
              </button>
            ))}
            {unitSummaries.length === 0 && (
              <p className="student-dashboard__empty muted">
                Units will appear once your teacher shares the curriculum with your class.
              </p>
            )}
          </div>
        </div>

        <div className="student-dashboard__detail-panel">
          {selectedUnit ? (
            <>
              <header className="student-dashboard__unit-header">
                <div>
                  <span className="student-dashboard__eyebrow">Selected unit</span>
                  <h2>{selectedUnit.title}</h2>
                  {selectedUnit.description && <p className="muted">{selectedUnit.description}</p>}
                </div>
                <div className="student-dashboard__unit-score">
                  <strong>{selectedUnit.percentage}%</strong>
                  <span>complete</span>
                  <small>
                    {selectedUnit.completedCount} of {selectedUnit.totalCount} lessons
                  </small>
                </div>
              </header>

              <div className="student-dashboard__unit-breakdown">
                <div className="student-dashboard__stack-bar" role="presentation">
                  {breakdown
                    .filter((item) => item.value > 0 && breakdownTotal > 0)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`student-dashboard__stack-bar-segment student-dashboard__stack-bar-segment--${item.id}`}
                        style={{ width: `${(item.value / breakdownTotal) * 100}%` }}
                        aria-label={`${item.label}: ${item.value}`}
                      />
                    ))}
                </div>
                <div className="student-dashboard__unit-counters">
                  <span>{selectedUnit.completedCount} complete</span>
                  <span>{selectedUnit.inProgressCount} in progress</span>
                  <span>{selectedUnit.lockedCount} locked</span>
                </div>
              </div>

              <div className="student-dashboard__unit-actions">
                <Link
                  to={
                    isIBTrack
                      ? { pathname: "/curriculum/ib", state: { focusUnit: selectedUnit.id } }
                      : curriculumLink
                  }
                  className="pill"
                >
                  View unit map
                </Link>
                {nextLesson && (
                  nextLessonIsUnlocked ? (
                    <Link to={`/lesson/${nextLesson.id}`} className="pill pill--action">
                      Resume {nextLesson.title}
                    </Link>
                  ) : (
                    <span className="student-dashboard__hint">
                      Next lesson ({nextLesson.title}) unlocks soon.
                    </span>
                  )
                )}
              </div>

              <div className="student-dashboard__lesson-list">
                <div className="student-dashboard__list-header">
                  <h3>Lesson timeline</h3>
                  <span className="muted">
                    Ordered sequence · first {Math.min(selectedUnit.lessons.length, 6)} shown
                  </span>
                </div>
                <ul className="student-dashboard__lesson-items">
                  {selectedUnit.lessons.slice(0, 6).map((lesson) => (
                    <li key={lesson.id}>
                      <div>
                        <strong>{lesson.title}</strong>
                        {lesson.chapterTitle && <span className="muted">{lesson.chapterTitle}</span>}
                      </div>
                      <span className={`student-tag student-tag--${normaliseStatus(lesson.status)}`}>
                        {progressLabel(lesson.status)}
                      </span>
                    </li>
                  ))}
                  {selectedUnit.lessons.length === 0 && (
                    <li className="muted">Lessons will appear once unlocked.</li>
                  )}
                </ul>
              </div>

              <div className="student-dashboard__insights">
                <div className="student-dashboard__insight-panel">
                  <div className="student-dashboard__insight-header">
                    <h3>Checkpoint insights</h3>
                    <div className="student-dashboard__tabs" role="tablist">
                      {interactiveAttemptSections.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          role="tab"
                          aria-selected={activeInsight?.id === section.id}
                          className={`student-dashboard__tab ${activeInsight?.id === section.id ? "is-active" : ""}`}
                          onClick={() => setActiveInsightId(section.id)}
                        >
                          {section.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeInsight && activeInsight.rows.length > 0 ? (
                    <>
                      <div className="student-dashboard__focus">
                        <span className="muted">Segments to revisit</span>
                        <ul>
                          {focusSegments.map((row, index) => (
                            <li key={`${row.segment}-${index}`}>
                              <strong>{row.segment}</strong>
                              <span>{row.successRate != null ? `${row.successRate}%` : "—"} success</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="student-dashboard__insight-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th>Stage</th>
                              <th>Activity</th>
                              <th>Attempts</th>
                              <th>Correct</th>
                              <th>Success</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeInsight.rows.slice(0, 12).map((row, index) => (
                              <tr key={`${activeInsight.id}-${row.segment}-${index}`}>
                                <td>{row.stage}</td>
                                <td>{row.segment}</td>
                                <td>{row.attempts}</td>
                                <td>{row.correct}</td>
                                <td>{row.successRate != null ? `${row.successRate}%` : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <p className="student-dashboard__empty muted">
                      Complete interactive checkpoints to unlock insights.
                    </p>
                  )}
                </div>

                <div className="student-dashboard__timeline">
                  <div className="student-dashboard__list-header">
                    <h3>Recent updates</h3>
                    <span className="muted">Latest lessons · most recent first</span>
                  </div>
                  <ul>
                    {recentUpdates.length === 0 && (
                      <li className="muted">No lessons tracked yet — start with your first unlocked topic.</li>
                    )}
                    {recentUpdates.map((record) => (
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
                </div>
              </div>
            </>
          ) : (
            <div className="student-dashboard__empty-panel">
              <h2>No unit selected yet</h2>
              <p className="muted">Once your teacher unlocks lessons, you will see progress here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CircularProgress({ value, size = 148, strokeWidth = 12, label, caption }) {
  const numericValue = Number.isFinite(value) ? value : 0;
  const clamped = Math.max(0, Math.min(100, Math.round(numericValue)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg className="circular-progress__svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="circular-progress__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className="circular-progress__indicator"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <div className="circular-progress__label">
        <strong>{clamped}%</strong>
        {label && <span>{label}</span>}
        {caption && <small>{caption}</small>}
      </div>
    </div>
  );
}

function StudentDashboardPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const token = session?.token ?? null;
  const studentSession = session?.user?.role === "student" ? session.user : null;
  const { state: gamificationState, updateFromRemote } = useGamification();

  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState(null);
  const [b1Insights, setB1Insights] = useState(null);
  const [b2Insights, setB2Insights] = useState(null);

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
        const [dashboardResponse, gamificationResponse] = await Promise.all([
          getStudentDashboard(token),
          getStudentGamification(token).catch(() => null), // Don't fail if gamification doesn't exist yet
        ]);
        if (!active) return;
        setPayload(dashboardResponse);
        
        // Merge backend gamification data if available (from dedicated endpoint or dashboard)
        const backendGamification = gamificationResponse || dashboardResponse?.gamification;
        if (backendGamification) {
          const backendData = {
            xp: backendGamification.xp ?? 0,
            level: backendGamification.level ?? 1,
            streak: backendGamification.streak ?? 0,
            totalCorrect: backendGamification.totalCorrect ?? 0,
            totalAttempts: backendGamification.totalAttempts ?? 0,
            lastUpdated: backendGamification.lastUpdated ? new Date(backendGamification.lastUpdated).getTime() : null,
          };
          
          // Check current local state
          const currentLocalXp = gamificationState.xp ?? 0;
          const currentLocalLastUpdated = gamificationState.lastUpdated ?? 0;
          const backendLastUpdated = backendData.lastUpdated ?? 0;
          
          // Prefer backend data if it's newer or if local data is missing/zero
          if (backendLastUpdated > currentLocalLastUpdated || currentLocalXp === 0) {
            updateFromRemote(backendData);
          } else if (currentLocalXp > 0 && backendData.xp < currentLocalXp) {
            // Local data is newer/higher, keep it (it will sync back to backend automatically)
            // This handles the case where user earned XP but hasn't synced yet
          }
        }
        
        setStatus(null);
      } catch (error) {
        if (!active) return;
        setStatus({ tone: "error", message: error.message || "Unable to load dashboard" });
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, studentSession, token, navigate]);

  const progressOwner = studentSession?.username?.toLowerCase() || "guest";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const b1 = readUnitProgress(b1Unit.id, progressOwner).data;
    const b2 = readUnitProgress(b2Unit.id, progressOwner).data;
    setB1Insights(b1 || null);
    setB2Insights(b2 || null);
  }, [progressOwner]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const keysToWatch = [progressStorageKey(b1Unit.id, progressOwner), progressStorageKey(b2Unit.id, progressOwner)];
    const handleStorage = (event) => {
      if (!event.key || !keysToWatch.includes(event.key)) return;
      const b1 = readUnitProgress(b1Unit.id, progressOwner).data;
      const b2 = readUnitProgress(b2Unit.id, progressOwner).data;
      setB1Insights(b1 || null);
      setB2Insights(b2 || null);
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [progressOwner]);

  const student = payload?.student ?? null;
  const classInfo = payload?.class ?? null;
  const classPacing = payload?.classPacing ?? null;
  const progress = useMemo(() => payload?.progress ?? [], [payload?.progress]);

  const pointerLesson = useMemo(() => {
    if (!classPacing?.lessonId) return null;
    return getYear7LessonById(classPacing.lessonId);
  }, [classPacing]);

  const pointerUpdatedAt = useMemo(() => {
    if (!classPacing?.updatedAt) return null;
    const date = new Date(classPacing.updatedAt);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
  }, [classPacing?.updatedAt]);

  const lessonStatusMap = useMemo(() => {
    const map = new Map();
    for (const record of progress) {
      map.set(record.lessonSlug, normaliseStatus(record.status));
    }
    return map;
  }, [progress]);

  const track = (student?.curriculumTrack ?? studentSession?.curriculumTrack ?? "ib-sl").toLowerCase();
  const isIBTrack = track.startsWith("ib");
  const trackDisplayName = describeTrack(track);
  const curriculumLink = isIBTrack ? "/curriculum/ib" : "/curriculum";
  const curriculumCtaLabel = isIBTrack ? "View curriculum map" : "Open curriculum overview";

  const totalXp = gamificationState.xp ?? 0;
  const level = gamificationState.level ?? 1;
  const streak = gamificationState.streak ?? 0;
  const totalAttempts = gamificationState.totalAttempts ?? 0;
  const totalCorrect = gamificationState.totalCorrect ?? 0;

  const unitSummaries = useMemo(
    () => createUnitSummaries(manifest, lessonStatusMap, track),
    [manifest, lessonStatusMap, track],
  );

  const totalLessons = unitSummaries.reduce((sum, unit) => sum + unit.totalCount, 0);
  const totalCompleted = unitSummaries.reduce((sum, unit) => sum + unit.completedCount, 0);
  const overallPercentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const recentUpdates = useMemo(() => createRecentUpdates(progress), [progress]);

  const b1AttemptRows = useMemo(() => buildAttemptRows(b1Unit, b1Insights), [b1Insights]);
  const b2AttemptRows = useMemo(() => buildAttemptRows(b2Unit, b2Insights), [b2Insights]);
  const interactiveAttemptSections = useMemo(
    () =>
      [
        {
          id: "B1",
          title: "B1 computational thinking insights",
          description:
            "Attempts recorded for interactive checkpoints in the B1 learning path. Data saves locally on this device.",
          rows: b1AttemptRows,
        },
        {
          id: "B2",
          title: "B2 programming fundamentals insights",
          description:
            "Attempts recorded for checkpoints, activities, and Python playground runs in the B2 learning path.",
          rows: b2AttemptRows,
        },
      ].filter((section) => section.rows.length > 0),
    [b1AttemptRows, b2AttemptRows],
  );

  const gamificationSummary = {
    level,
    xp: totalXp,
    streak,
    totalAttempts,
    totalCorrect,
    accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null,
  };

  if (!ready || !studentSession) {
    return null;
  }

  return (
    <StudentDashboardLayout
      studentName={studentSession.displayName ?? studentSession.username}
      track={track}
      trackDisplayName={trackDisplayName}
      curriculumLink={curriculumLink}
      curriculumCtaLabel={curriculumCtaLabel}
      overallPercentage={overallPercentage}
      totalCompleted={totalCompleted}
      totalLessons={totalLessons}
      classInfo={classInfo}
      activeStage={student?.activeStage ?? null}
      pointerLesson={pointerLesson}
      pointerUpdatedAt={pointerUpdatedAt}
      gamification={gamificationSummary}
      unitSummaries={unitSummaries}
      interactiveAttemptSections={interactiveAttemptSections}
      recentUpdates={recentUpdates}
      status={status}
      isIBTrack={isIBTrack}
    />
  );
}

export default StudentDashboardPage;
export {
  StudentDashboardLayout,
  createUnitSummaries,
  createRecentUpdates,
  normaliseStatus,
  progressLabel,
  isLessonComplete,
  buildAttemptRows,
  describeTrack,
};
