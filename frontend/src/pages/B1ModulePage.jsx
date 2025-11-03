import { useEffect, useMemo, useState } from "react";
import b1Unit from "../content/b1ComputationalThinking.jsx";
import { useSession } from "../hooks/useSession.js";
import "./B1ModulePage.css";

const STORAGE_KEY = "ibcs.b1.progress";

function cn(base, modifiers = {}) {
  const classes = [base];
  Object.entries(modifiers).forEach(([key, value]) => {
    if (value) classes.push(key);
  });
  return classes.join(" ");
}

function loadProgress() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse B1 progress", error);
    return null;
  }
}

function buildStageState(existing = {}) {
  const stageState = {};
  for (const stage of b1Unit.stages) {
    const prev = existing[stage.id] ?? {};
    stageState[stage.id] = {
      segmentIndex: typeof prev.segmentIndex === "number" ? prev.segmentIndex : 0,
      completed: Boolean(prev.completed),
    };
  }
  return stageState;
}

function normaliseAssessment(existing = {}) {
  return {
    status: existing.status ?? "not-started",
    responses: existing.responses ?? {},
    marks: existing.marks ?? {},
    teacherNotes: existing.teacherNotes ?? {},
  };
}

function normaliseProgress(raw) {
  const base = raw ?? {};
  return {
    stages: buildStageState(base.stages ?? {}),
    reflections: base.reflections ?? {},
    planner: base.planner ?? {},
    attempts: base.attempts ?? {},
    assessment: normaliseAssessment(base.assessment ?? {}),
  };
}

function saveProgress(progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("Failed to persist B1 progress", error);
  }
}

function isStageUnlocked(stagesState, stageId, index, isTeacher) {
  if (isTeacher) return true;
  if (index === 0) return true;
  const previousStage = b1Unit.stages[index - 1];
  const prevState = stagesState[previousStage.id];
  return Boolean(prevState?.completed);
}

function formatPercentage(value) {
  return `${Math.round(value * 100)}%`;
}

function computeOverallProgress(progress) {
  const completed = Object.values(progress.stages).filter((entry) => entry.completed).length;
  return completed / b1Unit.stages.length;
}

