import { useEffect, useMemo, useState } from "react";
import AttemptBadge from "../AttemptBadge.jsx";
import FeedbackPanel from "../../ui/FeedbackPanel.jsx";
import ButtonGroup from "../../ui/ButtonGroup.jsx";
import "./Activities.css";

export default function SpotTheErrorActivity({
  segment,
  onBack,
  onComplete,
  onAttempt,
  attemptStats,
  isTeacher,
}) {
  const items = useMemo(() => segment.items ?? [], [segment.items]);
  const [selected, setSelected] = useState(() => new Set());
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setSelected(new Set());
    setResolved(false);
    setFeedback(null);
  }, [segment.id]);

  const allowInteraction = !resolved || isTeacher;
  const errorIds = useMemo(() => new Set(items.filter((item) => item.isError).map((item) => item.id)), [items]);

  const toggleItem = (id) => {
    if (!allowInteraction) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (resolved) return;
    const total = items.length;
    const correctSelections = items.filter((item) => {
      const userSelected = selected.has(item.id);
      const shouldSelect = Boolean(item.isError);
      return userSelected === shouldSelect;
    }).length;
    const passed = correctSelections === total;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Bug hunt complete!" : "Some choices are off. Review the highlights and try again.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount: correctSelections,
      totalCount: total,
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

      <div className="activity-spot">
        {items.map((item, index) => {
          const userSelected = selected.has(item.id);
          const shouldSelect = errorIds.has(item.id);
          const stateClass = resolved
            ? shouldSelect
              ? " is-correct"
              : userSelected
              ? " is-incorrect"
              : ""
            : userSelected
            ? " is-selected"
            : "";
          return (
            <button
              key={item.id}
              type="button"
              className={`activity-spot__item${stateClass}`}
              disabled={!allowInteraction}
              onClick={() => toggleItem(item.id)}
            >
              <span className="activity-spot__badge">{index + 1}</span>
              <span className="activity-spot__text">{item.text}</span>
              {resolved && item.explanation && (
                <span className="activity-spot__explanation">{item.explanation}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="gamified-segment-nav">
        {onBack ? (
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <ButtonGroup align="end">
          <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={resolved && !isTeacher}>
            Check answers
          </button>
        </ButtonGroup>
      </div>
      {feedback && (
        <FeedbackPanel tone={feedback.tone === "error" ? "error" : "success"}>
          {feedback.message}
        </FeedbackPanel>
      )}
    </article>
  );
}
