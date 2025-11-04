import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useGamification } from "../context/GamificationContext.jsx";
import { useSession } from "../hooks/useSession.js";
import { readUnitProgress, writeUnitProgress } from "../lib/progressStorage.js";
import MicroQuizSegment from "./segments/MicroQuizSegment.jsx";
import ActivitySegment from "./segments/activities/ActivitySegment.jsx";
import ContentSegment from "./segments/ContentSegment.jsx";
import DemoSegment from "./segments/DemoSegment.jsx";
import PythonPlaygroundSegment from "./segments/PythonPlaygroundSegment.jsx";
import AssessmentResultsModal from "./segments/AssessmentResultsModal.jsx";
import ReflectionSegment from "./segments/ReflectionSegment.jsx";
import LiveAssessmentDashboard from "./segments/LiveAssessmentDashboard.jsx";
import "./GamifiedModulePage.css";
import { useTeacherMode } from "../context/TeacherModeContext.jsx";
import { updateClassPacing, getClassPacing, syncStudentProgress, updateLiveAssessmentStatus } from "../lib/api.js";

const STORAGE_VERSION = 2;
const SYNC_DEBOUNCE_MS = 2500;

function normalizeAssessment(raw = null) {
  if (!raw || typeof raw !== "object") {
    return {
      status: "not-started",
      responses: {},
      marks: {},
      teacherNotes: {},
      updatedAt: null,
    };
  }
  return {
    status: raw.status ?? "not-started",
    responses: raw.responses ?? {},
    marks: raw.marks ?? {},
    teacherNotes: raw.teacherNotes ?? {},
    updatedAt: raw.updatedAt ?? null,
  };
}

function buildInitialState(unit, profileKey) {
  const fallback = {
    version: STORAGE_VERSION,
    stages: {},
    reflections: {},
    planner: {},
    attempts: {},
    assessment: normalizeAssessment(),
  };

  if (typeof window === "undefined") return fallback;

  const { data } = readUnitProgress(unit.id, profileKey);
  if (!data || typeof data !== "object") {
    return fallback;
  }

  return {
    ...fallback,
    ...data,
    version: STORAGE_VERSION,
    assessment: normalizeAssessment(data.assessment),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "hydrate": {
      return {
        ...state,
        ...(action.payload ?? {}),
      };
    }
    case "segment-progress": {
      const { stageId, nextIndex, completed } = action.payload;
      const prevStage = state.stages?.[stageId] ?? { segmentIndex: 0, completed: false };
      const nextStage = {
        segmentIndex: Math.max(prevStage.segmentIndex, nextIndex),
        completed: completed ? true : prevStage.completed,
      };
      return {
        ...state,
        stages: {
          ...state.stages,
          [stageId]: nextStage,
        },
      };
    }
    case "reflection": {
      const { id, value } = action.payload;
      return {
        ...state,
        reflections: {
          ...state.reflections,
          [id]: value,
        },
      };
    }
    case "planner": {
      const { id, value } = action.payload;
      return {
        ...state,
        planner: {
          ...state.planner,
          [id]: value,
        },
      };
    }
    case "attempt": {
      const { segmentId, success } = action.payload;
      const correctCount = Number(action.payload?.correctCount ?? 0);
      const totalCount = Number(action.payload?.totalCount ?? 0);
      const current = state.attempts?.[segmentId] ?? { count: 0, correct: 0 };
      const updated = {
        count: current.count + 1,
        correct: current.correct + (success ? 1 : 0),
        lastResult: success ? "correct" : "incorrect",
        last: {
          correct: correctCount,
          total: totalCount,
          success: Boolean(success),
        },
        updatedAt: Date.now(),
      };
      return {
        ...state,
        attempts: {
          ...state.attempts,
          [segmentId]: updated,
        },
      };
    }
    case "assessment-response": {
      const { questionId, value } = action.payload;
      const assessment = normalizeAssessment(state.assessment);
      return {
        ...state,
        assessment: {
          ...assessment,
          responses: {
            ...assessment.responses,
            [questionId]: value,
          },
          updatedAt: Date.now(),
        },
      };
    }
    case "assessment-mark": {
      const { questionId, value } = action.payload;
      const assessment = normalizeAssessment(state.assessment);
      return {
        ...state,
        assessment: {
          ...assessment,
          marks: {
            ...assessment.marks,
            [questionId]: value,
          },
          updatedAt: Date.now(),
        },
      };
    }
    case "assessment-note": {
      const { questionId, value } = action.payload;
      const assessment = normalizeAssessment(state.assessment);
      return {
        ...state,
        assessment: {
          ...assessment,
          teacherNotes: {
            ...assessment.teacherNotes,
            [questionId]: value,
          },
          updatedAt: Date.now(),
        },
      };
    }
    case "assessment-status": {
      const { status } = action.payload;
      const assessment = normalizeAssessment(state.assessment);
      return {
        ...state,
        assessment: {
          ...assessment,
          status:
            typeof status === "string" && status.length > 0
              ? status
              : assessment.status,
          updatedAt: Date.now(),
        },
      };
    }
    default:
      return state;
  }
}

