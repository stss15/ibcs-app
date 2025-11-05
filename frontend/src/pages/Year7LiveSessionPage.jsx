import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getTeacherDashboard,
  getClassPacing,
  updateClassPacing,
  getStudentDashboard,
  getStudentClassPacing,
  joinLiveSession,
  getLiveAssessmentStatus,
  updateLiveAssessmentStatus,
} from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import {
  getDeckSummary,
  listSlidesForDeck,
  getSlideById,
  describeSlide,
  YEAR7_UNITS,
  YEAR7_CURRICULUM,
} from "../../../shared/liveDecks.js";
import SlideRenderer from "../components/slides/SlideRenderer.jsx";
import LiveDashboard from "../components/teacher/LiveDashboard.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import analyticsService from "../lib/services/AnalyticsService.js";
import gamificationService from "../lib/services/GamificationService.js";
import { useGamification } from "../context/GamificationContext.jsx";
import "./Year7LiveSessionPage.css";

const POLL_INTERVAL_MS = 4000;

function normaliseAccessible(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.slideId) return value.slideId;
  if (typeof value === "object" && value.id) return value.id;
  return null;
}

function buildLiveSnapshot(payload) {
  if (!payload) return null;
  const pacing = payload.pacing ?? payload;
  const lessonId = payload.lesson?.id || pacing?.lessonId || pacing?.slideId || null;
  const lesson = lessonId ? describeSlide(lessonId) : null;
  const accessibleSource = payload.accessibleSlides ?? pacing?.accessibleSlides ?? [];
  const accessible = new Set(
    accessibleSource
      .map((entry) => normaliseAccessible(entry))
      .filter(Boolean),
  );
  if (lesson?.slideId) {
    accessible.add(lesson.slideId);
  }
  return {
    classDoc: payload.class ?? null,
    pacing,
    lesson,
    accessible,
    sessionCode: pacing?.sessionCode ?? null,
    sessionStatus: pacing?.sessionStatus ?? (lesson ? "live" : "idle"),
    updatedAt: pacing?.updatedAt ?? null,
  };
}

function formatTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function getDefaultDeckId() {
  return YEAR7_CURRICULUM[0]?.id ?? YEAR7_UNITS.find((unit) => unit.deckId)?.deckId ?? null;
}

function getUnitByDeckId(deckId) {
  return YEAR7_UNITS.find((unit) => unit.deckId === deckId) ?? YEAR7_UNITS[0];
}

function statusLabel(status) {
  switch ((status || "idle").toLowerCase()) {
    case "live":
      return "Live";
    case "paused":
      return "Paused";
    case "idle":
    default:
      return "Not started";
  }
}

function useArrowNavigation(callbacks) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.defaultPrevented) return;
      if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) {
        return;
      }
      if (event.key === "ArrowRight") {
        callbacks.onNext?.();
      }
      if (event.key === "ArrowLeft") {
        callbacks.onPrev?.();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [callbacks]);
}

