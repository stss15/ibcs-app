import { Fragment, useMemo, useState } from "react";
import AttemptBadge from "../AttemptBadge.jsx";
import "./Activities.css";

const PLACEHOLDER_REGEX = /\[\[([^[\]]+)\]\]/g;

export default function GapFillActivity({ segment, onBack, onComplete, onAttempt, attemptStats, isTeacher }) {
  const [responses, setResponses] = useState({});
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const parts = useMemo(() => {
    const chunks = [];
    let lastIndex = 0;
    const text = segment.text ?? "";
    text.replace(PLACEHOLDER_REGEX, (match, placeholderId, index) => {
      if (index > lastIndex) {
        chunks.push({ type: "text", value: text.slice(lastIndex, index) });
      }
      chunks.push({ type: "blank", id: placeholderId });
      lastIndex = index + match.length;
      return match;
    });
    if (lastIndex < text.length) {
      chunks.push({ type: "text", value: text.slice(lastIndex) });
    }
    return chunks;
  }, [segment.text]);

  const handleSubmit = () => {
    if (resolved) return;
    const blanks = segment.blanks ?? [];
    const missing = blanks.some((blank) => !responses[blank.id]);
    if (missing) {
      setFeedback({ tone: "error", message: "Fill every blank before checking." });
      return;
    }
    let correctCount = 0;
    blanks.forEach((blank) => {
      if (responses[blank.id] === blank.answer) {
        correctCount += 1;
      }
    });
    const passed = correctCount === blanks.length;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Sentence complete!" : "Check the highlighted blanks and try again.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount,
      totalCount: blanks.length,
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
      <div className="activity-gapfill">
        <p className="activity-gapfill__text">
          {parts.map((part, index) => {
            if (part.type === "text") {
              return <Fragment key={`text-${index}`}>{part.value}</Fragment>;
            }
            const blank = segment.blanks.find((entry) => entry.id === part.id);
            const selected = responses[blank.id] ?? "";
            const isCorrect = resolved && selected === blank.answer;
            const isIncorrect = resolved && selected && selected !== blank.answer;
            return (
              <span
                key={blank.id}
                className={`activity-gapfill__blank${isCorrect ? " is-correct" : ""}${isIncorrect ? " is-incorrect" : ""}`}
              >
                <select
                  value={selected}
                  disabled={resolved && !isTeacher}
                  onChange={(event) => {
                    setResponses((prev) => ({ ...prev, [blank.id]: event.target.value }));
                    setFeedback(null);
                  }}
                >
                  <option value="">Select…</option>
                  {blank.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </span>
            );
          })}
        </p>
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
            Check sentence
          </button>
        </div>
      </div>
      {feedback && (
        <p className={`gamified-feedback ${feedback.tone === "error" ? "is-error" : "is-success"}`}>{feedback.message}</p>
      )}
    </article>
  );
}

