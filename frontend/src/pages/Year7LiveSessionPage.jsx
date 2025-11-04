import { useCallback, useEffect, useMemo, useState } from "react";
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

function classNameFromStatus(status) {
  switch ((status || "idle").toLowerCase()) {
    case "live":
      return "is-live";
    case "paused":
      return "is-paused";
    default:
      return "is-idle";
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

function SlideRenderer({ slideMeta, audience, disabled, onCheckpointSubmit }) {
  if (!slideMeta?.slide) {
    return (
      <div className="y7-live-stage__empty">
        <p>Select a slide to begin.</p>
      </div>
    );
  }

  const { slide, deck } = slideMeta;
  const title = slide.title || slideMeta.slideTitle || "Slide";
  const isTeacher = audience === "teacher";

  if (slide.type === "content") {
    return <ContentSlide slide={slide} title={title} deck={deck} isTeacher={isTeacher} />;
  }

  if (slide.type === "checkpoint" || slide.type === "summative") {
    const mode = slide.type === "summative" ? "summative" : "checkpoint";
    return (
      <CheckpointSlide
        slide={slide}
        title={title}
        deck={deck}
        mode={mode}
        audience={audience}
        disabled={disabled}
        onCheckpointSubmit={onCheckpointSubmit}
      />
    );
  }

  return (
    <div className="y7-live-slide">
      <header className="y7-live-slide__header">
        <span className="y7-live-slide__badge">{deck?.title || "Live deck"}</span>
        <h2>{title}</h2>
      </header>
      <p>This slide type is not yet supported in the live viewer.</p>
    </div>
  );
}

function ContentSlide({ slide, title, deck, isTeacher }) {
  const teacher = slide.teacher || {};
  const student = slide.student || {};
  return (
    <div className="y7-live-slide">
      <header className="y7-live-slide__header">
        <span className="y7-live-slide__badge">{deck?.title || "Live deck"}</span>
        <h2>{title}</h2>
      </header>
      {isTeacher ? (
        <div className="y7-live-slide__body">
          {teacher.headline && <p className="y7-live-slide__headline">{teacher.headline}</p>}
          {Array.isArray(teacher.script) && teacher.script.length > 0 && (
            <div className="y7-live-slide__panel">
              <h3>Scripted moments</h3>
              <ul>
                {teacher.script.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(teacher.prompts) && teacher.prompts.length > 0 && (
            <div className="y7-live-slide__panel">
              <h3>Prompt the class</h3>
              <ul>
                {teacher.prompts.map((prompt, index) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(teacher.transitions) && teacher.transitions.length > 0 && (
            <div className="y7-live-slide__panel">
              <h3>When to advance</h3>
              <ul>
                {teacher.transitions.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="y7-live-slide__body">
          {student.headline && <p className="y7-live-slide__headline">{student.headline}</p>}
          {Array.isArray(student.revealSteps) && student.revealSteps.length > 0 && (
            <ol className="y7-live-reveal">
              {student.revealSteps.map((step, index) => (
                <li key={index}>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </li>
              ))}
            </ol>
          )}
          {Array.isArray(student.objectives) && student.objectives.length > 0 && (
            <div className="y7-live-slide__panel">
              <h3>Learning objectives</h3>
              <ul>
                {student.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(student.bullets) && student.bullets.length > 0 && (
            <ul className="y7-live-bullets">
              {student.bullets.map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>
          )}
          {Array.isArray(student.callouts) && student.callouts.length > 0 && (
            <div className="y7-live-callouts">
              {student.callouts.map((callout, index) => (
                <div key={index} className={`y7-live-callout y7-live-callout--${callout.type || "info"}`}>
                  {callout.title && <strong>{callout.title}</strong>}
                  <p>{callout.body}</p>
                </div>
              ))}
            </div>
          )}
          {Array.isArray(student.notes) && student.notes.length > 0 && (
            <div className="y7-live-notes">
              {student.notes.map((note, index) => (
                <p key={index}>{note}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CheckpointSlide({ slide, title, deck, mode, audience, disabled, onCheckpointSubmit }) {
  const teacher = slide.teacher || {};
  const allowRetry = slide.allowRetry !== false;

  if (audience === "teacher") {
    return (
      <div className="y7-live-slide">
        <header className="y7-live-slide__header">
          <span className="y7-live-slide__badge">{deck?.title || "Live deck"}</span>
          <h2>{title}</h2>
          <span className={`y7-live-slide__tag ${mode === "summative" ? "is-summative" : "is-checkpoint"}`}>
            {mode === "summative" ? "Summative" : "Checkpoint"}
          </span>
        </header>
        <div className="y7-live-slide__body">
          {teacher.headline && <p className="y7-live-slide__headline">{teacher.headline}</p>}
          {Array.isArray(teacher.script) && teacher.script.length > 0 && (
            <div className="y7-live-slide__panel">
              <h3>Facilitation script</h3>
              <ul>
                {teacher.script.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {slide.checkpoint?.type === "quiz" && Array.isArray(slide.checkpoint.questions) && (
            <div className="y7-live-slide__panel">
              <h3>Answer key</h3>
              <ul>
                {slide.checkpoint.questions.map((question) => (
                  <li key={question.id}>
                    <strong>{question.prompt}</strong>
                    <span>
                      {Array.isArray(question.answers)
                        ? question.answers.join(", ")
                        : typeof question.answer === "boolean"
                        ? question.answer ? "True" : "False"
                        : question.answer}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {slide.checkpoint?.type === "matching" && Array.isArray(slide.checkpoint.pairs) && (
            <div className="y7-live-slide__panel">
              <h3>Matching reference</h3>
              <ul>
                {slide.checkpoint.pairs.map((pair) => (
                  <li key={pair.id}>
                    <strong>{pair.term}</strong> → {pair.match}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slide.checkpoint?.type === "quiz") {
    return (
      <QuizSlide
        slide={slide}
        title={title}
        deck={deck}
        allowRetry={allowRetry}
        disabled={disabled}
        onSubmit={onCheckpointSubmit}
      />
    );
  }

  if (slide.checkpoint?.type === "matching") {
    return (
      <MatchingSlide
        slide={slide}
        title={title}
        deck={deck}
        allowRetry={allowRetry}
        disabled={disabled}
        onSubmit={onCheckpointSubmit}
      />
    );
  }

  return (
    <div className="y7-live-slide">
      <header className="y7-live-slide__header">
        <span className="y7-live-slide__badge">{deck?.title || "Live deck"}</span>
        <h2>{title}</h2>
      </header>
      <p>This interactive checkpoint is not yet supported in the live viewer.</p>
    </div>
  );
}

function QuizSlide({ slide, title, deck, allowRetry, disabled, onSubmit }) {
  const questions = Array.isArray(slide.checkpoint?.questions) ? slide.checkpoint.questions : [];
  const [answers, setAnswers] = useState(() => ({}));
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const notifyStart = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
      onSubmit?.({ status: "in-progress", attempts });
    }
  }, [hasStarted, attempts, onSubmit]);

  const handleSelect = (question, value) => {
    notifyStart();
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleToggleMulti = (questionId, optionId) => {
    notifyStart();
    setAnswers((prev) => {
      const current = new Set(Array.isArray(prev[questionId]) ? prev[questionId] : []);
      if (current.has(optionId)) current.delete(optionId);
      else current.add(optionId);
      return {
        ...prev,
        [questionId]: Array.from(current),
      };
    });
  };

  const evaluate = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    let correctCount = 0;
    const details = questions.map((question) => {
      const submitted = answers[question.id];
      let isCorrect = false;
      if (question.kind === "multi" && Array.isArray(question.answers)) {
        const expected = [...question.answers].sort();
        const actual = Array.isArray(submitted) ? [...submitted].sort() : [];
        isCorrect = JSON.stringify(expected) === JSON.stringify(actual);
      } else if (typeof question.answer === "boolean") {
        isCorrect = submitted === question.answer;
      } else {
        isCorrect = submitted === question.answer;
      }
      if (isCorrect) correctCount += 1;
      return {
        questionId: question.id,
        isCorrect,
        explanation: question.rationale || question.feedback,
      };
    });
    setFeedback({ correctCount, total: questions.length, details });
    const score = questions.length ? correctCount / questions.length : 1;
    onSubmit?.({ status: "completed", score, attempts: nextAttempts });
  };

  const reset = () => {
    setFeedback(null);
    setAnswers({});
    setHasStarted(false);
    onSubmit?.({ status: "in-progress", attempts });
  };

  return (
    <div className="y7-live-slide">
      <header className="y7-live-slide__header">
        <span className="y7-live-slide__badge">{deck?.title || "Live deck"}</span>
        <h2>{title}</h2>
        <span className="y7-live-slide__tag is-checkpoint">Checkpoint</span>
      </header>
      <div className="y7-live-slide__body">
        {questions.map((question) => (
          <div key={question.id} className="y7-live-question">
            <p>{question.prompt}</p>
            {question.kind === "multi" ? (
              <div className="y7-live-options">
                {question.options?.map((option) => {
                  const current = new Set(Array.isArray(answers[question.id]) ? answers[question.id] : []);
                  const checked = current.has(option.id);
                  const detail = feedback?.details?.find((item) => item.questionId === question.id);
                  return (
                    <label key={option.id} className={`y7-live-option ${checked ? "is-selected" : ""}`}>
                      <input
                        type="checkbox"
                        disabled={Boolean(feedback) || disabled}
                        checked={checked}
                        onChange={() => handleToggleMulti(question.id, option.id)}
                      />
                      <span>{option.label || option.text}</span>
                      {feedback && detail && (
                        <span className={detail.isCorrect ? "y7-live-answer y7-live-answer--correct" : "y7-live-answer y7-live-answer--incorrect"}>
                          {detail.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="y7-live-options">
                {question.options?.map((option) => {
                  const checked = answers[question.id] === option.id;
                  const detail = feedback?.details?.find((item) => item.questionId === question.id);
                  return (
                    <label key={option.id} className={`y7-live-option ${checked ? "is-selected" : ""}`}>
                      <input
                        type="radio"
                        name={question.id}
                        disabled={Boolean(feedback) || disabled}
                        checked={checked}
                        onChange={() => handleSelect(question, option.id)}
                      />
                      <span>{option.label || option.text}</span>
                      {feedback && detail && (
                        <span className={detail.isCorrect ? "y7-live-answer y7-live-answer--correct" : "y7-live-answer y7-live-answer--incorrect"}>
                          {detail.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            {feedback && feedback.details && (
              <p className="y7-live-question__feedback">
                {feedback.details.find((item) => item.questionId === question.id)?.explanation || ""}
              </p>
            )}
          </div>
        ))}
      </div>
      <footer className="y7-live-slide__footer">
        {!feedback && (
          <button type="button" className="y7-btn y7-btn--primary" disabled={disabled} onClick={evaluate}>
            Check answers
          </button>
        )}
        {feedback && allowRetry && (
          <button type="button" className="y7-btn" onClick={reset}>
            Try again
          </button>
        )}
        {feedback && (
          <span className="y7-live-score">
            {feedback.correctCount} / {feedback.total} correct
          </span>
        )}
      </footer>
    </div>
  );
}

function MatchingSlide({ slide, title, deck, allowRetry, disabled, onSubmit }) {
  const pairs = Array.isArray(slide.checkpoint?.pairs) ? slide.checkpoint.pairs : [];
  const feedbackMap = slide.checkpoint?.feedback || {};
  const [answers, setAnswers] = useState(() => ({}));
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const notifyStart = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
      onSubmit?.({ status: "in-progress", attempts });
    }
  }, [hasStarted, attempts, onSubmit]);

  const handleChange = (termId, value) => {
    notifyStart();
    setAnswers((prev) => ({ ...prev, [termId]: value }));
  };

  const evaluate = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    let correctCount = 0;
    const details = pairs.map((pair) => {
      const submitted = answers[pair.id];
      const isCorrect = submitted === pair.match;
      if (isCorrect) correctCount += 1;
      return {
        term: pair.term,
        isCorrect,
        explanation: feedbackMap[pair.match] || feedbackMap[pair.term] || null,
      };
    });
    setFeedback({ correctCount, total: pairs.length, details });
    const score = pairs.length ? correctCount / pairs.length : 1;
    onSubmit?.({ status: "completed", score, attempts: nextAttempts });
  };

  const reset = () => {
    setAnswers({});
    setFeedback(null);
    setHasStarted(false);
    onSubmit?.({ status: "in-progress", attempts });
  };

  const options = Array.from(new Set(pairs.map((pair) => pair.match)));

  return (
    <div className="y7-live-slide">
      <header className="y7-live-slide__header">
        <span className="y7-live-slide__badge">{deck?.title || "Live deck"}</span>
        <h2>{title}</h2>
        <span className="y7-live-slide__tag is-checkpoint">Matching task</span>
      </header>
      <div className="y7-live-slide__body">
        {pairs.map((pair) => {
          const detail = feedback?.details?.find((item) => item.term === pair.term);
          return (
            <div key={pair.id} className="y7-live-matching">
              <span className="y7-live-matching__term">{pair.term}</span>
              <select
                value={answers[pair.id] || ""}
                disabled={Boolean(feedback) || disabled}
                onChange={(event) => handleChange(pair.id, event.target.value)}
              >
                <option value="" disabled>
                  Select stage
                </option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {feedback && detail && (
                <span className={detail.isCorrect ? "y7-live-answer y7-live-answer--correct" : "y7-live-answer y7-live-answer--incorrect"}>
                  {detail.isCorrect ? "Correct" : "Incorrect"}
                </span>
              )}
            </div>
          );
        })}
        {feedback && feedback.details && (
          <ul className="y7-live-matching__feedback">
            {feedback.details.map((detail, index) => (
              <li key={index}>
                <strong>{detail.term}</strong>: {detail.explanation || (detail.isCorrect ? "Nice!" : "Check the IPO cycle.")}
              </li>
            ))}
          </ul>
        )}
      </div>
      <footer className="y7-live-slide__footer">
        {!feedback && (
          <button type="button" className="y7-btn y7-btn--primary" disabled={disabled} onClick={evaluate}>
            Check answers
          </button>
        )}
        {feedback && allowRetry && (
          <button type="button" className="y7-btn" onClick={reset}>
            Try again
          </button>
        )}
        {feedback && (
          <span className="y7-live-score">
            {feedback.correctCount} / {feedback.total} correct
          </span>
        )}
      </footer>
    </div>
  );
}

function SlideTimeline({ slides, pointerId, activeId, accessibleSet, onSelect, disableFuture, label }) {
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
              <span>{slide.type === "content" ? "Content" : slide.type === "checkpoint" ? "Checkpoint" : "Summative"}</span>
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
      <div className={`y7-live-session-chip ${classNameFromStatus(liveState?.sessionStatus)}`}>
        <div>
          <span>Status</span>
          <strong>{statusLabel(liveState?.sessionStatus)}</strong>
        </div>
        {liveState?.sessionCode && (
          <div>
            <span>Join code</span>
            <strong>{liveState.sessionCode}</strong>
          </div>
        )}
      </div>
      <div className="y7-live-actions">
        <button type="button" className="y7-btn y7-btn--primary" disabled={controlBusy || !selectedClassId} onClick={onStart}>
          Start / resume
        </button>
        <button type="button" className="y7-btn" disabled={controlBusy || !selectedClassId} onClick={onAdvance}>
          Advance
        </button>
        <button type="button" className="y7-btn" disabled={controlBusy || !selectedClassId} onClick={onPause}>
          Pause
        </button>
        <button type="button" className="y7-btn y7-btn--ghost" disabled={controlBusy || !selectedClassId} onClick={onReset}>
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
            {liveState?.updatedAt && <p className="y7-live-panel__timestamp">Updated {formatTimestamp(liveState.updatedAt)}</p>}
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
  return (
    <section className="y7-live-panel">
      <header className="y7-live-panel__header">
        <div>
          <h2>Lesson navigation</h2>
          <p>Stay in sync with your teacher and revisit earlier slides.</p>
        </div>
      </header>
      <div className={`y7-live-session-chip ${classNameFromStatus(liveState?.sessionStatus)}`}>
        <div>
          <span>Status</span>
          <strong>{statusLabel(liveState?.sessionStatus)}</strong>
        </div>
        {liveState?.sessionCode && (
          <div>
            <span>Join code</span>
            <strong>{liveState.sessionCode}</strong>
          </div>
        )}
      </div>
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
    async ({ status, score, attempts }) => {
      if (!isStudent || !studentInfo?.class?.id || !token || !activeSlideId) return;
      try {
        await updateLiveAssessmentStatus(token, {
          classId: studentInfo.class.id,
          unitId: deckSummary?.id,
          segmentId: activeSlideId,
          status,
          score,
          attempts,
        });
      } catch (err) {
        console.error("Failed to sync checkpoint status", err);
      }
    },
    [isStudent, studentInfo?.class?.id, token, activeSlideId, deckSummary?.id],
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
  const stageAudience = isTeacher ? "teacher" : "student";

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
                  slideMeta={activeSlideMeta}
                  audience={stageAudience}
                  disabled={(!isTeacher && !accessibleSet.has(activeSlideId)) || false}
                  onCheckpointSubmit={isStudent ? handleCheckpointSubmit : undefined}
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
            isVisible={isTeacher && pointerSlideMeta?.slide?.type === "checkpoint" && Boolean(selectedClassId)}
          />
        </aside>
      </div>
    </div>
  );
}