import { useEffect, useMemo, useReducer, useState } from "react";
import { useGamification } from "../context/GamificationContext.jsx";
import { useSession } from "../hooks/useSession.js";
import MicroQuizSegment from "./segments/MicroQuizSegment.jsx";
import ActivitySegment from "./segments/activities/ActivitySegment.jsx";
import ContentSegment from "./segments/ContentSegment.jsx";
import DemoSegment from "./segments/DemoSegment.jsx";
import PythonPlaygroundSegment from "./segments/PythonPlaygroundSegment.jsx";
import AssessmentResultsModal from "./segments/AssessmentResultsModal.jsx";
import ReflectionSegment from "./segments/ReflectionSegment.jsx";
import "./GamifiedModulePage.css";

const STORAGE_VERSION = 2;

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

function buildInitialState(unit) {
  const fallback = {
    version: STORAGE_VERSION,
    stages: {},
    reflections: {},
    planner: {},
    attempts: {},
    assessment: normalizeAssessment(),
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey(unit.id));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION) return fallback;
    return {
      ...fallback,
      ...parsed,
      assessment: normalizeAssessment(parsed.assessment),
    };
  } catch {
    return fallback;
  }
}

function storageKey(unitId) {
  return `ibcs.${unitId.toLowerCase()}.progress`;
}

function reducer(state, action) {
  switch (action.type) {
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
      const current = state.attempts?.[segmentId] ?? { count: 0, correct: 0 };
      const updated = {
        count: current.count + 1,
        correct: current.correct + (success ? 1 : 0),
        lastResult: success ? "correct" : "incorrect",
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

export default function GamifiedModulePage({ unit }) {
  const { state: gamificationState, awardXp, resetStreak } = useGamification();
  const { session } = useSession();
  const isTeacher = session?.user?.role === "teacher" || session?.user?.role === "admin";

  const [progress, dispatch] = useReducer(reducer, buildInitialState(unit));
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [resultModal, setResultModal] = useState(null);

  const activeStage = unit.stages[activeStageIndex];

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      storageKey(unit.id),
      JSON.stringify({
        ...progress,
        version: STORAGE_VERSION,
      }),
    );
  }, [progress, unit.id]);

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

    dispatch({ type: "attempt", payload: { segmentId, success } });

    if (success) {
      if (correctCount > 0) {
        const baseXp = correctCount * 10;
        const streakBonus = Math.floor((gamificationState.streak + 1) / 3) * 5;
        const xpAward = baseXp + streakBonus;
        awardXp({
          xpGained: xpAward,
          correct: correctCount,
          attempts: totalCount || correctCount,
          spriteUnlocks: normalized.spriteUnlocks,
        });
        setResultModal({
          ...normalized,
          success: true,
          xpAward,
          correctCount,
          totalCount: totalCount || correctCount,
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
        totalCount,
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

  return (
    <div className="gamified-page">
      <header className="gamified-header">
        <div>
          <span className="gamified-eyebrow">IB Computer Science · {unit.id}</span>
          <h1>{unit.title}</h1>
          <p>{unit.guidingQuestion}</p>
          <div className="gamified-meta">
            <span>{unit.hours?.sl}</span>
            <span>{unit.hours?.hl}</span>
          </div>
        </div>
        <div className="gamified-xp-card">
          <div className="gamified-xp-card__top">
            <span className="gamified-level-badge">Lv {level}</span>
            <div className="gamified-xp-values">
              <strong>{overallXp} XP</strong>
              <span>Next level at {xpToNext} XP</span>
            </div>
          </div>
          <div className="gamified-xp-bar">
            <div style={{ width: `${levelProgress * 100}%` }} />
          </div>
          <span className="gamified-progress-summary">{overallCompletion}% unit completion</span>
        </div>
      </header>

      <main className="gamified-main">
        <nav className="gamified-stages" aria-label="Stage navigation">
          <ul>
            {unit.stages.map((stage, index) => {
              const state = progress.stages?.[stage.id];
              const unlocked = isTeacher || index === 0 || progress.stages?.[unit.stages[index - 1].id]?.completed;
              const isActive = index === activeStageIndex;
              return (
                <li key={stage.id}>
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
    </div>
  );
}

function StagePlayer({ unit, stage, progress, onAdvance, onReflectionSave, onPlannerSave, onAttempt, isTeacher }) {
  const segments = stage?.segments ?? [];
  const stageId = stage?.id;
  const stageProgress = stageId ? progress.stages?.[stageId] ?? {} : {};
  const initialIndex = Math.min(stageProgress.segmentIndex ?? 0, segments.length);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, stageId]);

  if (!stage) {
    return (
      <div className="gamified-stage-complete">
        <h2>Select a stage</h2>
        <p>Choose a stage from the sidebar to get started.</p>
      </div>
    );
  }

  const currentSegment = segments[currentIndex];

  const handleComplete = () => {
    const nextIndex = Math.min(currentIndex + 1, segments.length);
    const stageComplete = nextIndex >= segments.length;
    setCurrentIndex((prev) => Math.min(prev + 1, segments.length));
    onAdvance(stage.id, nextIndex, stageComplete);
  };

  const handleBack = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (!currentSegment) {
    return (
      <div className="gamified-stage-complete">
        <h2>Stage complete!</h2>
        <p>Select the next stage from the sidebar or revisit segments to reinforce the concepts.</p>
      </div>
    );
  }

  return (
    <div className="gamified-stage">
      <header className="gamified-stage-header">
        <div>
          <span className="gamified-stage-eyebrow">Stage {stage.id}</span>
          <h2>{stage.title}</h2>
          <p>{stage.description}</p>
        </div>
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
