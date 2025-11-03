import { useMemo, useState } from "react";
import AttemptBadge from "./AttemptBadge.jsx";
import "./Segments.css";

function evaluateQuestion(question, value) {
  switch (question.type) {
    case "true-false":
      return {
        correct: Boolean(value) === Boolean(question.answer),
        details: { selected: value },
      };
    case "mcq":
      return {
        correct: value === question.answer,
        details: { selected: value, correctAnswer: question.answer },
      };
    case "multi-select": {
      const expected = Array.isArray(question.answers) ? question.answers : [];
      const provided = Array.isArray(value) ? value : [];
      const sortedExpected = [...expected].sort();
      const sortedProvided = [...provided].sort();
      const match =
        sortedExpected.length === sortedProvided.length &&
        sortedExpected.every((entry, index) => entry === sortedProvided[index]);
      return {
        correct: match,
        details: { selected: provided, correctAnswers: expected },
      };
    }
    default:
      return { correct: false, details: {} };
  }
}

function getOptionState(question, value, evaluation) {
  if (!evaluation) return "idle";
  if (question.type === "true-false") {
    const optionValue = value;
    if (optionValue === evaluation.details.selected) {
      return evaluation.correct ? "correct" : "incorrect";
    }
    if (evaluation.correct && optionValue === question.answer) {
      return "correct";
    }
    return "idle";
  }

  if (question.type === "mcq") {
    if (value === evaluation.details.selected) {
      return value === question.answer ? "correct" : "incorrect";
    }
    if (value === question.answer) {
      return "correct";
    }
    return "idle";
  }

  if (question.type === "multi-select") {
    const selected = evaluation.details.selected ?? [];
    const correct = evaluation.details.correctAnswers ?? [];
    if (selected.includes(value) && correct.includes(value)) return "correct";
    if (selected.includes(value) && !correct.includes(value)) return "incorrect";
    if (!selected.includes(value) && correct.includes(value)) return "missed";
    return "idle";
  }

  return "idle";
}

export default function MicroQuizSegment({ segment, onBack, onComplete, onAttempt, attemptStats, isTeacher }) {
  const [responses, setResponses] = useState({});
  const [locked, setLocked] = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [feedback, setFeedback] = useState(null);

  const totalQuestions = segment.questions?.length ?? 0;
  const unanswered = useMemo(() => {
    return segment.questions?.some((question) => {
      const value = responses[question.id];
      if (question.type === "multi-select") {
        return !Array.isArray(value) || value.length === 0;
      }
      return value === undefined || value === null || value === "";
    });
  }, [responses, segment.questions]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (locked) {
      return;
    }

    if (unanswered) {
      setFeedback({ tone: "error", message: "Answer every question before checking." });
      return;
    }

    const perQuestion = {};
    let correctCount = 0;
    segment.questions.forEach((question) => {
      const evaluation = evaluateQuestion(question, responses[question.id]);
      perQuestion[question.id] = evaluation;
      if (evaluation.correct) {
        correctCount += 1;
      }
    });

    setEvaluations(perQuestion);
    const passed = correctCount === totalQuestions;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Perfect! XP incoming." : "Review the highlights and try again.",
    });

    onAttempt(segment.id, {
      success: passed,
      correctCount,
      totalCount: totalQuestions,
      onAdvance: passed
        ? () => {
            setLocked(true);
            onComplete();
          }
        : null,
    });

    if (passed) {
      setLocked(true);
    }
  };

  return (
    <article className={`gamified-card ${feedback?.tone === "success" ? "is-success" : ""}`}>
      <header>
        <h3>{segment.heading}</h3>
        <AttemptBadge attemptStats={attemptStats} />
        {segment.instructions && <p>{segment.instructions}</p>}
      </header>
      <form className="gamified-micro-quiz" onSubmit={handleSubmit}>
        {segment.questions?.map((question) => {
          const evaluation = evaluations[question.id];
          return (
            <fieldset
              key={question.id}
              className={`gamified-micro-question ${
                evaluation ? (evaluation.correct ? "is-correct" : "is-incorrect") : ""
              }`}
              disabled={locked && !isTeacher}
            >
              <legend>{question.prompt}</legend>
              {question.type === "true-false" && (
                <div className="gamified-micro-options">
                  {[true, false].map((option) => (
                    <label
                      key={String(option)}
                      className={`gamified-micro-option gamified-micro-option--${getOptionState(
                        question,
                        option,
                        evaluation,
                      )}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={String(option)}
                        checked={responses[question.id] === option}
                        onChange={() => {
                          setResponses((prev) => ({ ...prev, [question.id]: option }));
                          setFeedback(null);
                          setLocked(false);
                        }}
                      />
                      <span>{option ? "True" : "False"}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "mcq" && (
                <div className="gamified-micro-options">
                  {question.options?.map((option) => (
                    <label
                      key={option.id}
                      className={`gamified-micro-option gamified-micro-option--${getOptionState(
                        question,
                        option.id,
                        evaluation,
                      )}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={responses[question.id] === option.id}
                        onChange={() => {
                          setResponses((prev) => ({ ...prev, [question.id]: option.id }));
                          setFeedback(null);
                          setLocked(false);
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "multi-select" && (
                <div className="gamified-micro-options">
                  {question.options?.map((option) => {
                    const selected = Array.isArray(responses[question.id])
                      ? responses[question.id].includes(option.id)
                      : false;
                    return (
                      <label
                        key={option.id}
                        className={`gamified-micro-option gamified-micro-option--${getOptionState(
                          question,
                          option.id,
                          evaluation,
                        )}`}
                      >
                        <input
                          type="checkbox"
                          value={option.id}
                          checked={selected}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setResponses((prev) => {
                              const current = Array.isArray(prev[question.id]) ? prev[question.id] : [];
                              let next = [...current];
                              if (checked) {
                                if (!next.includes(option.id)) next.push(option.id);
                              } else {
                                next = next.filter((value) => value !== option.id);
                              }
                              return {
                                ...prev,
                                [question.id]: next,
                              };
                            });
                            setFeedback(null);
                            setLocked(false);
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {evaluation && !evaluation.correct && question.rationale && (
                <p className="gamified-feedback">{question.rationale}</p>
              )}
            </fieldset>
          );
        })}

        <div className="gamified-segment-nav">
          {onBack ? (
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="gamified-segment-actions">
            <button type="submit" className="btn btn--primary" disabled={locked && !isTeacher}>
              Check answers
            </button>
          </div>
        </div>
      </form>
      {feedback && (
        <p className={`gamified-feedback ${feedback.tone === "error" ? "is-error" : "is-success"}`}>{feedback.message}</p>
      )}
    </article>
  );
}

