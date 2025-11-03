import { useMemo, useState } from "react";
import { shuffle } from "../../../utils/array.js";
import AttemptBadge from "../AttemptBadge.jsx";
import "./Activities.css";

export default function MatchingActivity({ segment, onBack, onComplete, onAttempt, attemptStats, isTeacher }) {
  const options = useMemo(() => shuffle(segment.pairs.map((pair) => pair.example)), [segment.pairs]);
  const [answers, setAnswers] = useState(() => segment.pairs.map(() => ({ selection: "" })));
  const [feedback, setFeedback] = useState(null);
  const [resolved, setResolved] = useState(false);

  const handleSubmit = () => {
    if (resolved) return;
    const allAnswered = answers.every((answer) => answer.selection);
    if (!allAnswered) {
      setFeedback({ tone: "error", message: "Select an example for each term." });
      return;
    }
    const correctCount = answers.filter((answer, index) => answer.selection === segment.pairs[index].example).length;
    const passed = correctCount === segment.pairs.length;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Perfect match!" : "Something is mismatched—check the hints.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount,
      totalCount: segment.pairs.length,
      onAdvance: passed
        ? () => {
            setResolved(true);
            onComplete();
          }
        : null,
    });
    if (passed) {
      setResolved(true);
    }
  };

  return (
    <article className="gamified-card">
      <header>
        <h3>{segment.heading}</h3>
        <AttemptBadge attemptStats={attemptStats} />
        {segment.instructions && <p>{segment.instructions}</p>}
      </header>
      <div className="activity-matching">
        {segment.pairs.map((pair, index) => (
          <label key={pair.term} className="activity-matching__row">
            <span className="activity-matching__term">{pair.term}</span>
            <select
              value={answers[index].selection}
              disabled={resolved && !isTeacher}
              onChange={(event) => {
                const value = event.target.value;
                setAnswers((prev) => {
                  const next = [...prev];
                  next[index] = { selection: value };
                  return next;
                });
                setFeedback(null);
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
      <div className="gamified-segment-nav">
        {onBack ? (
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <div className="gamified-segment-actions">
          <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={resolved && !isTeacher}>
            Check answers
          </button>
        </div>
      </div>
      {feedback && (
        <p className={`gamified-feedback ${feedback.tone === "error" ? "is-error" : "is-success"}`}>{feedback.message}</p>
      )}
    </article>
  );
}