function SlideTimeline({ slides, pointerId, activeId, accessibleSet, onSelect, disableFuture, label }) {
  const labelMap = {
    content: "Content",
    checkpoint: "Checkpoint",
    assessment: "Assessment",
    summative: "Summative",
    interactive: "Interactive",
  };
  return (
    <div className="y7-live-timeline" aria-label={label}>
      {slides.map((slide) => {
        const status = pointerId === slide.id ? "current" : accessibleSet.has(slide.id) ? "available" : "locked";
        const isActive = activeId === slide.id;
        const isDisabled = disableFuture && status === "locked";
        return (
          <button
            key={slide.id}
            type="button"
            className={`y7-live-timeline__item y7-live-timeline__item--${status} ${isActive ? "is-active" : ""}`}
            onClick={() => onSelect(slide.id, status)}
            disabled={isDisabled}
          >
            <span className="y7-live-timeline__order">{slide.order}</span>
            <div className="y7-live-timeline__text">
              <strong>{slide.title}</strong>
              <span>{labelMap[slide.type] || "Slide"}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TeacherPanel({ classes, selectedClassId, onSelectClass, onStart, onAdvance, onPause, onReset, onRefresh, deckSummary, liveState, controlBusy }) {
  const classOptions = classes?.filter((clazz) => !clazz.archivedAt) ?? [];
  const pointer = liveState?.lesson;
  const sessionStatus = statusLabel(liveState?.sessionStatus);
  const statusTone = liveState?.sessionStatus === "live" ? "brand" : undefined;
  const sessionMeta = [
    liveState?.sessionCode ? `Join code ${liveState.sessionCode}` : null,
    liveState?.updatedAt ? `Updated ${formatTimestamp(liveState.updatedAt)}` : null,
  ]
    .filter(Boolean)
    .join(" • ") || null;
  const actionsDisabled = controlBusy || !selectedClassId;
  return (
    <section className="y7-live-panel">
      <header className="y7-live-panel__header">
        <div>
          <h2>Class controls</h2>
          <p>Launch and pace the live deck for your Year 7 class.</p>
        </div>
        <button type="button" className="y7-btn y7-btn--ghost" onClick={onRefresh}>
          Refresh
        </button>
      </header>
      <label className="y7-live-field">
        <span>Choose a class</span>
        <select value={selectedClassId} onChange={(event) => onSelectClass(event.target.value)}>
          <option value="">Preview without a class</option>
          {classOptions.map((clazz) => (
            <option key={clazz.id} value={clazz.id}>
              {clazz.className}
            </option>
          ))}
        </select>
      </label>
      <StatCard tone={statusTone} label="Session status" value={sessionStatus} meta={sessionMeta} compact />
      <div className="y7-live-actions">
        <button type="button" className="y7-btn y7-btn--primary" disabled={actionsDisabled} onClick={onStart}>
          Start / resume
        </button>
        <button type="button" className="y7-btn" disabled={actionsDisabled} onClick={onAdvance}>
          Advance
        </button>
        <button type="button" className="y7-btn" disabled={actionsDisabled} onClick={onPause}>
          Pause
        </button>
        <button type="button" className="y7-btn y7-btn--ghost" disabled={actionsDisabled} onClick={onReset}>
          Reset to slide 1
        </button>
      </div>
      <footer className="y7-live-panel__footer">
        {pointer ? (
          <>
            <p>
              Live on <strong>{pointer.slideTitle}</strong>
              {typeof pointer.index === "number" && deckSummary?.slideCount ? (
                <span>
                  {" "}(slide {pointer.index + 1} of {deckSummary.slideCount})
                </span>
              ) : null}
            </p>
          </>
        ) : (
          <p>No active pointer yet. Start the session to project the first slide.</p>
        )}
      </footer>
    </section>
  );
}

function StudentPanel({ deckSummary, liveState, onReturnToLive, canReturn, onJoinByCode, joinMessage, joinCodeInput, setJoinCodeInput }) {
  const pointer = liveState?.lesson;
  const sessionStatus = statusLabel(liveState?.sessionStatus);
  const statusTone = liveState?.sessionStatus === "live" ? "brand" : undefined;
  const sessionMeta = [
    liveState?.sessionCode ? `Join code ${liveState.sessionCode}` : null,
    liveState?.updatedAt ? `Updated ${formatTimestamp(liveState.updatedAt)}` : null,
  ]
    .filter(Boolean)
    .join(" • ") || null;
  return (
    <section className="y7-live-panel">
      <header className="y7-live-panel__header">
        <div>
          <h2>Lesson navigation</h2>
          <p>Stay in sync with your teacher and revisit earlier slides.</p>
        </div>
      </header>
      <StatCard tone={statusTone} label="Session status" value={sessionStatus} meta={sessionMeta} compact />
      <div className="y7-live-panel__body">
        {pointer ? (
          <p>
            Live pointer: <strong>{pointer.slideTitle}</strong>
            {typeof pointer.index === "number" && deckSummary?.slideCount ? (
              <span>
                {" "}(slide {pointer.index + 1} of {deckSummary.slideCount})
              </span>
            ) : null}
          </p>
        ) : (
          <p>Your teacher hasn’t started the live deck yet. You can still review previous slides once the session begins.</p>
        )}
        {canReturn && (
          <button type="button" className="y7-btn y7-btn--primary" onClick={onReturnToLive}>
            Jump to live slide
          </button>
        )}
      </div>
      <form
        className="y7-live-join"
        onSubmit={(event) => {
          event.preventDefault();
          onJoinByCode?.();
        }}
      >
        <label className="y7-live-field">
          <span>Join with a code</span>
          <input
            type="text"
            value={joinCodeInput}
            placeholder="e.g. H4X8Q"
            onChange={(event) => setJoinCodeInput(event.target.value.toUpperCase())}
            maxLength={8}
          />
        </label>
        <button type="submit" className="y7-btn">
          Join session
        </button>
        {joinMessage && <p className={`y7-live-join__status y7-live-join__status--${joinMessage.kind}`}>{joinMessage.text}</p>}
      </form>
    </section>
  );
}

function LiveAssessmentPanel({ assessment, isVisible }) {
  if (!isVisible) return null;
  const students = assessment?.students ?? [];
  const summary = assessment?.summary ?? {};
  return (
    <section className="y7-live-panel">
      <header className="y7-live-panel__header">
        <div>
          <h2>Checkpoint dashboard</h2>
          <p>Monitor progress as students complete the formative task.</p>
        </div>
      </header>
      <div className="y7-live-summary">
        <div>
          <span>Completed</span>
          <strong>{summary.completed ?? 0}</strong>
        </div>
        <div>
          <span>In progress</span>
          <strong>{summary["in-progress"] ?? 0}</strong>
        </div>
        <div>
          <span>Not started</span>
          <strong>{summary["not-started"] ?? 0}</strong>
        </div>
      </div>
      <div className="y7-live-table">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={4}>Waiting for students to begin…</td>
              </tr>
            ) : (
              students.map((row) => (
                <tr key={row.id}>
                  <td>{row.displayName || row.username || "—"}</td>
                  <td className={`status status--${row.status}`}>{row.status.replace("-", " ")}</td>
                  <td>{row.attempts ?? 0}</td>
                  <td>{typeof row.score === "number" ? `${Math.round(row.score * 100)}%` : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Year7LiveSessionPage() {
  const { session, ready } = useSession();
  const token = session?.token ?? null;
  const role = session?.user?.role ?? null;
  const isTeacher = role === "teacher";
  const isStudent = role === "student";
  const [searchParams] = useSearchParams();
  const { awardXp, resetStreak } = useGamification();

  const deckIdFromQuery = searchParams.get("deckId") || getDefaultDeckId();
  const [deckId, setDeckId] = useState(deckIdFromQuery);
  const deckSummary = useMemo(() => (deckId ? getDeckSummary(deckId) : null), [deckId]);
  const slides = useMemo(() => listSlidesForDeck(deckSummary?.id ?? getDefaultDeckId()), [deckSummary?.id]);
  const unit = useMemo(() => (deckSummary ? getUnitByDeckId(deckSummary.id) : YEAR7_UNITS[0]), [deckSummary]);

  const [teacherData, setTeacherData] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(() => searchParams.get("classId") || "");
  const [classSnapshot, setClassSnapshot] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentSnapshot, setStudentSnapshot] = useState(null);
  const [activeSlideId, setActiveSlideId] = useState(null);
  const [controlBusy, setControlBusy] = useState(false);
  const [assessmentState, setAssessmentState] = useState({ summary: null, students: [] });
  const [joinMessage, setJoinMessage] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionId = useMemo(() => {
    if (isTeacher) {
      return classSnapshot?.pacing?.sessionId || classSnapshot?.sessionId || selectedClassId || null;
    }
    return studentSnapshot?.pacing?.sessionId || studentSnapshot?.sessionId || studentInfo?.class?.id || null;
  }, [
    isTeacher,
    classSnapshot?.pacing?.sessionId,
    classSnapshot?.sessionId,
    selectedClassId,
    studentSnapshot?.pacing?.sessionId,
    studentSnapshot?.sessionId,
    studentInfo?.class?.id,
  ]);

  const classId = useMemo(() => {
    if (isTeacher) return selectedClassId || null;
    return studentInfo?.class?.id || studentSnapshot?.classDoc?.id || null;
  }, [isTeacher, selectedClassId, studentInfo?.class?.id, studentSnapshot?.classDoc?.id]);

  const studentId = useMemo(() => (isStudent ? studentInfo?.student?.id || null : null), [isStudent, studentInfo?.student?.id]);

  const lastSlideRef = useRef(null);
  const slideStartRef = useRef(Date.now());
  const lastPointerRef = useRef(null);

  const logSlideView = useCallback(
    (slideId, durationMs) => {
      if (!isStudent || !slideId) return;
      analyticsService.trackEvent("slide_view", {
        sessionId,
        classId,
        studentId,
        slideId,
        payload: {
          durationMs: Math.max(0, durationMs ?? 0),
        },
      });
    },
    [isStudent, sessionId, classId, studentId],
  );

  const classStudents = useMemo(() => {
    if (!teacherData?.students || !selectedClassId) return [];
    return teacherData.students.filter((student) => student.classId === selectedClassId);
  }, [teacherData?.students, selectedClassId]);

  const liveState = isTeacher ? classSnapshot : studentSnapshot;
  const pointerSlideId = liveState?.lesson?.slideId || liveState?.lesson?.id || null;
  const accessibleSet = liveState?.accessible ?? new Set(pointerSlideId ? [pointerSlideId] : []);
  const pointerSlideMeta = pointerSlideId ? getSlideById(pointerSlideId) : null;
  const activeSlideMeta = useMemo(() => (activeSlideId ? getSlideById(activeSlideId) : pointerSlideId ? getSlideById(pointerSlideId) : slides[0] ? getSlideById(slides[0].id) : null), [activeSlideId, pointerSlideId, slides]);
  const canReturnToLive = isStudent && pointerSlideId && activeSlideId && pointerSlideId !== activeSlideId;

  useEffect(() => {
    const deckFromQuery = searchParams.get("deckId") || getDefaultDeckId();
    if (deckFromQuery !== deckId) {
      setDeckId(deckFromQuery);
      setActiveSlideId(null);
    }
  }, [searchParams, deckId]);

  const applySnapshot = useCallback(
    (payload, { forceActive } = {}) => {
      const snapshot = buildLiveSnapshot(payload);
      if (!snapshot) return;
      if (isTeacher) setClassSnapshot(snapshot);
      else setStudentSnapshot(snapshot);
      const pointerId = snapshot.lesson?.slideId || null;
      if (forceActive || !activeSlideId) {
        setActiveSlideId(pointerId || slides[0]?.id || null);
      } else if (activeSlideId && !snapshot.accessible.has(activeSlideId)) {
        setActiveSlideId(pointerId || activeSlideId);
      }
    },
    [isTeacher, activeSlideId, slides],
  );

  const refreshClassSnapshot = useCallback(
    async (classId) => {
      if (!token || !classId) {
        setClassSnapshot(null);
        return;
      }
      try {
        const response = await getClassPacing(token, classId);
        applySnapshot(response, { forceActive: !activeSlideId });
      } catch (err) {
        console.error("Failed to load class pacing", err);
        setClassSnapshot(null);
      }
    },
    [token, applySnapshot, activeSlideId],
  );

  const refreshStudentSnapshot = useCallback(
    async (classId) => {
      if (!token || !classId) {
        setStudentSnapshot(null);
        return;
      }
      try {
        const response = await getStudentClassPacing(token, classId);
        applySnapshot(response, { forceActive: !activeSlideId });
      } catch (err) {
        console.error("Failed to load student pacing", err);
        setStudentSnapshot(null);
      }
    },
    [token, applySnapshot, activeSlideId],
  );

  useEffect(() => {
    if (!ready || !token) return;
    const run = async () => {
      setLoading(true);
      try {
        if (isTeacher) {
          const data = await getTeacherDashboard(token);
          setTeacherData(data);
          const year7Classes = (data.classes || []).filter((clazz) => {
            const label = String(clazz?.yearGroup || "").toLowerCase();
            return label.includes("year 7") || label.includes("ks3");
          });
          const initialClass = selectedClassId && year7Classes.some((clazz) => clazz.id === selectedClassId) ? selectedClassId : year7Classes[0]?.id || "";
          setSelectedClassId(initialClass);
          if (initialClass) await refreshClassSnapshot(initialClass);
        } else if (isStudent) {
          const dashboard = await getStudentDashboard(token);
          setStudentInfo(dashboard);
          const classId = dashboard.class?.id || dashboard.student?.classId || "";
          if (classId) await refreshStudentSnapshot(classId);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [ready, token, isTeacher, isStudent, selectedClassId, refreshClassSnapshot, refreshStudentSnapshot]);

  useEffect(() => {
    if (!activeSlideId && slides[0]) {
      setActiveSlideId(pointerSlideId || slides[0].id);
    }
  }, [slides, pointerSlideId, activeSlideId]);

  useEffect(() => {
    if (!isStudent || !activeSlideId) return;
    const now = Date.now();
    const previous = lastSlideRef.current;
    if (previous && previous !== activeSlideId) {
      logSlideView(previous, now - slideStartRef.current);
    }
    lastSlideRef.current = activeSlideId;
    slideStartRef.current = now;
  }, [isStudent, activeSlideId, logSlideView]);

  useEffect(() => {
    return () => {
      if (!isStudent) return;
      const previous = lastSlideRef.current;
      if (previous) {
        const duration = Date.now() - slideStartRef.current;
        logSlideView(previous, duration);
      }
    };
  }, [isStudent, logSlideView]);

  useEffect(() => {
    if (!isTeacher || !pointerSlideId) {
      lastPointerRef.current = null;
      return;
    }
    if (lastPointerRef.current === pointerSlideId) return;
    lastPointerRef.current = pointerSlideId;
    analyticsService.trackEvent("pointer_update", {
      sessionId,
      classId,
      slideId: pointerSlideId,
      payload: { role: "teacher" },
    });
  }, [isTeacher, pointerSlideId, sessionId, classId]);

  useEffect(() => {
    if (!isTeacher || !selectedClassId || !token || !pointerSlideId || pointerSlideMeta?.slide?.type !== "checkpoint") {
      setAssessmentState({ summary: null, students: [] });
      return undefined;
    }
    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const response = await getLiveAssessmentStatus(token, selectedClassId, {
          unitId: deckSummary?.id,
          segmentId: pointerSlideId,
        });
        if (!cancelled) {
          setAssessmentState({ summary: response.summary ?? null, students: response.students ?? [] });
        }
      } catch (err) {
        if (!cancelled) console.error("Failed to fetch live assessment status", err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isTeacher, selectedClassId, token, pointerSlideId, pointerSlideMeta?.slide?.type, deckSummary?.id]);

  const goToNextSlide = useCallback(async () => {
    const currentIndex = slides.findIndex((slide) => slide.id === (isTeacher ? pointerSlideId : activeSlideId));
    const target = slides[currentIndex + 1];
    if (!target) return;
    if (isTeacher && selectedClassId) {
      setControlBusy(true);
      try {
        const response = await updateClassPacing(token, selectedClassId, { command: "advance" });
        applySnapshot(response, { forceActive: true });
      } catch (err) {
        console.error(err);
      } finally {
        setControlBusy(false);
      }
    } else {
      setActiveSlideId(target.id);
    }
  }, [slides, isTeacher, pointerSlideId, activeSlideId, selectedClassId, token, applySnapshot]);

  const goToPrevSlide = useCallback(async () => {
    const currentIndex = slides.findIndex((slide) => slide.id === (isTeacher ? pointerSlideId : activeSlideId));
    const target = slides[currentIndex - 1];
    if (!target) return;
    if (isTeacher && selectedClassId) {
      setControlBusy(true);
      try {
        const response = await updateClassPacing(token, selectedClassId, {
          lessonId: target.id,
          unitId: deckSummary?.id,
        });
        applySnapshot(response, { forceActive: true });
      } catch (err) {
        console.error(err);
      } finally {
        setControlBusy(false);
      }
    } else {
      setActiveSlideId(target.id);
    }
  }, [slides, isTeacher, pointerSlideId, activeSlideId, selectedClassId, token, deckSummary?.id, applySnapshot]);

  useArrowNavigation({ onNext: goToNextSlide, onPrev: goToPrevSlide });

  const handleTimelineSelect = useCallback(
    async (slideId, status) => {
      if (isTeacher && selectedClassId) {
        setControlBusy(true);
        try {
          const response = await updateClassPacing(token, selectedClassId, {
            lessonId: slideId,
            unitId: deckSummary?.id,
          });
          applySnapshot(response, { forceActive: true });
        } catch (err) {
          console.error(err);
        } finally {
          setControlBusy(false);
        }
      } else if (status !== "locked") {
        setActiveSlideId(slideId);
      }
    },
    [isTeacher, selectedClassId, token, deckSummary?.id, applySnapshot],
  );

  const handleStart = useCallback(async () => {
    if (!isTeacher || !selectedClassId) return;
    setControlBusy(true);
    try {
      const response = await updateClassPacing(token, selectedClassId, {
        command: "start",
        unitId: deckSummary?.id,
        resume: true,
      });
      applySnapshot(response, { forceActive: true });
    } catch (err) {
      console.error(err);
    } finally {
      setControlBusy(false);
    }
  }, [isTeacher, selectedClassId, token, deckSummary?.id, applySnapshot]);

  const handlePause = useCallback(async () => {
    if (!isTeacher || !selectedClassId) return;
    setControlBusy(true);
    try {
      const response = await updateClassPacing(token, selectedClassId, { command: "stop" });
      applySnapshot(response, { forceActive: true });
    } catch (err) {
      console.error(err);
    } finally {
      setControlBusy(false);
    }
  }, [isTeacher, selectedClassId, token, applySnapshot]);

  const handleReset = useCallback(async () => {
    if (!isTeacher || !selectedClassId) return;
    setControlBusy(true);
    try {
      const response = await updateClassPacing(token, selectedClassId, {
        command: "reset",
        unitId: deckSummary?.id,
        resetHistory: true,
      });
      applySnapshot(response, { forceActive: true });
    } catch (err) {
      console.error(err);
    } finally {
      setControlBusy(false);
    }
  }, [isTeacher, selectedClassId, token, deckSummary?.id, applySnapshot]);

  const handleCheckpointSubmit = useCallback(
    async (result) => {
      if (!isStudent || !classId || !token || !activeSlideId) return;

      const baseAttempts = typeof result === "object" && result !== null && Number.isFinite(result.attempts) ? Number(result.attempts) : 1;
      const attempts = Math.max(1, baseAttempts);

      const success = (() => {
        if (typeof result === "boolean") return result;
        if (result && typeof result === "object") {
          if (typeof result.success === "boolean") return result.success;
          if (typeof result.status === "string") return result.status === "completed";
          if (typeof result.score === "number") return result.score > 0;
        }
        return false;
      })();

      const rawScore = typeof result === "object" && result !== null && Number.isFinite(result.score) ? Number(result.score) : null;
      const normalizedScore = rawScore === null ? (success ? 1 : null) : rawScore <= 1 ? Math.max(0, rawScore) : 1;

      const payload = {
        status: success ? "completed" : "in-progress",
        score: normalizedScore,
        attempts,
      };

      let synced = false;
      try {
        await updateLiveAssessmentStatus(token, {
          classId,
          unitId: deckSummary?.id,
          segmentId: activeSlideId,
          status: payload.status,
          score: payload.score,
          attempts: payload.attempts,
        });
        synced = true;
      } catch (err) {
        console.error("Failed to sync checkpoint status", err);
      }

      if (!synced) return;

      analyticsService.trackEvent("assessment_complete", {
        sessionId,
        classId,
        studentId,
        slideId: activeSlideId,
        payload: {
          score: payload.score,
          attempts: payload.attempts,
          success,
        },
      });

      if (success) {
        const action = payload.score === 1 ? "assessment_perfect" : "assessment_attempt";
        try {
          const award = await gamificationService.awardExperience(studentId, action, {
            firstAttempt: attempts === 1,
            correct: success,
            attempts,
          });
          if (award?.awarded > 0 && typeof awardXp === "function") {
            awardXp({ xpGained: award.awarded, correct: 1, attempts, spriteUnlocks: [] });
          }
        } catch (err) {
          console.warn("Failed to award experience", err);
        }
      } else if (typeof resetStreak === "function") {
        resetStreak();
      }
    },
    [
      isStudent,
      classId,
      token,
      activeSlideId,
      deckSummary?.id,
      sessionId,
      studentId,
      awardXp,
      resetStreak,
    ],
  );

  const handleJoinByCode = useCallback(async () => {
    if (!isStudent || !joinCodeInput || !token) return;
    setJoinMessage({ kind: "info", text: "Joining…" });
    try {
      const response = await joinLiveSession(token, joinCodeInput.trim());
      applySnapshot(response, { forceActive: true });
      setJoinMessage({ kind: "success", text: "Joined the live session" });
    } catch (err) {
      console.error(err);
      setJoinMessage({ kind: "error", text: err.message || "Unable to join. Check the code and try again." });
    }
  }, [isStudent, joinCodeInput, token, applySnapshot]);

  const handleSelectClass = useCallback(
    (classId) => {
      setSelectedClassId(classId);
      if (classId) refreshClassSnapshot(classId);
      else setClassSnapshot(null);
    },
    [refreshClassSnapshot],
  );

  const deckTitle = deckSummary?.title || "Live deck";

  return (
    <div className="y7-live-shell">
      <header className="y7-live-header">
        <div>
          <span className="y7-live-eyebrow">Year 7 · {unit?.title || "Live deck"}</span>
          <h1>{deckTitle}</h1>
          <p>{unit?.summary || "Teacher-paced live lesson with checkpoints and classroom guidance."}</p>
        </div>
        <dl className="y7-live-meta">
          <div>
            <dt>Focus</dt>
            <dd>{unit?.focus || "Live deck"}</dd>
          </div>
          {unit?.estimatedHours && (
            <div>
              <dt>Estimated time</dt>
              <dd>{unit.estimatedHours}</dd>
            </div>
          )}
          <div>
            <dt>Slides</dt>
            <dd>{slides.length}</dd>
          </div>
        </dl>
      </header>

      {error && <div className="y7-live-alert">{error.message || "Something went wrong."}</div>}

      <div className="y7-live-layout">
        <main className="y7-live-stage">
          {loading ? (
            <div className="y7-live-loading">
              <span className="y7-live-spinner" aria-hidden="true" />
              <p>Loading live session…</p>
            </div>
          ) : (
            <>
              <div className="y7-live-stage__card">
                <SlideRenderer
                  slideData={activeSlideMeta?.slide ?? activeSlideMeta}
                  isTeacher={isTeacher}
                  sessionId={classSnapshot?.pacing?.sessionId || classSnapshot?.sessionId || selectedClassId || null}
                  studentId={studentInfo?.student?.id || studentSnapshot?.student?.id || null}
                  canProgress={isTeacher || accessibleSet.has(activeSlideId)}
                  onAssessmentComplete={isStudent ? handleCheckpointSubmit : undefined}
                />
              </div>
              <div className="y7-live-controls">
                <button type="button" className="y7-btn" onClick={goToPrevSlide} disabled={controlBusy || slides.length === 0}>
                  Previous
                </button>
                <div className="y7-live-controls__middle">
                  <span>
                    Slide {slides.findIndex((slide) => slide.id === activeSlideId) + 1} of {slides.length}
                  </span>
                  {pointerSlideId && pointerSlideId !== activeSlideId && !isTeacher && (
                    <button type="button" className="y7-btn y7-btn--ghost" onClick={() => setActiveSlideId(pointerSlideId)}>
                      Jump to live
                    </button>
                  )}
                </div>
                <button type="button" className="y7-btn" onClick={goToNextSlide} disabled={controlBusy || slides.length === 0}>
                  Next
                </button>
              </div>
              <SlideTimeline
                slides={slides}
                pointerId={pointerSlideId}
                activeId={activeSlideId}
                accessibleSet={accessibleSet}
                onSelect={handleTimelineSelect}
                disableFuture={!isTeacher}
                label="Live deck timeline"
              />
            </>
          )}
        </main>
        <aside className="y7-live-sidebar">
          {isTeacher ? (
            <>
              <TeacherPanel
                classes={teacherData?.classes || []}
                selectedClassId={selectedClassId}
                onSelectClass={handleSelectClass}
                onStart={handleStart}
                onAdvance={goToNextSlide}
                onPause={handlePause}
                onReset={handleReset}
                onRefresh={() => refreshClassSnapshot(selectedClassId)}
                deckSummary={{ ...deckSummary, slideCount: slides.length }}
                liveState={classSnapshot}
                controlBusy={controlBusy}
              />
              <LiveDashboard
                sessionId={classSnapshot?.pacing?.sessionId || classSnapshot?.sessionId || selectedClassId || null}
                classSize={classStudents.length}
              />
            </>
          ) : (
            <StudentPanel
              deckSummary={{ ...deckSummary, slideCount: slides.length }}
              liveState={studentSnapshot}
              onReturnToLive={() => setActiveSlideId(pointerSlideId)}
              canReturn={canReturnToLive}
              onJoinByCode={handleJoinByCode}
              joinMessage={joinMessage}
              joinCodeInput={joinCodeInput}
              setJoinCodeInput={setJoinCodeInput}
            />
          )}

          <LiveAssessmentPanel
            assessment={assessmentState}
            isVisible={
              isTeacher &&
              ["checkpoint", "assessment"].includes(pointerSlideMeta?.slide?.type) &&
              Boolean(selectedClassId)
            }
          />
        </aside>
      </div>
    </div>
  );
}