export default function GamifiedModulePage({ unit, classId: teacherClassId }) {
  const { state: gamificationState, awardXp, resetStreak } = useGamification();
  const { session } = useSession();
  const { isPresentationMode, togglePresentationMode, setCurrentPacing } = useTeacherMode();
  const isTeacher = session?.user?.role === "teacher" || session?.user?.role === "admin";
  const profileKey = session?.user?.username?.toLowerCase() || "guest";
  const [paceStatus, setPaceStatus] = useState({});
  const [classPacing, setClassPacing] = useState(null);
  const classId = isTeacher ? teacherClassId : session?.user?.classId;

  const [progress, dispatch] = useReducer(
    reducer,
    { unit, profileKey },
    ({ unit: initialUnit, profileKey: initialProfile }) => buildInitialState(initialUnit, initialProfile),
  );

  useEffect(() => {
    if (isTeacher || !classId || !session?.token) return;

    const fetchPacing = async () => {
      try {
        const pacingData = await getClassPacing(session.token, classId);
        setClassPacing(pacingData);
      } catch (error) {
        console.error("Failed to fetch class pacing:", error);
      }
    };

    fetchPacing();
  }, [isTeacher, classId, session?.token]);

  const profileRef = useRef(profileKey);
  const unitRef = useRef(unit.id);

  useEffect(() => {
    if (profileRef.current === profileKey && unitRef.current === unit.id) {
      return;
    }
    const nextState = buildInitialState(unit, profileKey);
    dispatch({ type: "hydrate", payload: nextState });
    profileRef.current = profileKey;
    unitRef.current = unit.id;
  }, [profileKey, unit]);

  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [resultModal, setResultModal] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState(null);
  const previousLevelRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  const activeStage = unit.stages[activeStageIndex];

  useEffect(() => {
    if (typeof window === "undefined") return;
    writeUnitProgress(unit.id, profileKey, {
      ...progress,
      version: STORAGE_VERSION,
    });
    if (isTeacher) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await syncStudentProgress(session.token, {
          unitId: unit.id,
          progress,
        });
      } catch (error) {
        console.warn("Failed to sync student progress to backend", error);
      }
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [progress, unit.id, profileKey, session?.token, isTeacher]);

  useEffect(() => {
    const firstIncomplete = unit.stages.findIndex((stage) => !progress.stages?.[stage.id]?.completed);
    if (firstIncomplete !== -1) {
      setActiveStageIndex(firstIncomplete);
    }
  }, [progress.stages, unit.stages]);

  const overallXp = gamificationState.xp ?? 0;
  const level = gamificationState.level ?? 1;
  const xpToNext = level * 150;
  const currentLevelFloor = (level - 1) * 150;
  const levelProgress = Math.min(1, (overallXp - currentLevelFloor) / Math.max(1, xpToNext - currentLevelFloor));

  // Initialize previous level on mount
  useEffect(() => {
    if (previousLevelRef.current === null) {
      previousLevelRef.current = level;
    }
  }, [level]);

  // Detect level up
  useEffect(() => {
    if (previousLevelRef.current !== null && level > previousLevelRef.current) {
      setLevelUpModal({
        oldLevel: previousLevelRef.current,
        newLevel: level,
        xp: overallXp,
      });
      previousLevelRef.current = level;
    } else if (previousLevelRef.current === null) {
      previousLevelRef.current = level;
    }
  }, [level, overallXp]);

  const handleSegmentAdvance = (stageId, nextIndex, completed) => {
    dispatch({ type: "segment-progress", payload: { stageId, nextIndex, completed } });
  };

  const handleReflectionSave = (id, value) => {
    dispatch({ type: "reflection", payload: { id, value } });
  };

  const handlePlannerSave = (id, value) => {
    dispatch({ type: "planner", payload: { id, value } });
  };

  const handleAttempt = (segmentId, payload) => {
    const normalized = payload && typeof payload === "object" ? payload : { success: Boolean(payload) };
    const success = Boolean(normalized.success);
    const correctCount = Number(normalized.correctCount ?? (success ? normalized.totalCount ?? 0 : 0));
    const totalCount = Number(normalized.totalCount ?? normalized.correctCount ?? 0);

    const resolvedTotal = Number.isFinite(totalCount) && totalCount > 0 ? totalCount : correctCount;
    const previousAttempts = progress.attempts?.[segmentId]?.count ?? 0;
    const nextAttemptCount = previousAttempts + 1;
    dispatch({
      type: "attempt",
      payload: {
        segmentId,
        success,
        correctCount,
        totalCount: resolvedTotal,
      },
    });

    if (!isTeacher && session?.user?.role === "student" && session?.token) {
      const studentClassId = session.user?.classId;
      if (studentClassId) {
        const status = success ? "completed" : "in-progress";
        const scoreValue = resolvedTotal > 0 ? Math.round((correctCount / resolvedTotal) * 100) : success ? 100 : null;
        updateLiveAssessmentStatus(session.token, {
          classId: studentClassId,
          unitId: unit.id,
          segmentId,
          attempts: nextAttemptCount,
          status,
          score: scoreValue,
        }).catch((error) => {
          console.warn("Failed to update live assessment status", error);
        });
      }
    }

    if (success) {
      if (correctCount > 0) {
        const baseXp = correctCount * 10;
        const streakBonus = Math.floor((gamificationState.streak + 1) / 3) * 5;
        const xpAward = baseXp + streakBonus;
        awardXp({
          xpGained: xpAward,
          correct: correctCount,
          attempts: resolvedTotal || correctCount,
          spriteUnlocks: normalized.spriteUnlocks,
        });
        setResultModal({
          ...normalized,
          success: true,
          xpAward,
          correctCount,
          totalCount: resolvedTotal,
        });
      } else if (normalized.onAdvance) {
        // Allow silent success without XP (e.g. informational segments)
        normalized.onAdvance();
      }
    } else {
      resetStreak();
      setResultModal({
        ...normalized,
        success: false,
        correctCount,
        totalCount: resolvedTotal,
        xpAward: 0,
      });
    }
  };

  const handleAssessmentResponseChange = (questionId, value) => {
    dispatch({ type: "assessment-response", payload: { questionId, value } });
  };

  const handleAssessmentMarkChange = (questionId, value) => {
    dispatch({ type: "assessment-mark", payload: { questionId, value } });
  };

  const handleAssessmentNoteChange = (questionId, value) => {
    dispatch({ type: "assessment-note", payload: { questionId, value } });
  };

  const overallCompletion = useMemo(() => {
    const total = unit.stages.length;
    const completed = Object.values(progress.stages ?? {}).filter((entry) => entry.completed).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [unit.stages.length, progress.stages]);

  const allStagesComplete = useMemo(
    () => unit.stages.every((stage) => progress.stages?.[stage.id]?.completed),
    [unit.stages, progress.stages],
  );

  const handleSetPace = async (stageId) => {
    if (!isTeacher || !classId) return false;
    setPaceStatus({ [stageId]: "setting" });
    try {
      await updateClassPacing(session.token, classId, { unitId: unit.id, lessonId: stageId });
      setCurrentPacing({ unitId: unit.id, lessonId: stageId });
      setPaceStatus({ [stageId]: "set" });
      setTimeout(() => setPaceStatus({ [stageId]: null }), 2000);
      return true;
    } catch {
      setPaceStatus({ [stageId]: "error" });
      setTimeout(() => setPaceStatus({ [stageId]: null }), 2000);
      return false;
    }
  };

  const handleTeacherAdvancePacingToStage = async (targetStageId) => {
    if (!targetStageId) return false;
    const ok = await handleSetPace(targetStageId);
    if (ok) {
      const targetIndex = unit.stages.findIndex((stage) => stage.id === targetStageId);
      if (targetIndex !== -1) {
        setActiveStageIndex(targetIndex);
      }
    }
    return ok;
  };

  return (
    <div className={`gamified-page ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${headerCollapsed ? "header-collapsed" : ""} ${isTeacher && isPresentationMode ? "presentation-mode" : ""}`}>
      <header className={`gamified-header ${headerCollapsed ? "is-collapsed" : ""}`}>
        <div className="gamified-header__main">
          <div>
            <span className="gamified-eyebrow">IB Computer Science · {unit.id}</span>
            <h1>{unit.title}</h1>
            {!headerCollapsed && (
              <>
                <p>{unit.guidingQuestion}</p>
                <div className="gamified-meta">
                  <span>{unit.hours?.sl}</span>
                  <span>{unit.hours?.hl}</span>
                </div>
              </>
            )}
          </div>
          {isTeacher ? (
            <div className="teacher-controls">
              <button onClick={togglePresentationMode} className="btn">
                {isPresentationMode ? "Exit Presentation" : "Enter Presentation"}
              </button>
            </div>
          ) : (
            <div className={`gamified-xp-card ${headerCollapsed ? "is-compact" : ""}`}>
              <button
                type="button"
                className="gamified-header-toggle"
                onClick={() => setHeaderCollapsed(!headerCollapsed)}
                aria-label={headerCollapsed ? "Expand header" : "Collapse header"}
              >
                {headerCollapsed ? "▼" : "▲"}
              </button>
              <div className="gamified-xp-card__top">
                <span className={`gamified-level-badge ${levelUpModal ? "level-up" : ""}`}>Lv {level}</span>
                {!headerCollapsed && (
                  <div className="gamified-xp-values">
                    <strong>{overallXp} XP</strong>
                    <span>Next level at {xpToNext} XP</span>
                  </div>
                )}
              </div>
              {!headerCollapsed && (
                <>
                  <div className="gamified-xp-bar">
                    <div style={{ width: `${levelProgress * 100}%` }} />
                  </div>
                  <span className="gamified-progress-summary">{overallCompletion}% unit completion</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="gamified-main">
        <nav className={`gamified-stages ${sidebarCollapsed ? "is-collapsed" : ""}`} aria-label="Stage navigation">
          <button
            type="button"
            className="gamified-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? "▶" : "◀"}
          </button>
          <ul>
            {unit.stages.map((stage, index) => {
              const state = progress.stages?.[stage.id];

              let unlocked;
              if (isTeacher) {
                unlocked = true;
              } else if (classPacing) {
                const paceIndex = unit.stages.findIndex(s => s.id === classPacing.lessonId);
                const isWithinPace = index <= paceIndex;
                unlocked = isWithinPace && (index === 0 || progress.stages?.[unit.stages[index - 1].id]?.completed);
              } else {
                unlocked = index === 0;
              }

              const isActive = index === activeStageIndex;
              const currentPaceStatus = paceStatus[stage.id];
              return (
                <li key={stage.id} className="gamified-stage-item">
                  <button
                    type="button"
                    className={`gamified-stage-link${isActive ? " is-active" : ""}${state?.completed ? " is-complete" : ""}${
                      !unlocked ? " is-locked" : ""
                    }`}
                    disabled={!unlocked}
                    onClick={() => unlocked && setActiveStageIndex(index)}
                  >
                    <span className="gamified-stage-title">{stage.title}</span>
                    <span className="gamified-stage-duration">{stage.duration}</span>
                  </button>
                  {isTeacher && (
                    <button
                      className={`set-pace-btn ${currentPaceStatus ? `set-pace-btn--${currentPaceStatus}` : ""}`}
                      onClick={() => handleSetPace(stage.id)}
                      disabled={currentPaceStatus === "setting"}
                    >
                      {currentPaceStatus === "setting" ? "Setting..." : currentPaceStatus === "set" ? "Pace Set!" : currentPaceStatus === "error" ? "Error" : "Set Pace"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="gamified-stage-viewer">
          <StagePlayer
            key={activeStage?.id}
            unit={unit}
            stage={activeStage}
            progress={progress}
            onAdvance={handleSegmentAdvance}
            onReflectionSave={handleReflectionSave}
            onPlannerSave={handlePlannerSave}
            onAttempt={handleAttempt}
            isTeacher={isTeacher}
            classId={classId}
            onAdvanceClassPace={handleTeacherAdvancePacingToStage}
          />
        </section>
      </main>

      {unit.assessment && (
        <AssessmentPanel
          unit={unit}
          assessmentState={progress.assessment}
          onResponseChange={handleAssessmentResponseChange}
          onMarkChange={handleAssessmentMarkChange}
          onTeacherNoteChange={handleAssessmentNoteChange}
          isTeacher={isTeacher}
          isUnlocked={allStagesComplete}
          completionPercentage={overallCompletion}
        />
      )}

      {resultModal && (
        <AssessmentResultsModal
          {...resultModal}
          onClose={() => setResultModal(null)}
          onContinue={() => {
            if (typeof resultModal.onAdvance === "function" && resultModal.success) {
              resultModal.onAdvance();
            }
            setResultModal(null);
          }}
        />
      )}

      {levelUpModal && (
        <LevelUpModal
          oldLevel={levelUpModal.oldLevel}
          newLevel={levelUpModal.newLevel}
          xp={levelUpModal.xp}
          onClose={() => setLevelUpModal(null)}
        />
      )}
    </div>
  );
}

function StagePlayer({
  unit,
  stage,
  progress,
  onAdvance,
  onReflectionSave,
  onPlannerSave,
  onAttempt,
  isTeacher,
  classId,
  onAdvanceClassPace,
}) {
  const segments = stage?.segments ?? [];
  const stageId = stage?.id;
  const stageProgress = stageId ? progress.stages?.[stageId] ?? {} : {};
  const initialIndex = Math.min(stageProgress.segmentIndex ?? 0, segments.length);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [teacherAssessmentView, setTeacherAssessmentView] = useState(false);
  const [advanceState, setAdvanceState] = useState("idle");
  const [advanceError, setAdvanceError] = useState(null);
  const stageContainerRef = useRef(null);
  const advanceTimeoutRef = useRef(null);

  useEffect(() => {
    setTeacherAssessmentView(false);
  }, [stageId, currentIndex]);

  useEffect(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    setAdvanceState("idle");
    setAdvanceError(null);
  }, [stageId]);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, stageId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = stageContainerRef.current;
    if (!node) return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    node.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [stageId, currentIndex]);

  if (!stage) {
    return (
      <div className="gamified-stage-complete">
        <h2>Select a stage</h2>
        <p>Choose a stage from the sidebar to get started.</p>
      </div>
    );
  }

  const currentSegment = segments[currentIndex];
  const isFormativeAssessment = currentSegment && (currentSegment.type === 'micro-quiz' || currentSegment.type === 'activity');
  const currentStageIndex = unit?.stages?.findIndex((item) => item.id === stageId) ?? -1;
  const nextStage = currentStageIndex >= 0 ? unit.stages[currentStageIndex + 1] : null;

  const handleComplete = () => {
    const nextIndex = Math.min(currentIndex + 1, segments.length);
    const stageComplete = nextIndex >= segments.length;
    setCurrentIndex((prev) => Math.min(prev + 1, segments.length));
    onAdvance(stage.id, nextIndex, stageComplete);
  };

  const handleBack = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleAdvancePacingForClass = async () => {
    if (!onAdvanceClassPace || !stageId) return;
    const targetStageId = nextStage?.id ?? stageId;
    setAdvanceState("pending");
    setAdvanceError(null);
    try {
      const ok = await onAdvanceClassPace(targetStageId, { fromStageId: stageId, isLastStage: !nextStage });
      if (!ok) {
        throw new Error("Unable to update class pacing");
      }
      setAdvanceState("success");
    } catch (error) {
      console.warn("Failed to advance class pacing", error);
      setAdvanceState("error");
      setAdvanceError(error?.message || "Unable to unlock next stage right now");
    } finally {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
      advanceTimeoutRef.current = setTimeout(() => {
        setAdvanceState("idle");
        setAdvanceError(null);
      }, 2000);
    }
  };


  if (isTeacher && isFormativeAssessment && !teacherAssessmentView) {
    return (
      <div className="gamified-stage" ref={stageContainerRef}>
        <LiveAssessmentDashboard
          classId={classId}
          unitId={unit.id}
          segment={currentSegment}
          stage={stage}
          isLastStage={!nextStage}
          nextStageTitle={nextStage?.title ?? null}
          advanceState={advanceState}
          advanceError={advanceError}
          onShowAssessment={() => setTeacherAssessmentView(true)}
          onAdvancePacing={handleAdvancePacingForClass}
        />
      </div>
    );
  }

  if (!currentSegment) {
    return (
      <div className="gamified-stage-complete">
        <h2>Stage complete!</h2>
        <p>Select the next stage from the sidebar or revisit segments to reinforce the concepts.</p>
      </div>
    );
  }

  return (
    <div className="gamified-stage" ref={stageContainerRef}>
      <header className="gamified-stage-header">
        <div>
          <span className="gamified-stage-eyebrow">Stage {stage.id}</span>
          <h2>{stage.title}</h2>
          <p>{stage.description}</p>
        </div>
        {isTeacher && isFormativeAssessment && teacherAssessmentView && (
          <button onClick={() => setTeacherAssessmentView(false)} className="btn btn--ghost">
            Back to Live Dashboard
          </button>
        )}
        <span className="gamified-stage-progress">
          {Math.min(currentIndex + 1, segments.length)} / {segments.length}
        </span>
      </header>
      <SegmentRenderer
        unit={unit}
        stage={stage}
        segment={currentSegment}
        onComplete={handleComplete}
        onBack={currentIndex > 0 ? handleBack : null}
        onReflectionSave={onReflectionSave}
        onPlannerSave={onPlannerSave}
        onAttempt={onAttempt}
        attempts={progress.attempts}
        reflections={progress.reflections}
        planner={progress.planner}
        isTeacher={isTeacher}
      />
    </div>
  );
}

function AssessmentPanel({
  unit,
  assessmentState,
  onResponseChange,
  onMarkChange,
  onTeacherNoteChange,
  isTeacher,
  isUnlocked,
  completionPercentage,
}) {
  const assessment = unit.assessment;
  const questions = assessment?.questions ?? [];
  const [expanded, setExpanded] = useState(false);
  const normalized = normalizeAssessment(assessmentState);

  const totalAwarded = useMemo(
    () =>
      Object.values(normalized.marks ?? {}).reduce((sum, value) => {
        const numeric = Number(value);
        return sum + (Number.isFinite(numeric) ? numeric : 0);
      }, 0),
    [normalized.marks],
  );

  const handleExport = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!assessment) {
    return null;
  }

  return (
    <section className="gamified-assessment">
      <article className="gamified-card gamified-assessment__card">
        <header className="gamified-assessment__header">
          <div>
            <h2>End-of-unit assessment</h2>
            <p className="muted">
              {assessment.duration} · {assessment.totalMarks} marks
            </p>
          </div>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => setExpanded((prev) => !prev)}
            disabled={!isUnlocked}
          >
            {expanded ? "Hide assessment" : "Open assessment"}
          </button>
        </header>

        {!isUnlocked && (
          <p className="gamified-assessment__lock">
            Complete all stages to unlock the assessment. You are {completionPercentage}% through the unit.
          </p>
        )}

        {expanded && isUnlocked && (
          <div className="gamified-assessment__body">
            <p>
              Answer each question in the space provided. Your work saves automatically on this device. Use the download
              button to export a PDF copy for your teacher.
            </p>
            <ol className="gamified-assessment__questions">
              {questions.map((question) => (
                <li key={question.id}>
                  <div className="gamified-assessment__prompt">
                    <p>{question.prompt}</p>
                    <span>{question.marks} marks</span>
                  </div>
                  <textarea
                    rows={6}
                    value={normalized.responses?.[question.id] ?? ""}
                    onChange={(event) => onResponseChange(question.id, event.target.value)}
                  />
                </li>
              ))}
            </ol>
            <div className="gamified-assessment__actions">
              <button type="button" className="btn btn--primary" onClick={handleExport}>
                Download as PDF
              </button>
            </div>

            {isTeacher ? (
              <aside className="gamified-assessment__teacher gamified-assessment__teacher--panel">
                <div className="gamified-assessment__teacher-header">
                  <h3>Teacher marking workspace</h3>
                  <span>
                    Total awarded: {totalAwarded} / {assessment.totalMarks}
                  </span>
                </div>
                <div className="gamified-assessment__teacher-grid">
                  {questions.map((question) => (
                    <div key={question.id} className="gamified-assessment__teacher-item">
                      <div className="gamified-assessment__teacher-meta">
                        <h4>{question.prompt}</h4>
                        <span>{question.marks} marks</span>
                      </div>
                      <label>
                        <span>Marks awarded</span>
                        <input
                          type="number"
                          min={0}
                          max={question.marks}
                          value={normalized.marks?.[question.id] ?? ""}
                          onChange={(event) => onMarkChange(question.id, event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Feedback</span>
                        <textarea
                          rows={3}
                          value={normalized.teacherNotes?.[question.id] ?? ""}
                          onChange={(event) => onTeacherNoteChange(question.id, event.target.value)}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </aside>
            ) : (
              <aside className="gamified-assessment__teacher gamified-assessment__teacher--hint">
                <h3>Teacher view</h3>
                <p>
                  Teachers can record marks and feedback from the dashboard. Export your responses to share a PDF copy
                  when requested.
                </p>
              </aside>
            )}
          </div>
        )}
      </article>
    </section>
  );
}

function LevelUpModal({ oldLevel, newLevel, xp, onClose }) {
  const confettiPieces = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    delay: `${i * 0.05}s`,
    offset: `${(Math.random() - 0.5) * 200}px`,
  }));

  return (
    <div className="level-up-modal-overlay" onClick={onClose}>
      <div className="level-up-modal" onClick={(e) => e.stopPropagation()}>
        <div className="level-up-modal__content">
          <div className="level-up-modal__confetti">
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className="confetti-piece"
                style={{
                  '--delay': piece.delay,
                  '--offset': piece.offset,
                }}
              />
            ))}
          </div>
          <div className="level-up-modal__icon">🎉</div>
          <h2 className="level-up-modal__title">Level Up!</h2>
          <div className="level-up-modal__levels">
            <span className="level-up-modal__old-level">Lv {oldLevel}</span>
            <span className="level-up-modal__arrow">→</span>
            <span className="level-up-modal__new-level">Lv {newLevel}</span>
          </div>
          <p className="level-up-modal__message">Congratulations! You&apos;ve reached Level {newLevel}!</p>
          <div className="level-up-modal__xp">
            <strong>{xp} XP</strong>
            <span>Total Experience</span>
          </div>
          <button type="button" className="level-up-modal__button" onClick={onClose}>
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}

function SegmentRenderer({
  unit,
  stage,
  segment,
  onComplete,
  onBack,
  onReflectionSave,
  onPlannerSave,
  onAttempt,
  attempts,
  reflections,
  planner,
  isTeacher,
}) {
  const attemptStats = attempts?.[segment.id];
  const sharedProps = { segment, onComplete, onBack, attemptStats, onAttempt, isTeacher, unit, stage };

  switch (segment.type) {
    case "content":
    case "list":
    case "table":
    case "accordion":
      return <ContentSegment {...sharedProps} />;
    case "micro-quiz":
      return <MicroQuizSegment {...sharedProps} />;
    case "activity":
      return <ActivitySegment {...sharedProps} plannerValues={planner} onPlannerSave={onPlannerSave} />;
    case "demo":
      return <DemoSegment {...sharedProps} />;
    case "python-playground":
      return <PythonPlaygroundSegment {...sharedProps} />;
    case "reflection":
      return (
        <ReflectionSegment
          {...sharedProps}
          onSave={onReflectionSave}
          initialValue={reflections?.[segment.id] ?? ""}
        />
      );
    default:
      return <ContentSegment {...sharedProps} />;
  }
}
