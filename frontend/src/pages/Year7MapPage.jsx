import { useEffect, useMemo, useState } from "react";
import {
  getTeacherDashboard,
  getClassPacing,
  updateClassPacing,
  getStudentDashboard,
  getStudentClassPacing,
  joinLiveSession,
} from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import {
  listYear7Slides,
  getYear7SlideContent,
  getYear7LessonById,
  YEAR7_CURRICULUM,
} from "../../../shared/liveDecks.js";
import "./Year7MapPage.css";

const LIVE_DECK = YEAR7_CURRICULUM[0] ?? null;

function isYear7Class(record) {
  const yearGroup = String(record?.yearGroup || "").toLowerCase();
  return yearGroup.includes("year 7") || yearGroup.includes("ks3");
}

function StatusBanner({ message }) {
  if (!message) return null;
  return <div className={`live-status live-status--${message.kind}`}>{message.text}</div>;
}

function SlideRenderer({ slideContent, audience, disabled }) {
  if (!slideContent?.slide) {
    return (
      <div className="slide-card slide-card--empty">
        <p>Select a slide to preview the live deck.</p>
      </div>
    );
  }

  const { slide, meta, deck } = slideContent;
  const title = slide.title || meta?.slideTitle || "Slide";
  const isTeacher = audience === "teacher";

  if (slide.type === "content") {
    return <ContentSlide slide={slide} title={title} deck={deck} isTeacher={isTeacher} />;
  }

  if (slide.type === "checkpoint" || slide.type === "summative") {
    const checkpointType = slide.type === "summative" ? "summative" : "checkpoint";
    return (
      <CheckpointSlide
        slide={slide}
        title={title}
        deck={deck}
        mode={checkpointType}
        audience={audience}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="slide-card">
      <header className="slide-card__header">
        <span className="slide-card__badge">{deck?.title || "Live deck"}</span>
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
    <div className="slide-card">
      <header className="slide-card__header">
        <span className="slide-card__badge">{deck?.title || "Live deck"}</span>
        <h2>{title}</h2>
      </header>
      {isTeacher ? (
        <div className="slide-section">
          {teacher.headline && <p className="slide-subhead">{teacher.headline}</p>}
          {Array.isArray(teacher.script) && teacher.script.length > 0 && (
            <div className="facilitator-block">
              <h3>Scripted moments</h3>
              <ul>
                {teacher.script.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(teacher.prompts) && teacher.prompts.length > 0 && (
            <div className="facilitator-block">
              <h3>Prompts</h3>
              <ul>
                {teacher.prompts.map((prompt, index) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(teacher.transitions) && teacher.transitions.length > 0 && (
            <div className="facilitator-block">
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
        <div className="slide-section">
          {student.headline && <p className="slide-subhead">{student.headline}</p>}
          {Array.isArray(student.revealSteps) && student.revealSteps.length > 0 ? (
            <ol className="reveal-list">
              {student.revealSteps.map((step, index) => (
                <li key={index}>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {Array.isArray(student.objectives) && student.objectives.length > 0 && (
            <div className="objective-block">
              <h3>Objectives</h3>
              <ul>
                {student.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(student.bullets) && student.bullets.length > 0 && (
            <ul className="bullet-list">
              {student.bullets.map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>
          )}
          {Array.isArray(student.callouts) && student.callouts.length > 0 && (
            <div className="callout-grid">
              {student.callouts.map((callout, index) => (
                <div key={index} className={`callout callout--${callout.type || "info"}`}>
                  {callout.title && <strong>{callout.title}</strong>}
                  <p>{callout.body}</p>
                </div>
              ))}
            </div>
          )}
          {Array.isArray(student.notes) && student.notes.length > 0 && (
            <div className="note-list">
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

function CheckpointSlide({ slide, title, deck, mode, audience, disabled }) {
  const teacher = slide.teacher || {};
  const allowRetry = slide.allowRetry !== false;

  if (audience === "teacher") {
    return (
      <div className="slide-card">
        <header className="slide-card__header">
          <span className="slide-card__badge">{deck?.title || "Live deck"}</span>
          <h2>{title}</h2>
          <span className="slide-tag slide-tag--checkpoint">{mode === "summative" ? "Summative" : "Checkpoint"}</span>
        </header>
        <div className="slide-section">
          {teacher.headline && <p className="slide-subhead">{teacher.headline}</p>}
          {Array.isArray(teacher.script) && teacher.script.length > 0 && (
            <div className="facilitator-block">
              <h3>Facilitation</h3>
              <ul>
                {teacher.script.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {slide.checkpoint?.type === "quiz" && Array.isArray(slide.checkpoint.questions) && (
            <div className="facilitator-block">
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
            <div className="facilitator-block">
              <h3>Answer key</h3>
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
      />
    );
  }

  return (
    <div className="slide-card">
      <header className="slide-card__header">
        <span className="slide-card__badge">{deck?.title || "Live deck"}</span>
        <h2>{title}</h2>
      </header>
      <p>This interactive checkpoint is not yet supported in the live viewer.</p>
    </div>
  );
}

function QuizSlide({ slide, title, deck, allowRetry, disabled }) {
  const questions = Array.isArray(slide.checkpoint?.questions) ? slide.checkpoint.questions : [];
  const [answers, setAnswers] = useState(() => ({}));
  const [feedback, setFeedback] = useState(null);

  const handleSelect = (question, value) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handleToggleMulti = (questionId, optionId) => {
    setAnswers((prev) => {
      const current = new Set(Array.isArray(prev[questionId]) ? prev[questionId] : []);
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        current.add(optionId);
      }
      return {
        ...prev,
        [questionId]: Array.from(current),
      };
    });
  };

  const evaluate = () => {
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
  };

  const reset = () => {
    setFeedback(null);
    setAnswers({});
  };

  return (
    <div className="slide-card">
      <header className="slide-card__header">
        <span className="slide-card__badge">{deck?.title || "Live deck"}</span>
        <h2>{title}</h2>
        <span className="slide-tag slide-tag--checkpoint">Checkpoint</span>
      </header>
      <div className="slide-section">
        {questions.map((question) => (
          <div key={question.id} className="quiz-question">
            <p>{question.prompt}</p>
            {question.kind === "multi" ? (
              <div className="option-grid">
                {question.options?.map((option) => {
                  const current = new Set(Array.isArray(answers[question.id]) ? answers[question.id] : []);
                  const checked = current.has(option.id);
                  const detail = feedback?.details?.find((item) => item.questionId === question.id);
                  return (
                    <label key={option.id} className={`option ${checked ? "is-selected" : ""}`}>
                      <input
                        type="checkbox"
                        disabled={Boolean(feedback) || disabled}
                        checked={checked}
                        onChange={() => handleToggleMulti(question.id, option.id)}
                      />
                      <span>{option.label || option.text}</span>
                      {feedback && detail && (
                        <span className={detail.isCorrect ? "answer-tag answer-tag--correct" : "answer-tag answer-tag--incorrect"}>
                          {detail.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="option-grid">
                {question.options?.map((option) => {
                  const checked = answers[question.id] === option.id;
                  const detail = feedback?.details?.find((item) => item.questionId === question.id);
                  return (
                    <label key={option.id} className={`option ${checked ? "is-selected" : ""}`}>
                      <input
                        type="radio"
                        name={question.id}
                        disabled={Boolean(feedback) || disabled}
                        checked={checked}
                        onChange={() => handleSelect(question, option.id)}
                      />
                      <span>{option.label || option.text}</span>
                      {feedback && detail && (
                        <span className={detail.isCorrect ? "answer-tag answer-tag--correct" : "answer-tag answer-tag--incorrect"}>
                          {detail.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            {feedback && feedback.details && (
              <p className="question-feedback">
                {feedback.details.find((item) => item.questionId === question.id)?.explanation || ""}
              </p>
            )}
          </div>
        ))}
      </div>
      <footer className="slide-actions">
        {!feedback && (
          <button type="button" className="btn btn-primary" disabled={disabled} onClick={evaluate}>
            Check answers
          </button>
        )}
        {feedback && allowRetry && (
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
        )}
        {feedback && (
          <span className="score-pill">
            {feedback.correctCount} / {feedback.total} correct
          </span>
        )}
      </footer>
    </div>
  );
}

function MatchingSlide({ slide, title, deck, allowRetry, disabled }) {
  const pairs = Array.isArray(slide.checkpoint?.pairs) ? slide.checkpoint.pairs : [];
  const feedbackMap = slide.checkpoint?.feedback || {};
  const [answers, setAnswers] = useState(() => ({}));
  const [feedback, setFeedback] = useState(null);

  const handleChange = (termId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [termId]: value,
    }));
  };

  const evaluate = () => {
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
  };

  const reset = () => {
    setAnswers({});
    setFeedback(null);
  };

  const options = Array.from(new Set(pairs.map((pair) => pair.match)));

  return (
    <div className="slide-card">
      <header className="slide-card__header">
        <span className="slide-card__badge">{deck?.title || "Live deck"}</span>
        <h2>{title}</h2>
        <span className="slide-tag slide-tag--checkpoint">Matching task</span>
      </header>
      <div className="slide-section">
        {pairs.map((pair) => {
          const detail = feedback?.details?.find((item) => item.term === pair.term);
          return (
            <div key={pair.id} className="matching-row">
              <span className="matching-term">{pair.term}</span>
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
                <span className={detail.isCorrect ? "answer-tag answer-tag--correct" : "answer-tag answer-tag--incorrect"}>
                  {detail.isCorrect ? "Correct" : "Incorrect"}
                </span>
              )}
            </div>
          );
        })}
        {feedback && feedback.details && (
          <ul className="matching-feedback">
            {feedback.details.map((detail, index) => (
              <li key={index}>
                <strong>{detail.term}</strong>: {detail.explanation || (detail.isCorrect ? "Nice!" : "Check the IPO cycle.")}
              </li>
            ))}
          </ul>
        )}
      </div>
      <footer className="slide-actions">
        {!feedback && (
          <button type="button" className="btn btn-primary" disabled={disabled} onClick={evaluate}>
            Check answers
          </button>
        )}
        {feedback && allowRetry && (
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
        )}
        {feedback && (
          <span className="score-pill">
            {feedback.correctCount} / {feedback.total} correct
          </span>
        )}
      </footer>
    </div>
  );
}

function Year7MapPage() {
  const { session, ready } = useSession();
  const token = session?.token ?? null;
  const role = session?.user?.role ?? null;
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const [teacherData, setTeacherData] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classPacing, setClassPacing] = useState(null);
  const [pointerMeta, setPointerMeta] = useState(null);
  const [commandPending, setCommandPending] = useState(false);

  const [studentInfo, setStudentInfo] = useState(null);
  const [studentPacing, setStudentPacing] = useState(null);
  const [studentPointer, setStudentPointer] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinStatus, setJoinStatus] = useState(null);

  const [selectedSlideId, setSelectedSlideId] = useState(null);

  const slideSequence = useMemo(() => listYear7Slides(), []);

  useEffect(() => {
    if (!ready || !token) return;
        if (isTeacher) {
      loadTeacherView();
        } else if (isStudent) {
      loadStudentView();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token, role]);

  useEffect(() => {
    if (!isStudent) return;
    const pointerId = studentPointer?.lesson?.id || studentPacing?.lessonId || studentPacing?.slideId || null;
    if (!pointerId) return;
    const accessibleIds = new Set(
      (studentPointer?.accessibleSlides || []).map((entry) => entry.slideId || entry.id).filter(Boolean),
    );
    if (!accessibleIds.has(selectedSlideId)) {
      setSelectedSlideId(pointerId);
    }
  }, [isStudent, selectedSlideId, studentPointer, studentPacing]);

  const pointerLessonId = pointerMeta?.lesson?.id || classPacing?.lessonId || classPacing?.slideId || null;
  const deckSummary = pointerMeta?.deck || LIVE_DECK;
  const accessibleSet = useMemo(() => {
    const raw = Array.isArray(pointerMeta?.accessibleSlides) ? pointerMeta.accessibleSlides : [];
    const set = new Set(raw.map((item) => item.slideId || item.id));
    if (pointerLessonId) {
      set.add(pointerLessonId);
    }
    return set;
  }, [pointerMeta, pointerLessonId]);

  const slideStatusMap = useMemo(() => {
    const map = new Map();
    for (const slide of slideSequence) {
      if (slide.id === pointerLessonId) {
        map.set(slide.id, "current");
      } else if (accessibleSet.has(slide.id)) {
        map.set(slide.id, "accessible");
      } else {
        map.set(slide.id, "locked");
      }
    }
    return map;
  }, [slideSequence, pointerLessonId, accessibleSet]);

  const selectedSlideContent = useMemo(() => {
    if (!selectedSlideId) return null;
    return getYear7SlideContent(selectedSlideId);
  }, [selectedSlideId]);

  async function loadTeacherView() {
    setLoading(true);
    try {
      const data = await getTeacherDashboard(token);
      setTeacherData(data);
      const initialClass = data.classes?.find((clazz) => clazz.id === selectedClassId) || data.classes?.find(isYear7Class) || data.classes?.[0];
      if (initialClass) {
        setSelectedClassId(initialClass.id);
        await fetchClassPacing(initialClass.id, token);
      } else {
        setClassPacing(null);
        setPointerMeta(null);
        setSelectedSlideId(null);
      }
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClassPacing(classId, authToken = token) {
    if (!classId) return;
    setLoading(true);
    try {
      const response = await getClassPacing(authToken, classId);
      applyPacingPayload(response);
      setError(null);
    } catch (err) {
      setStatusMessage({ kind: "error", text: err.message || "Unable to load pacing" });
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentView() {
    setLoading(true);
    try {
      const dashboard = await getStudentDashboard(token);
      setStudentInfo(dashboard);
      const studentClassId = dashboard.class?.id || dashboard.student?.classId || null;
      if (studentClassId) {
        const response = await getStudentClassPacing(token, studentClassId);
        applyStudentPacing(response);
      } else {
        setStudentPacing(null);
        setStudentPointer(null);
      }
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function applyPacingPayload(payload) {
    if (!payload) return;
    setClassPacing(payload.pacing ?? null);
    const meta = {
      lesson: payload.lesson ?? null,
      deck: payload.deck ?? null,
      accessibleSlides: Array.isArray(payload.accessibleSlides) ? payload.accessibleSlides : [],
      sequenceIndex: payload.sequenceIndex ?? null,
    };
    setPointerMeta(meta);
    const pointerId = meta.lesson?.id || payload.pacing?.lessonId || payload.pacing?.slideId || null;
    setSelectedSlideId((prev) => (pointerId && prev !== pointerId ? pointerId : prev || pointerId));
  }

  function applyStudentPacing(payload) {
    if (!payload) return;
    setStudentPacing(payload.pacing ?? null);
    const meta = {
      lesson: payload.lesson ?? null,
      deck: payload.deck ?? null,
      accessibleSlides: Array.isArray(payload.accessibleSlides) ? payload.accessibleSlides : [],
      sequenceIndex: payload.sequenceIndex ?? null,
    };
    setStudentPointer(meta);
    const pointerId = meta.lesson?.id || payload.pacing?.lessonId || payload.pacing?.slideId || null;
    if (pointerId) {
      setSelectedSlideId(pointerId);
    }
  }

  async function handleSelectClass(event) {
    const classId = event.target.value;
    setSelectedClassId(classId);
    if (classId) {
      await fetchClassPacing(classId);
    } else {
      setClassPacing(null);
      setPointerMeta(null);
      setSelectedSlideId(null);
    }
  }

  async function handleTeacherCommand(command, options = {}) {
    if (!selectedClassId) return;
    setCommandPending(true);
    try {
      const payload = { command, ...options };
      if (command === 'start' || command === 'reset') {
        payload.unitId = options.unitId || pointerMeta?.deck?.id || classPacing?.unitId || LIVE_DECK?.id;
        payload.resume = options.resume ?? true;
        payload.resetHistory = options.resetHistory ?? false;
      }
      const response = await updateClassPacing(token, selectedClassId, payload);
      applyPacingPayload(response);
      const label = command === 'advance' ? 'Advanced' : command.charAt(0).toUpperCase() + command.slice(1);
      setStatusMessage({ kind: 'success', text: `${label} the live session.` });
    } catch (err) {
      setStatusMessage({ kind: 'error', text: err.message || 'Unable to update pacing' });
    } finally {
      setCommandPending(false);
    }
  }

  async function handleMovePointer(slideId) {
    if (!selectedClassId || !slideId) return;
    setCommandPending(true);
    try {
      const lesson = getYear7LessonById(slideId);
      const payload = {
        lessonId: slideId,
        unitId: lesson?.unitId || pointerMeta?.deck?.id || LIVE_DECK?.id,
      };
      const response = await updateClassPacing(token, selectedClassId, payload);
      applyPacingPayload(response);
      setStatusMessage({ kind: 'success', text: `Pointer moved to ${lesson?.title || 'selected slide'}.` });
    } catch (err) {
      setStatusMessage({ kind: 'error', text: err.message || 'Unable to move pointer' });
    } finally {
      setCommandPending(false);
    }
  }

  async function handleJoinSession(event) {
    event.preventDefault();
    if (!joinCodeInput.trim()) {
      setJoinStatus({ kind: 'error', text: 'Enter a join code to continue.' });
      return;
    }
    setJoinStatus({ kind: 'info', text: 'Joining live session…' });
    try {
      const response = await joinLiveSession(token, joinCodeInput.trim());
      applyStudentPacing(response);
      setJoinStatus({ kind: 'success', text: 'Live session joined.' });
    } catch (err) {
      setJoinStatus({ kind: 'error', text: err.message || 'Unable to join session.' });
    }
  }

  const slidePreviewDisabled = isStudent && (!studentPointer || commandPending);

  return (
    <div className="live-shell">
      <header className="live-hero">
        <div>
          <span className="live-eyebrow">Year 7 live teaching</span>
          <h1>Computing Foundations Live Deck</h1>
          <p>
            Deliver today&apos;s lesson at teacher pace. The pointer keeps students on the same slide, unlocks checkpoints
            together, and saves your place for the next session.
          </p>
        </div>
        {deckSummary && (
          <dl className="live-meta">
            <div>
              <dt>Deck</dt>
              <dd>{deckSummary.title}</dd>
            </div>
            {deckSummary.estimatedDuration && (
              <div>
                <dt>Estimated time</dt>
                <dd>{deckSummary.estimatedDuration}</dd>
              </div>
            )}
            <div>
              <dt>Slides</dt>
              <dd>{deckSummary.slideCount || slideSequence.length}</dd>
            </div>
          </dl>
        )}
      </header>

      <StatusBanner message={statusMessage || (isStudent ? joinStatus : null)} />
      {error && <div className="live-status live-status--error">{error.message || 'Something went wrong.'}</div>}

      <div className="live-layout">
        <aside className="live-sidebar">
        {isTeacher && (
            <TeacherControls
              data={teacherData}
              selectedClassId={selectedClassId}
              onSelectClass={handleSelectClass}
              commandPending={commandPending}
              pacing={classPacing}
              pointerMeta={pointerMeta}
              onCommand={handleTeacherCommand}
              onRefresh={() => fetchClassPacing(selectedClassId)}
            />
          )}

          {isStudent && (
            <StudentControls
              info={studentInfo}
              pointerMeta={studentPointer}
              pacing={studentPacing}
              joinCode={joinCodeInput}
              onJoinCodeChange={setJoinCodeInput}
              onJoin={handleJoinSession}
              onRefresh={() => loadStudentView()}
            />
          )}

          <div className="slide-timeline">
            <h2>Live deck timeline</h2>
            <ul>
              {slideSequence.map((slide) => {
                const status = slideStatusMap.get(slide.id) || 'locked';
                const isSelected = selectedSlideId === slide.id;
                return (
                  <li key={slide.id} className={`timeline-item timeline-item--${status} ${isSelected ? 'is-selected' : ''}`}>
                    <button
                      type="button"
                      className="timeline-button"
                      onClick={() => setSelectedSlideId(slide.id)}
                      disabled={isStudent && !accessibleSet.has(slide.id)}
                    >
                      <span className="timeline-order">{slide.order}</span>
                      <div className="timeline-text">
                        <strong>{slide.title}</strong>
                        <span className="timeline-type">{slide.type === 'content' ? 'Content' : slide.type === 'checkpoint' ? 'Checkpoint' : 'Summative'}</span>
                      </div>
                    </button>
                    {isTeacher && status !== 'current' && (
                      <button
                        type="button"
                        className="timeline-action"
                        onClick={() => handleMovePointer(slide.id)}
                        disabled={commandPending}
                      >
                        Move pointer
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <main className="live-main">
          {loading ? (
            <div className="loading-panel">
              <span className="spinner" aria-hidden="true" />
              <p>Loading live deck…</p>
            </div>
          ) : (
            <SlideRenderer
              slideContent={selectedSlideContent}
              audience={isTeacher ? 'teacher' : 'student'}
              disabled={slidePreviewDisabled}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function TeacherControls({
  data,
  selectedClassId,
  onSelectClass,
  commandPending,
  pacing,
  pointerMeta,
  onCommand,
  onRefresh,
}) {
  const classes = data?.classes || [];
  const joinCode = pacing?.sessionCode || null;
  const sessionStatus = pacing?.sessionStatus || (joinCode ? 'live' : 'idle');

  return (
    <section className="control-card">
      <header>
        <h2>Class controls</h2>
        <button type="button" className="btn-link" onClick={onRefresh} disabled={!selectedClassId || commandPending}>
          Refresh
        </button>
      </header>
      <label className="control-field">
        <span>Choose a class</span>
        <select value={selectedClassId} onChange={onSelectClass} disabled={commandPending || classes.length === 0}>
          <option value="">Preview with no class</option>
          {classes.map((clazz) => (
                  <option key={clazz.id} value={clazz.id}>
                    {clazz.className}
                  </option>
                ))}
              </select>
            </label>

      <div className="control-status">
        <span className={`status-pill status-pill--${sessionStatus}`}>{sessionStatus.toUpperCase()}</span>
        {joinCode && <span className="join-code">Join code: {joinCode}</span>}
      </div>

      <div className="control-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={commandPending || !selectedClassId}
          onClick={() => onCommand('start', { resetHistory: false })}
        >
          Start / resume
        </button>
              <button
                type="button"
          className="btn"
          disabled={commandPending || !selectedClassId}
          onClick={() => onCommand('advance')}
        >
          Advance pointer
              </button>
              <button
                type="button"
          className="btn"
          disabled={commandPending || !selectedClassId}
          onClick={() => onCommand('stop')}
        >
          Pause session
              </button>
              <button
                type="button"
          className="btn btn-secondary"
          disabled={commandPending || !selectedClassId}
          onClick={() => onCommand('reset', { resetHistory: true })}
        >
          Reset to slide 1
              </button>
            </div>

      <footer className="control-footer">
        {pointerMeta?.lesson ? (
          <p>
            Pointer is on <strong>{pointerMeta.lesson.title}</strong>
          </p>
        ) : (
          <p>Select a class and start the session to generate a join code.</p>
        )}
      </footer>
      </section>
  );
}

function StudentControls({ info, pointerMeta, pacing, joinCode, onJoinCodeChange, onJoin, onRefresh }) {
  const joinCodePlaceholder = 'e.g. H4X8Q';
  const pointerTitle = pointerMeta?.lesson?.title || 'Pointer not set';

            return (
    <section className="control-card">
      <header>
        <h2>Live session</h2>
        <button type="button" className="btn-link" onClick={onRefresh}>
          Refresh
              </button>
            </header>
      <p className="student-summary">
        {info?.class?.className ? (
          <>
            You are enrolled in <strong>{info.class.className}</strong>. When your teacher starts the live deck, the pointer
            and checkpoints unlock automatically.
          </>
        ) : (
          <>Your teacher hasn&apos;t assigned a class yet. Join manually with a code.</>
        )}
      </p>
      <form className="join-form" onSubmit={onJoin}>
        <label className="control-field">
          <span>Join code</span>
          <input
            type="text"
            value={joinCode}
            onChange={(event) => onJoinCodeChange(event.target.value)}
            placeholder={joinCodePlaceholder}
            maxLength={8}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Join live session
        </button>
      </form>
      <footer className="control-footer">
        <p>
          Pointer: <strong>{pointerTitle}</strong>
        </p>
        {pacing?.sessionCode && <p>Active join code: {pacing.sessionCode}</p>}
      </footer>
      </section>
  );
}

export default Year7MapPage;

