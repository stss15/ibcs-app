import { useMemo, useState } from "react";
import { shuffle } from "../../../utils/array.js";
import AttemptBadge from "../AttemptBadge.jsx";
import "./Activities.css";

export default function OrderingActivity({ segment, onBack, onComplete, onAttempt, attemptStats, isTeacher }) {
  const items = useMemo(
    () =>
      shuffle(
        segment.items.map((text, index) => ({
          text,
          correctIndex: index,
        })),
      ),
    [segment.items],
  );
  const [order, setOrder] = useState(() => items.map(() => ""));
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const availablePositions = useMemo(
    () => items.map((_, index) => String(index + 1)),
    [items],
  );

  const handleSubmit = () => {
    if (resolved) return;
    const filled = order.every((value) => value);
    if (!filled) {
      setFeedback({ tone: "error", message: "Assign an order to each item." });
      return;
    }
    const unique = new Set(order);
    if (unique.size !== order.length) {
      setFeedback({ tone: "error", message: "Use each position only once." });
      return;
    }
    const correctCount = order.filter((value, index) => Number(value) - 1 === items[index].correctIndex).length;
    const passed = correctCount === items.length;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Sequence locked in!" : "Some steps are out of order.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount,
      totalCount: items.length,
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
      <div className="activity-ordering">
        {items.map((item, index) => (
          <div key={item.text} className="activity-ordering__item">
            <span>{item.text}</span>
            <select
              value={order[index]}
              disabled={resolved && !isTeacher}
              onChange={(event) => {
                const value = event.target.value;
                setOrder((prev) => {
                  const next = [...prev];
                  next[index] = value;
                  return next;
                });
                setFeedback(null);
              }}
            >
              <option value="">Position…</option>
              {availablePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
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
            Check order
          </button>
        </div>
      </div>
      {feedback && (
        <p className={`gamified-feedback ${feedback.tone === "error" ? "is-error" : "is-success"}`}>{feedback.message}</p>
      )}
    </article>
  );
}