function B1ModulePage() {
  const { session } = useSession();
  const role = session?.user?.role ?? null;
  const isTeacher = role === "teacher" || role === "admin";

  const [progress, setProgress] = useState(() => normaliseProgress(loadProgress()));

  const firstIncompleteIndex = useMemo(() => {
    return b1Unit.stages.findIndex((stage) => !progress.stages[stage.id]?.completed);
  }, [progress.stages]);

  const [activeStageIndex, setActiveStageIndex] = useState(() =>
    firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex,
  );

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    setActiveStageIndex(firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex);
  }, [firstIncompleteIndex]);

  const handleSegmentAdvance = (stageId, nextIndex, isStageComplete) => {
    setProgress((prev) => {
      const prevStage = prev.stages[stageId] ?? { segmentIndex: 0, completed: false };
      const updatedStage = {
        segmentIndex: Math.max(prevStage.segmentIndex, nextIndex),
        completed: isStageComplete ? true : prevStage.completed,
      };
      return {
        ...prev,
        stages: {
          ...prev.stages,
          [stageId]: updatedStage,
        },
      };
    });
  };

  const handleReflectionSave = (id, text) => {
    setProgress((prev) => ({
      ...prev,
      reflections: {
        ...prev.reflections,
        [id]: text,
      },
    }));
  };

  const handlePlannerSave = (panelId, value) => {
    setProgress((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        [panelId]: value,
      },
    }));
  };

  const handleAttempt = (segmentId, success) => {
    setProgress((prev) => {
      const current = prev.attempts?.[segmentId] ?? { count: 0, correct: 0 };
      const updated = {
        count: current.count + 1,
        correct: current.correct + (success ? 1 : 0),
        lastResult: success ? "correct" : "incorrect",
        updatedAt: Date.now(),
      };
      return {
        ...prev,
        attempts: {
          ...prev.attempts,
          [segmentId]: updated,
        },
      };
    });
  };

  const overallProgress = computeOverallProgress(progress);

  const activeStage = b1Unit.stages[activeStageIndex];

  return (
    <div className="b1-page">
      <header className="b1-hero">
        <div>
          <span className="b1-hero__eyebrow">IB Computer Science · B1</span>
          <h1>{b1Unit.title}</h1>
          <p>{b1Unit.guidingQuestion}</p>
          <div className="b1-hero__meta">
            <span>{b1Unit.hours.sl}</span>
            <span>{b1Unit.hours.hl}</span>
          </div>
        </div>
        <div className="b1-progress-summary">
          <span className="b1-progress-summary__label">Overall progress</span>
          <strong>{formatPercentage(overallProgress)}</strong>
          <div className="b1-progress-summary__bar" aria-hidden="true">
            <div style={{ width: `${overallProgress * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="b1-main">
        <nav className="b1-stages" aria-label="Stage navigation">
          <ul>
            {b1Unit.stages.map((stage, index) => {
              const state = progress.stages[stage.id];
              const unlocked = isStageUnlocked(progress.stages, stage.id, index, isTeacher);
              const isActive = index === activeStageIndex;
              return (
                <li key={stage.id}>
                  <button
                    type="button"
                    className={cn("b1-stage-link", {
                      "is-active": isActive,
                      "is-complete": state?.completed,
                      "is-locked": !unlocked,
                    })}
                    onClick={() => {
                      if (unlocked) setActiveStageIndex(index);
                    }}
                    disabled={!unlocked}
                  >
                    <span className="b1-stage-link__title">{stage.title}</span>
                    <span className="b1-stage-link__duration">{stage.duration}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="b1-stage-viewer">
          <StagePlayer
            stage={activeStage}
            stageState={progress.stages[activeStage.id]}
            onAdvance={handleSegmentAdvance}
            onReflectionSave={handleReflectionSave}
            reflectionValues={progress.reflections}
            plannerValues={progress.planner}
            onPlannerSave={handlePlannerSave}
            attempts={progress.attempts}
            onAttempt={handleAttempt}
            isTeacher={isTeacher}
          />
        </section>
      </main>

      <AssessmentPanel progress={progress} setProgress={setProgress} isTeacher={isTeacher} />
    </div>
  );
}

function StagePlayer({
  stage,
  stageState,
  onAdvance,
  onReflectionSave,
  reflectionValues,
  plannerValues,
  onPlannerSave,
  attempts,
  onAttempt,
  isTeacher,
}) {
  const [currentIndex, setCurrentIndex] = useState(() => stageState?.segmentIndex ?? 0);

  useEffect(() => {
    setCurrentIndex(() => stageState?.segmentIndex ?? 0);
  }, [stageState?.segmentIndex, stage.id]);

  const segments = stage.segments ?? [];
  const currentSegment = segments[Math.min(currentIndex, segments.length - 1)];

  const handleSegmentComplete = () => {
    const nextIndex = Math.min(currentIndex + 1, segments.length);
    const stageComplete = nextIndex >= segments.length;
    setCurrentIndex((prev) => Math.min(prev + 1, segments.length - 1));
    onAdvance(stage.id, nextIndex, stageComplete);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const total = segments.length;
  const displayIndex = Math.min(currentIndex, total - 1);

  return (
    <div className="b1-stage">
      <header className="b1-stage__header">
        <div>
          <span className="b1-stage__eyebrow">Stage {stage.id}</span>
          <h2>{stage.title}</h2>
          <p>{stage.description}</p>
        </div>
        <span className="b1-stage__progress">
          {displayIndex + 1} / {total}
        </span>
      </header>

      {currentSegment ? (
        <SegmentRenderer
          key={currentSegment.id}
          segment={currentSegment}
          onComplete={handleSegmentComplete}
          onBack={displayIndex > 0 ? handlePrevious : null}
          reflections={reflectionValues}
          onReflectionSave={onReflectionSave}
          plannerValues={plannerValues}
          onPlannerSave={onPlannerSave}
          attempts={attempts}
          onAttempt={onAttempt}
          isTeacher={isTeacher}
        />
      ) : (
        <div className="b1-stage__complete">
          <p>Stage complete! Use the navigation to continue with the next stage.</p>
        </div>
      )}
    </div>
  );
}

function SegmentRenderer({
  segment,
  onComplete,
  onBack,
  reflections,
  onReflectionSave,
  plannerValues,
  onPlannerSave,
  attempts,
  onAttempt,
  isTeacher,
}) {
  const attemptStats = attempts?.[segment.id];
  const attemptHandler = typeof onAttempt === "function" ? onAttempt : () => {};
  const sharedProps = { segment, onComplete, onBack, isTeacher };
  switch (segment.type) {
    case "content":
      return <ContentSegment {...sharedProps} />;
    case "list":
      return <ListSegment {...sharedProps} />;
    case "vocabulary":
      return <VocabularySegment {...sharedProps} />;
    case "table":
      return <TableSegment {...sharedProps} />;
    case "worked-example":
      return <WorkedExampleSegment {...sharedProps} />;
    case "accordion":
      return <AccordionSegment {...sharedProps} />;
    case "activity":
      return (
        <ActivitySegment
          {...sharedProps}
          plannerValues={plannerValues}
          onPlannerSave={onPlannerSave}
          attemptStats={attemptStats}
          onAttempt={attemptHandler}
        />
      );
    case "checkpoint":
      return <CheckpointSegment {...sharedProps} attemptStats={attemptStats} onAttempt={attemptHandler} />;
    case "reflection":
      return (
        <ReflectionSegment
          {...sharedProps}
          reflections={reflections}
          onReflectionSave={onReflectionSave}
        />
      );
    default:
      return (
        <ContentSegment
          {...sharedProps}
          segment={{ ...segment, heading: segment.heading ?? "Content", body: segment.body ?? null }}
        />
      );
  }
}

function SegmentNav({ onBack, onComplete, completeLabel = "Continue" }) {
  return (
    <div className="b1-segment-nav">
      {onBack ? (
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
      ) : (
        <span />
      )}
      <button type="button" className="btn btn--primary" onClick={onComplete}>
        {completeLabel}
      </button>
    </div>
  );
}

function ContentSegment({ segment, onComplete, onBack }) {
  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
      </header>
      <div className="b1-card__body">{segment.body}</div>
      <SegmentNav onBack={onBack} onComplete={onComplete} />
    </article>
  );
}

function ListSegment({ segment, onComplete, onBack }) {
  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
      </header>
      <div className="b1-card__body b1-card__body--list">
        {segment.items?.map((item) => (
          <div key={item.title} className="b1-list-item">
            <h4>{item.title}</h4>
            <div>{item.body}</div>
          </div>
        ))}
      </div>
      <SegmentNav onBack={onBack} onComplete={onComplete} />
    </article>
  );
}

function VocabularySegment({ segment, onComplete, onBack }) {
  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
        <p>Tap a term to reveal its definition.</p>
      </header>
      <details className="b1-vocab" open>
        <summary className="sr-only">Vocabulary list</summary>
        <div className="b1-vocab__grid">
          {segment.entries?.map((entry) => (
            <div key={entry.term} className="b1-vocab__item">
              <span className="b1-vocab__term">{entry.term}</span>
              <span className="b1-vocab__definition">{entry.definition}</span>
            </div>
          ))}
        </div>
      </details>
      <SegmentNav onBack={onBack} onComplete={onComplete} />
    </article>
  );
}

function TableSegment({ segment, onComplete, onBack }) {
  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
      </header>
      <div className="b1-table-wrapper">
        <table>
          <thead>
            <tr>
              {segment.columns?.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segment.rows?.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SegmentNav onBack={onBack} onComplete={onComplete} />
    </article>
  );
}

function WorkedExampleSegment({ segment, onComplete, onBack }) {
  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
      </header>
      <div className="b1-table-wrapper">
        <table>
          <tbody>
            {segment.rows?.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SegmentNav onBack={onBack} onComplete={onComplete} />
    </article>
  );
}

function AccordionSegment({ segment, onComplete, onBack }) {
  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
      </header>
      <div className="b1-accordion">
        {segment.items?.map((item, index) => (
          <details key={index} open={index === 0}>
            <summary>{item.title}</summary>
            <div>{item.body}</div>
          </details>
        ))}
      </div>
      <SegmentNav onBack={onBack} onComplete={onComplete} />
    </article>
  );
}

function ActivitySegment({
  segment,
  onComplete,
  onBack,
  plannerValues,
  onPlannerSave,
  isTeacher,
  attemptStats,
  onAttempt,
}) {
  const attemptHandler = typeof onAttempt === "function" ? onAttempt : () => {};
  switch (segment.activityType) {
    case "matching":
      return (
        <MatchingActivity
          segment={segment}
          onComplete={onComplete}
          onBack={onBack}
          isTeacher={isTeacher}
          attemptStats={attemptStats}
          onAttempt={attemptHandler}
        />
      );
    case "ordering":
      return (
        <OrderingActivity
          segment={segment}
          onComplete={onComplete}
          onBack={onBack}
          isTeacher={isTeacher}
          attemptStats={attemptStats}
          onAttempt={attemptHandler}
        />
      );
    case "fill-gaps":
    case "fill":
      return (
        <FillGapsActivity
          segment={segment}
          onComplete={onComplete}
          onBack={onBack}
          isTeacher={isTeacher}
          attemptStats={attemptStats}
          onAttempt={attemptHandler}
        />
      );
    case "planner":
      return (
        <PlannerActivity
          segment={segment}
          onComplete={onComplete}
          onBack={onBack}
          plannerValues={plannerValues}
          onPlannerSave={onPlannerSave}
          isTeacher={isTeacher}
          attemptStats={attemptStats}
          onAttempt={attemptHandler}
        />
      );
    default:
      return (
        <article className="b1-card">
          <header>
            <h3>{segment.heading}</h3>
          </header>
          <p>This activity is coming soon.</p>
          <SegmentNav onBack={onBack} onComplete={onComplete} />
        </article>
      );
  }
}

function AttemptBadge({ attemptStats }) {
  if (!attemptStats) return null;
  return (
    <span className="b1-attempt-badge">
      Attempts: {attemptStats.count}
      {attemptStats.count > 0 && (
        <span className="b1-attempt-badge__detail">
          {" "}
          · Correct: {attemptStats.correct}/{attemptStats.count}
        </span>
      )}
    </span>
  );
}

function MatchingActivity({ segment, onComplete, onBack, isTeacher, attemptStats, onAttempt }) {
  const [answers, setAnswers] = useState(() =>
    segment.pairs.map(() => ({
      selection: "",
    })),
  );
  const [feedback, setFeedback] = useState(null);

  const options = segment.pairs.map((pair) => pair.example);

  function handleSubmit() {
    const allAnswered = answers.every((answer) => answer.selection);
    if (!allAnswered) {
      setFeedback("Select an example for every term.");
      return;
    }
    const isCorrect = answers.every((answer, index) => answer.selection === segment.pairs[index].example);
    onAttempt(segment.id, isCorrect);
    if (!isCorrect) {
      setFeedback("Check the matches again—something doesn’t align.");
      return;
    }
    setFeedback("Great! All examples match.");
    onComplete();
  }

  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
        <p>{segment.instructions}</p>
        <AttemptBadge attemptStats={attemptStats} />
      </header>
      <div className="b1-matching">
        {segment.pairs.map((pair, index) => (
          <label key={pair.term}>
            <span>{pair.term}</span>
            <select
              value={answers[index].selection}
              onChange={(event) => {
                const value = event.target.value;
                setAnswers((prev) => {
                  const next = [...prev];
                  next[index] = { selection: value };
                  return next;
                });
              }}
            >
              <option value="">Select example…</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="b1-segment-nav">
        {onBack ? (
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <div className="b1-segment-nav__actions">
          {isTeacher && (
            <button type="button" className="btn btn--outline" onClick={onComplete}>
              Mark complete
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={handleSubmit}>
            Check answers
          </button>
        </div>
      </div>
      {feedback && (
        <p role="status" className="b1-feedback">
          {feedback}
        </p>
      )}
    </article>
  );
}

function OrderingActivity({ segment, onComplete, onBack, isTeacher, attemptStats, onAttempt }) {
  const [order, setOrder] = useState(() => segment.items.map(() => ""));
  const [feedback, setFeedback] = useState(null);
  const numbers = segment.items.map((_, index) => String(index + 1));

  function handleSubmit() {
    const filled = order.every((value) => value);
    if (!filled) {
      setFeedback("Assign an order position to each statement.");
      return;
    }
    const isUnique = new Set(order).size === order.length;
    if (!isUnique) {
      setFeedback("Use each number once.");
      return;
    }
    const correct = segment.items.every((_, index) => order[index] === numbers[index]);
    onAttempt(segment.id, correct);
    if (!correct) {
      setFeedback("Review the sequence — there is a mismatch.");
      return;
    }
    setFeedback("Sequence looks great!");
    onComplete();
  }

  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
        <p>{segment.instructions}</p>
        <AttemptBadge attemptStats={attemptStats} />
      </header>
      <ol className="b1-ordering">
        {segment.items.map((item, index) => (
          <li key={item}>
            <span>{item}</span>
            <select
              aria-label={`Order for item ${index + 1}`}
              value={order[index]}
              onChange={(event) => {
                const value = event.target.value;
                setOrder((prev) => {
                  const next = [...prev];
                  next[index] = value;
                  return next;
                });
              }}
            >
              <option value="">Position…</option>
              {numbers.map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ol>
      <div className="b1-segment-nav">
        {onBack ? (
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <div className="b1-segment-nav__actions">
          {isTeacher && (
            <button type="button" className="btn btn--outline" onClick={onComplete}>
              Mark complete
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={handleSubmit}>
            Check order
          </button>
        </div>
      </div>
      {feedback && (
        <p role="status" className="b1-feedback">
          {feedback}
        </p>
      )}
    </article>
  );
}

function FillGapsActivity({ segment, onComplete, onBack, isTeacher, attemptStats, onAttempt }) {
  const rows = segment.rows ?? [];
  const [responses, setResponses] = useState(() => rows.map(() => ""));
  const [feedback, setFeedback] = useState(null);

  function normalise(value) {
    return value.trim().toLowerCase();
  }

  function handleSubmit() {
    const filled = responses.every((value) => value.trim().length > 0);
    if (!filled) {
      setFeedback("Answer every prompt before checking.");
      return;
    }
    const correct = rows.every((row, index) => normalise(responses[index]) === normalise(row.answer));
    onAttempt(segment.id, correct);
    if (!correct) {
      setFeedback("Something is off—cross-check your trace table values.");
      return;
    }
    setFeedback("Well done! Your trace table checks out.");
    onComplete();
  }

  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
        <p>{segment.instructions}</p>
        <AttemptBadge attemptStats={attemptStats} />
      </header>
      <div className="b1-fill">
        {rows.map((row, index) => (
          <label key={row.prompt}>
            <span>{row.prompt}</span>
            <input
              type="text"
              value={responses[index]}
              onChange={(event) => {
                const value = event.target.value;
                setResponses((prev) => {
                  const next = [...prev];
                  next[index] = value;
                  return next;
                });
              }}
            />
          </label>
        ))}
      </div>
      <div className="b1-segment-nav">
        {onBack ? (
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <div className="b1-segment-nav__actions">
          {isTeacher && (
            <button type="button" className="btn btn--outline" onClick={onComplete}>
              Mark complete
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={handleSubmit}>
            Check answers
          </button>
        </div>
      </div>
      {feedback && (
        <p role="status" className="b1-feedback">
          {feedback}
        </p>
      )}
    </article>
  );
}

function PlannerActivity({
  segment,
  onComplete,
  onBack,
  plannerValues,
  onPlannerSave,
  isTeacher,
  attemptStats,
  onAttempt,
}) {
  const [completed, setCompleted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    const allFilled = segment.panels.every((panel) => {
      const value = plannerValues[panel.id];
      return value && value.trim().length > 0;
    });
    if (!allFilled) {
      setCompleted(false);
      return;
    }
    setCompleted(true);
    onAttempt(segment.id, true);
    onComplete();
  }

  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
        <p>{segment.instructions}</p>
        <AttemptBadge attemptStats={attemptStats} />
      </header>
      <form className="b1-planner" onSubmit={handleSubmit}>
        {segment.panels?.map((panel) => (
          <label key={panel.id}>
            <span>{panel.label}</span>
            <textarea
              value={plannerValues[panel.id] ?? ""}
              onChange={(event) => onPlannerSave(panel.id, event.target.value)}
              rows={4}
            />
          </label>
        ))}
        <div className="b1-segment-nav">
          {onBack ? (
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="b1-segment-nav__actions">
            {isTeacher && (
              <button type="button" className="btn btn--outline" onClick={onComplete}>
                Mark complete
              </button>
            )}
            <button type="submit" className="btn btn--primary">
              Lock planner
            </button>
          </div>
        </div>
        {!completed && (
          <p className="b1-feedback" role="status">
            Fill in every panel to continue.
          </p>
        )}
      </form>
    </article>
  );
}

function CheckpointSegment({ segment, onComplete, onBack, isTeacher, attemptStats, onAttempt }) {
  const [responses, setResponses] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function evaluate() {
    const unanswered = (segment.questions ?? []).find((question) => responses[question.id] == null);
    if (unanswered) {
      setFeedback("Answer each question before checking.");
      return false;
    }
    const incorrect = (segment.questions ?? []).find((question) => !isCorrect(question, responses[question.id]));
    const success = !incorrect;
    if (typeof onAttempt === "function") {
      onAttempt(segment.id, success);
    }
    if (incorrect) {
      setFeedback("Review your answers and try again.");
      return false;
    }
    setFeedback("Checkpoint passed! You can continue.");
    onComplete();
    return true;
  }

  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
        <AttemptBadge attemptStats={attemptStats} />
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setAttempted(true);
          evaluate();
        }}
        className="b1-checkpoint"
      >
        {segment.questions?.map((question) => (
          <CheckpointQuestion
            key={question.id}
            question={question}
            value={responses[question.id]}
            onChange={(value) =>
              setResponses((prev) => ({
                ...prev,
                [question.id]: value,
              }))
            }
            showRationale={attempted && isCorrect(question, responses[question.id])}
          />
        ))}
        <div className="b1-segment-nav">
          {onBack ? (
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="b1-segment-nav__actions">
            {isTeacher && (
              <button type="button" className="btn btn--outline" onClick={onComplete}>
                Mark complete
              </button>
            )}
            <button type="submit" className="btn btn--primary">
              Check answers
            </button>
          </div>
        </div>
        {feedback && (
          <p role="status" className="b1-feedback">
            {feedback}
          </p>
        )}
      </form>
    </article>
  );
}

function isCorrect(question, value) {
  if (value == null) return false;
  switch (question.type) {
    case "true-false":
      return Boolean(value) === Boolean(question.answer);
    case "mcq":
      return value === question.answer;
    case "fill-multi": {
      const expected = question.answers ?? [];
      if (!Array.isArray(value)) return false;
      return expected.every((answer, index) => normalise(value[index]) === normalise(answer));
    }
    default:
      return false;
  }
}

function normalise(value) {
  return (value ?? "").toString().trim().toLowerCase();
}

function CheckpointQuestion({ question, value, onChange, showRationale }) {
  switch (question.type) {
    case "true-false":
      return (
        <fieldset className="b1-checkpoint__item">
          <legend>{question.prompt}</legend>
          <div className="b1-checkpoint__options">
            {[true, false].map((option) => (
              <label key={String(option)}>
                <input
                  type="radio"
                  name={question.id}
                  value={String(option)}
                  checked={value === option}
                  onChange={() => onChange(option)}
                />
                <span>{option ? "True" : "False"}</span>
              </label>
            ))}
          </div>
          {showRationale && <p className="b1-rationale">{question.rationale}</p>}
        </fieldset>
      );
    case "mcq":
      return (
        <fieldset className="b1-checkpoint__item">
          <legend>{question.prompt}</legend>
          <div className="b1-checkpoint__options">
            {question.options?.map((option) => (
              <label key={option.id}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={value === option.id}
                  onChange={() => onChange(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {showRationale && <p className="b1-rationale">{question.rationale}</p>}
        </fieldset>
      );
    case "fill-multi":
      return (
        <div className="b1-checkpoint__item">
          <p>{question.prompt}</p>
          <div className="b1-fill">
            {(question.placeholders ?? []).map((placeholder, index) => (
              <input
                key={placeholder}
                type="text"
                placeholder={placeholder}
                value={Array.isArray(value) ? value[index] ?? "" : ""}
                onChange={(event) => {
                  const next = Array.isArray(value) ? [...value] : Array(question.answers.length).fill("");
                  next[index] = event.target.value;
                  onChange(next);
                }}
              />
            ))}
          </div>
          {showRationale && <p className="b1-rationale">{question.rationale}</p>}
        </div>
      );
    default:
      return null;
  }
}

function ReflectionSegment({ segment, onComplete, onBack, reflections, onReflectionSave }) {
  const [value, setValue] = useState(() => reflections[segment.id] ?? "");

  function handleSave() {
    onReflectionSave(segment.id, value);
    onComplete();
  }

  return (
    <article className="b1-card">
      <header>
        <h3>{segment.heading}</h3>
      </header>
      <p>{segment.prompt}</p>
      <textarea
        rows={6}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={segment.heading}
      />
      <div className="b1-segment-nav">
        {onBack ? (
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="btn btn--primary" onClick={handleSave}>
          Save & continue
        </button>
      </div>
    </article>
  );
}

function AssessmentPanel({ progress, setProgress, isTeacher }) {
  const allStagesComplete = useMemo(() => Object.values(progress.stages).every((stage) => stage.completed), [progress]);
  const [expanded, setExpanded] = useState(false);

  const assessment = b1Unit.assessment;

  const handleResponseChange = (questionId, value) => {
    setProgress((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        responses: {
          ...prev.assessment.responses,
          [questionId]: value,
        },
      },
    }));
  };

  const handleMarkChange = (questionId, value) => {
    setProgress((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        marks: {
          ...prev.assessment.marks,
          [questionId]: value,
        },
      },
    }));
  };

  const handleTeacherFeedbackChange = (questionId, value) => {
    setProgress((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        teacherNotes: {
          ...prev.assessment.teacherNotes,
          [questionId]: value,
        },
      },
    }));
  };

  const handleExport = () => {
    window.print();
  };

  const totalAwarded = Object.values(progress.assessment.marks ?? {}).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0,
  );

  return (
    <section className="b1-assessment">
      <header>
        <h2>End-of-Unit Assessment</h2>
        <span>
          {assessment.duration} · {assessment.totalMarks} marks
        </span>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => setExpanded((prev) => !prev)}
          disabled={!allStagesComplete}
        >
          {expanded ? "Hide assessment" : "Open assessment"}
        </button>
      </header>
      {!allStagesComplete && (
        <p className="b1-assessment__lock">
          Complete all learning stages to unlock the assessment. You are {formatPercentage(computeOverallProgress(progress))}
          {" "}through the unit.
        </p>
      )}
      {expanded && allStagesComplete && (
        <div className="b1-assessment__body">
          <p>
            Answer each question in the spaces provided. Your responses save automatically in this browser. Use the
            download button to produce a PDF copy to share with your teacher.
          </p>
          <ol className="b1-assessment__questions">
            {assessment.questions.map((question) => (
              <li key={question.id}>
                <div className="b1-assessment__prompt">
                  <p>{question.prompt}</p>
                  <span>{question.marks} marks</span>
                </div>
                <textarea
                  rows={6}
                  value={progress.assessment.responses[question.id] ?? ""}
                  onChange={(event) => handleResponseChange(question.id, event.target.value)}
                />
              </li>
            ))}
          </ol>
          <div className="b1-assessment__actions">
            <button type="button" className="btn btn--primary" onClick={handleExport}>
              Download as PDF
            </button>
          </div>
          {isTeacher ? (
            <TeacherMarkingPanel
              assessment={assessment}
              progress={progress}
              onMarkChange={handleMarkChange}
              onFeedbackChange={handleTeacherFeedbackChange}
              totalAwarded={totalAwarded}
            />
          ) : (
            <TeacherMarkingHints />
          )}
        </div>
      )}
    </section>
  );
}

function TeacherMarkingHints() {
  return (
    <aside className="b1-assessment__teacher">
      <h3>Teacher view</h3>
      <p>
        Record marks and feedback in your teacher dashboard. The PDF export captures student answers so you can annotate
        digitally. Future updates will push marks directly to the dashboard.
      </p>
    </aside>
  );
}

function TeacherMarkingPanel({ assessment, progress, onMarkChange, onFeedbackChange, totalAwarded }) {
  return (
    <aside className="b1-assessment__teacher b1-assessment__teacher--panel">
      <div className="b1-assessment__teacher-header">
        <h3>Teacher marking workspace</h3>
        <span>
          Total awarded: {totalAwarded} / {assessment.totalMarks}
        </span>
      </div>
      <p>
        Enter the awarded marks and feedback for each item. Values persist locally. Export the assessment to share a PDF
        copy with annotations.
      </p>
      <div className="b1-assessment__teacher-grid">
        {assessment.questions.map((question) => (
          <div key={question.id} className="b1-assessment__teacher-item">
            <div className="b1-assessment__teacher-meta">
              <h4>{question.prompt}</h4>
              <span>{question.marks} marks</span>
            </div>
            <label>
              <span>Marks awarded</span>
              <input
                type="number"
                min={0}
                max={question.marks}
                value={progress.assessment.marks[question.id] ?? ""}
                onChange={(event) => onMarkChange(question.id, event.target.value)}
              />
            </label>
            <label>
              <span>Feedback</span>
              <textarea
                rows={3}
                value={progress.assessment.teacherNotes[question.id] ?? ""}
                onChange={(event) => onFeedbackChange(question.id, event.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default B1ModulePage;
