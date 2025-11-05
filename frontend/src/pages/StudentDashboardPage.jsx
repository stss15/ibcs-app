import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStudentDashboard } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import { useCurriculumManifest } from "../hooks/useCurriculumManifest.js";
import { useGamification } from "../context/GamificationContext.jsx";
import { readUnitProgress, writeUnitProgress } from "../lib/progressStorage.js";
import b1Unit from "../content/b1ComputationalThinking.jsx";
import b2Unit from "../content/b2ProgrammingFundamentals.jsx";
import {
  YEAR7_CURRICULUM,
  getYear7LessonById,
  getYear7LessonIndex,
} from "../../../shared/liveDecks.js";
import ContentContainer from "../components/ui/ContentContainer.jsx";

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
              unitId: unit.id,
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
  pointerHeadline,
  pointerCta,
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
  const xpToNextLevel = useMemo(() => {
    if (!Number.isFinite(gamificationXp)) return null;
    const base = Math.floor(gamificationXp / 150) * 150;
    const nextThreshold = base + 150;
    const remaining = nextThreshold - gamificationXp;
    return Math.max(remaining, 0);
  }, [gamificationXp]);
  const computedAccuracy = useMemo(() => {
    if (typeof gamification?.accuracy === "number") return gamification.accuracy;
    if (typeof gamification?.totalAttempts === "number" && gamification.totalAttempts > 0 && typeof gamification?.totalCorrect === "number") {
      return Math.round((gamification.totalCorrect / gamification.totalAttempts) * 100);
    }
    return null;
  }, [gamification?.accuracy, gamification?.totalAttempts, gamification?.totalCorrect]);

  const levelMessage = gamificationLevel != null ? `Lv ${gamificationLevel + 1} unlocks new rewards` : "Clear your first activity to begin levelling";
  const xpMessage = gamificationXp != null ? `${xpToNextLevel ?? 150} XP until the next rank` : "Complete activities to earn XP";
  const streakMessage = gamificationStreak != null && gamificationStreak > 0 ? `${gamificationStreak} in a row—keep it going!` : "Pass activities on the first try to build a streak";
  const attemptsLogged = gamification?.totalAttempts ?? 0;
  const accuracyMessage = computedAccuracy != null ? `${attemptsLogged} attempts logged` : "Your accuracy will appear once you start practicing";

  return (
    <ContentContainer variant="fullWidth" className="student-dashboard">
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
              {(pointerLesson || pointerCta) && (
                <div className="student-dashboard__pointer">
                  <span>Live lesson</span>
                  <strong>{pointerHeadline ?? "Your teacher will start the next lesson soon"}</strong>
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
            {pointerCta && (
              <Link to={pointerCta.link} className="pill pill--action pill--live">
                {pointerCta.label}
              </Link>
            )}
          </div>
        </div>

        <div className="student-dashboard__summary">
          <CircularProgress
            value={overallPercentage}
            label="overall progress"
            caption={`${totalCompleted}/${totalLessons} lessons`}
          />
          <div className="student-dashboard__stat-grid">
            <div className="student-dashboard__stat-card student-dashboard__stat-card--level">
              <span>Level</span>
              <strong>{gamificationLevel != null ? `Lv ${gamificationLevel}` : "—"}</strong>
              <small>{levelMessage}</small>
            </div>
            <div className="student-dashboard__stat-card student-dashboard__stat-card--xp">
              <span>XP</span>
              <strong>{gamificationXp != null ? gamificationXp : "—"}</strong>
              <small>{xpMessage}</small>
            </div>
            <div className="student-dashboard__stat-card student-dashboard__stat-card--streak">
              <span>Streak</span>
              <strong>{gamificationStreak != null ? gamificationStreak : "—"}</strong>
              <small>{streakMessage}</small>
            </div>
            <div className="student-dashboard__stat-card student-dashboard__stat-card--accuracy">
              <span>Accuracy</span>
              <strong>{computedAccuracy != null ? `${computedAccuracy}%` : "—"}</strong>
              <small>{accuracyMessage}</small>
            </div>
          </div>
        </div>
      </section>

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
                  {selectedUnit.lessons.slice(0, 6).map((lesson) => {
                    const lessonLink = resolveLessonLink(track, selectedUnit, lesson, classInfo);
                    const statusClass = `student-tag student-tag--${normaliseStatus(lesson.status)}`;
                    const actionLabel = lesson.status === "formative-complete" ? "Review" : "Open lesson";
                    return (
                      <li key={lesson.id}>
                        <div className="student-dashboard__lesson-info">
                          <strong>{lesson.title}</strong>
                          {lesson.chapterTitle && <span className="muted">{lesson.chapterTitle}</span>}
                        </div>
                        <div className="student-dashboard__lesson-actions">
                          <span className={statusClass}>{progressLabel(lesson.status)}</span>
                          {lessonLink && lesson.status !== "locked" && (
                            <Link to={lessonLink} className="pill pill--ghost">
                              {actionLabel}
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
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

      {status && <p className="status-banner status-banner--info">{status}</p>}
    </ContentContainer>
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
          stroke="var(--color-primary-800)"
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
  const { updateFromRemote } = useGamification();

  const [dashboardData, setDashboardData] = useState(null);
  const [localUnitProgress, setLocalUnitProgress] = useState({});
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!ready) return;
    if (!studentSession) {
      navigate("/", { replace: true });
      return;
    }
    if (!token) return;

    let active = true;
    let intervalId;

    const loadDashboard = async () => {
      try {
        const response = await getStudentDashboard(token);
        if (!active) return;

        setDashboardData(response);

        const backendGamification = response?.gamification;
        if (backendGamification) {
          updateFromRemote(backendGamification);
        }

        const studentProgress = response?.progress ?? [];
        const progressMap = new Map();
        studentProgress.forEach((p) => {
          if (p.unitId && p.progress) {
            progressMap.set(p.unitId, p.progress);
          }
        });

        const progressOwner = studentSession?.username?.toLowerCase() || "guest";

        if (progressMap.has(b1Unit.id)) {
          writeUnitProgress(b1Unit.id, progressOwner, progressMap.get(b1Unit.id));
        }
        if (progressMap.has(b2Unit.id)) {
          writeUnitProgress(b2Unit.id, progressOwner, progressMap.get(b2Unit.id));
        }

        setError(null);
      } catch (error) {
        if (!active) return;
        setError(error.message || "Unable to load dashboard");
      }
    };

    setError(null);
    loadDashboard();
    const createInterval = typeof window !== "undefined" ? window.setInterval : setInterval;
    const clearIntervalFn = typeof window !== "undefined" ? window.clearInterval : clearInterval;
    intervalId = createInterval(loadDashboard, 5000);

    return () => {
      active = false;
      if (intervalId) {
        clearIntervalFn(intervalId);
      }
    };
  }, [ready, studentSession, token, navigate, updateFromRemote]);

  useEffect(() => {
    if (!studentSession?.username) return;
    if (typeof window === "undefined") return;

    const profileKey = studentSession.username.toLowerCase();
    const next = {};
    [b1Unit, b2Unit].forEach((unit) => {
      if (!unit?.id) return;
      const { data } = readUnitProgress(unit.id, profileKey);
      if (data && typeof data === "object") {
        next[unit.id] = data;
      }
    });
    setLocalUnitProgress(next);
  }, [studentSession?.username]);

  if (error && !dashboardData) {
    return (
      <ContentContainer variant="fullWidth" className="student-dashboard">
        <p className="status-banner status-banner--error">{error}</p>
      </ContentContainer>
    );
  }

  if (!dashboardData) {
    return (
      <ContentContainer variant="fullWidth" className="student-dashboard">
        Loading...
      </ContentContainer>
    );
  }

  return <StudentDashboardRenderer data={dashboardData} localProgress={localUnitProgress} />;
}

function StudentDashboardRenderer({ data, localProgress }) {
  const { state: gamificationState } = useGamification();
  const { manifest } = useCurriculumManifest();

  const student = data?.student ?? {};
  const classInfo = data?.class ?? null;
  const classPacing = data?.classPacing ?? null;
  const trackRaw = student.curriculumTrack ?? "ib-sl";
  const track = trackRaw.toLowerCase();

  const lessonStatusMap = useMemo(
    () => buildLessonStatusMap(data?.unlocks ?? [], data?.progress ?? []),
    [data?.unlocks, data?.progress],
  );

  const unitSummaries = useMemo(() => {
    if (track.startsWith("ks3")) {
      const pointerLessonId = classPacing?.lessonId ?? null;
      return createYear7Summaries(pointerLessonId);
    }
    return createUnitSummaries(manifest, lessonStatusMap, track);
  }, [track, classPacing?.lessonId, manifest, lessonStatusMap]);

  const totals = useMemo(() => computeOverallTotals(unitSummaries), [unitSummaries]);

  const pointerLesson = useMemo(() => {
    if (!track.startsWith("ks3")) return null;
    if (!classPacing?.lessonId) return null;
    return getYear7LessonById(classPacing.lessonId);
  }, [track, classPacing?.lessonId]);

  const pointerUpdatedAt = useMemo(() => {
    if (!track.startsWith("ks3")) return null;
    return formatTimestamp(classPacing?.updatedAt);
  }, [track, classPacing?.updatedAt]);

  const pointerHeadline = useMemo(() => {
    if (pointerLesson) {
      return `${pointerLesson.unitTitle}: ${pointerLesson.title}`;
    }
    if (classPacing?.lessonId) {
      return classPacing.lessonId;
    }
    if (classPacing?.unitId) {
      return classPacing.unitId;
    }
    return null;
  }, [pointerLesson, classPacing?.lessonId, classPacing?.unitId]);

  const pointerCta = useMemo(
    () => resolvePointerAction(track, pointerLesson, classPacing, classInfo),
    [track, pointerLesson, classPacing, classInfo],
  );

  const curriculumCta = useMemo(() => createCurriculumLink(track, classInfo), [track, classInfo]);

  const interactiveAttemptSections = useMemo(
    () => buildInteractiveSections(track, localProgress),
    [track, localProgress],
  );

  const recentUpdates = useMemo(() => createRecentUpdates(data?.progress ?? []), [data?.progress]);

  const gamification = useMemo(
    () => ({ ...gamificationState, ...(data?.gamification ?? {}) }),
    [gamificationState, data?.gamification],
  );

  const studentName = useMemo(() => {
    if (student.displayName) return student.displayName;
    const fallback = [student.firstName, student.lastName].filter(Boolean).join(" ");
    if (fallback.trim()) return fallback.trim();
    if (student.username) return student.username;
    return "Student";
  }, [student.displayName, student.firstName, student.lastName, student.username]);

  return (
    <StudentDashboardLayout
      studentName={studentName}
      track={track}
      trackDisplayName={describeTrack(trackRaw)}
      curriculumLink={curriculumCta.link}
      curriculumCtaLabel={curriculumCta.label}
      overallPercentage={totals.overallPercentage}
      totalCompleted={totals.totalCompleted}
      totalLessons={totals.totalLessons}
      classInfo={classInfo}
      activeStage={student.activeStage ?? null}
      pointerLesson={pointerLesson}
      pointerUpdatedAt={pointerUpdatedAt}
      pointerHeadline={pointerHeadline}
      pointerCta={pointerCta}
      gamification={gamification}
      unitSummaries={unitSummaries}
      interactiveAttemptSections={interactiveAttemptSections}
      recentUpdates={recentUpdates}
      status={data?.status ?? null}
      isIBTrack={track.startsWith("ib")}
    />
  );
}

function buildLessonStatusMap(unlocks = [], progress = []) {
  const map = new Map();

  (progress ?? []).forEach((record) => {
    if (!record?.lessonSlug) return;
    map.set(record.lessonSlug, record.status ?? "locked");
  });

  (unlocks ?? []).forEach((unlock) => {
    if (unlock?.scope !== "lesson") return;
    if (!unlock?.stageKey) return;
    const existing = map.get(unlock.stageKey);
    if (!existing || existing === "locked") {
      map.set(unlock.stageKey, "available");
    }
  });

  return map;
}

function createYear7Summaries(pointerLessonId) {
  const pointerIndex = pointerLessonId ? getYear7LessonIndex(pointerLessonId) : -1;

  return YEAR7_CURRICULUM.map((unit) => {
    const lessons = unit.lessons.map((lesson) => {
      const lessonIndex = getYear7LessonIndex(lesson.id);
      let status = "locked";

      if (pointerIndex === -1) {
        status = lessonIndex === 0 ? "available" : "locked";
      } else if (lessonIndex < pointerIndex) {
        status = "formative-complete";
      } else if (lessonIndex === pointerIndex) {
        status = "available";
      }

      return {
        ...lesson,
        unitId: unit.id,
        chapterTitle: null,
        status,
      };
    });

    const totalCount = lessons.length;
    const completedCount = lessons.filter((lesson) => isLessonComplete(lesson.status)).length;
    const unlockedCount = lessons.filter((lesson) => lesson.status !== "locked").length;
    const inProgressCount = Math.max(unlockedCount - completedCount, 0);
    const lockedCount = Math.max(totalCount - unlockedCount, 0);
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const nextLesson =
      lessons.find((lesson) => lesson.status === "available") ??
      lessons.find((lesson) => lesson.status === "formative-complete") ??
      lessons[0] ?? null;

    return {
      id: unit.id,
      title: unit.title,
      description: unit.summary,
      lessons,
      completedCount,
      unlockedCount,
      inProgressCount,
      lockedCount,
      totalCount,
      percentage,
      nextLesson,
    };
  });
}

function computeOverallTotals(units = []) {
  const totals = units.reduce(
    (acc, unit) => {
      const total = unit.totalCount ?? unit.lessons?.length ?? 0;
      const completed = unit.completedCount ?? 0;
      return {
        totalLessons: acc.totalLessons + total,
        totalCompleted: acc.totalCompleted + completed,
      };
    },
    { totalLessons: 0, totalCompleted: 0 },
  );

  const overallPercentage = totals.totalLessons > 0
    ? Math.round((totals.totalCompleted / totals.totalLessons) * 100)
    : 0;

  return { ...totals, overallPercentage };
}

function formatTimestamp(value) {
  if (!value) return null;
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return null;
  return timestamp.toLocaleString();
}

function createCurriculumLink(track, classInfo) {
  if (track.startsWith("ks3")) {
    if (classInfo?.id) {
      return {
        link: { pathname: "/curriculum/year7", state: { classId: classInfo.id } },
        label: "Open Year 7 map",
      };
    }
    return { link: "/curriculum/year7", label: "Explore Year 7 map" };
  }

  if (track === "igcse") {
    if (classInfo?.id) {
      return {
        link: { pathname: "/curriculum/igcse", state: { classId: classInfo.id } },
        label: "Open IGCSE map",
      };
    }
    return { link: "/curriculum/igcse", label: "Explore IGCSE map" };
  }

  return { link: "/curriculum/ib", label: "Browse IB curriculum" };
}

function resolvePointerAction(track, pointerLesson, classPacing, classInfo) {
  if (track.startsWith("ks3")) {
    if (!pointerLesson) return null;
    const state = {};
    if (classInfo?.id) state.classId = classInfo.id;

    const mapState = {
      ...state,
      ...(pointerLesson.unitId ? { focusUnit: pointerLesson.unitId } : {}),
    };
    const hasMapState = Object.keys(mapState).length > 0;
    return {
      link: {
        pathname: "/curriculum/year7",
        ...(hasMapState ? { state: mapState } : {}),
      },
      label: `View ${pointerLesson.title}`,
    };
  }

  if (track.startsWith("ib")) {
    if (!classPacing?.unitId) return null;
    const unitSlug = String(classPacing.unitId).toLowerCase();
    const link = { pathname: `/curriculum/ib/${unitSlug}` };
    if (classPacing.lessonId) {
      link.state = { focusStage: classPacing.lessonId };
    }
    return {
      link,
      label: "Join live lesson",
    };
  }

  if (track === "igcse") {
    return {
      link: { pathname: "/curriculum/igcse" },
      label: "View IGCSE roadmap",
    };
  }

  return null;
}

function resolveLessonLink(track, unit, lesson, classInfo) {
  if (!lesson || lesson.status === "locked") return null;

  if (track.startsWith("ks3")) {
    const baseState = {};
    if (classInfo?.id) baseState.classId = classInfo.id;

    const mapState = {
      ...baseState,
      ...(lesson.unitId ? { focusUnit: lesson.unitId } : {}),
    };
    if (!mapState.focusUnit && unit?.id) {
      mapState.focusUnit = unit.id;
    }
    const hasMapState = Object.keys(mapState).length > 0;

    return {
      pathname: "/curriculum/year7",
      ...(hasMapState ? { state: mapState } : {}),
    };
  }

  if (!lesson.id) return null;
  return `/lesson/${lesson.id}`;
}

function buildInteractiveSections(track, localProgress) {
  const sequence = [];
  if (track.startsWith("ks3")) {
    // KS3 interactive content rebuilt via teacher-paced decks; placeholder until new deck integration
  }
  sequence.push(b1Unit, b2Unit);

  const seen = new Set();
  return sequence
    .filter((unit) => unit && !seen.has(unit.id) && seen.add(unit.id))
    .map((unit) => {
      const insights = localProgress?.[unit.id] ?? null;
      return {
        id: unit.title,
        rows: buildAttemptRows(unit, insights),
      };
    })
    .filter((section) => section.rows.length > 0);
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
