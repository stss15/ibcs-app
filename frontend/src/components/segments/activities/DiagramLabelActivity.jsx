import { useEffect, useMemo, useState } from "react";
import AttemptBadge from "../AttemptBadge.jsx";
import "./Activities.css";

export default function DiagramLabelActivity({
  segment,
  onBack,
  onComplete,
  onAttempt,
  attemptStats,
  isTeacher,
}) {
  const tokens = useMemo(() => segment.tokens ?? [], [segment.tokens]);
  const targets = useMemo(() => segment.targets ?? [], [segment.targets]);
  const [assignments, setAssignments] = useState(() =>
    targets.reduce((acc, target) => {
      acc[target.id] = null;
      return acc;
    }, {}),
  );
  const [pendingToken, setPendingToken] = useState(null);
  const [draggingToken, setDraggingToken] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setAssignments(
      targets.reduce((acc, target) => {
        acc[target.id] = null;
        return acc;
      }, {}),
    );
    setPendingToken(null);
    setDraggingToken(null);
    setResolved(false);
    setFeedback(null);
  }, [targets, tokens, segment.id]);

  const allowInteraction = !resolved || isTeacher;
  const assignedTokenIds = useMemo(() => new Set(Object.values(assignments).filter(Boolean)), [assignments]);
  const availableTokens = tokens.filter((token) => !assignedTokenIds.has(token.id));

  const assignToTarget = (targetId, tokenId) => {
    if (!allowInteraction || !tokenId) return;
    setAssignments((prev) => ({
      ...prev,
      [targetId]: tokenId,
    }));
    setPendingToken(null);
    setFeedback(null);
  };

  const removeFromTarget = (targetId) => {
    setAssignments((prev) => ({
      ...prev,
      [targetId]: null,
    }));
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (resolved) return;
    const total = targets.length;
    const missing = targets.some((target) => !assignments[target.id]);
    if (missing) {
      setFeedback({ tone: "error", message: "Label every hotspot before checking." });
      return;
    }
    let correctCount = 0;
    targets.forEach((target) => {
      if (assignments[target.id] === target.answer) {
        correctCount += 1;
      }
    });
    const passed = correctCount === total;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "All labels are correct!" : "Some labels need adjusting. Review the highlights.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount,
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
      <div className="activity-diagram">
        <div className="activity-diagram__bank" aria-label="Label tokens">
          {availableTokens.map((token) => {
            const isSelected = pendingToken === token.id || draggingToken === token.id;
            return (
              <button
                key={token.id}
                type="button"
                className={`activity-diagram__token${isSelected ? " is-selected" : ""}`}
                disabled={resolved && !isTeacher}
                onClick={() => {
                  if (!allowInteraction) return;
                  setPendingToken((prev) => (prev === token.id ? null : token.id));
                  setFeedback(null);
                }}
                draggable={allowInteraction}
                onDragStart={(event) => {
                  if (!allowInteraction) return;
                  event.dataTransfer.setData("text/plain", token.id);
                  event.dataTransfer.effectAllowed = "move";
                  setPendingToken(token.id);
                  setDraggingToken(token.id);
                }}
                onDragEnd={() => {
                  setPendingToken(null);
                  setDraggingToken(null);
                }}
              >
                {token.label}
              </button>
            );
          })}
          {availableTokens.length === 0 && (
            <span className="activity-diagram__placeholder">All labels placed</span>
          )}
        </div>

        <div className="activity-diagram__canvas">
          <img src={segment.image?.src} alt={segment.image?.alt ?? ""} />
          {targets.map((target) => {
            const tokenId = assignments[target.id];
            const token = tokens.find((entry) => entry.id === tokenId);
            const isCorrect = resolved && token?.id === target.answer;
            const isIncorrect = resolved && token && token.id !== target.answer;
            return (
              <button
                key={target.id}
                type="button"
                className={`activity-diagram__target${isCorrect ? " is-correct" : ""}${
                  isIncorrect ? " is-incorrect" : ""
                }`}
                style={{
                  '--target-x': `${target.x}%`,
                  '--target-y': `${target.y}%`,
                }}
                disabled={resolved && !isTeacher}
                onClick={() => {
                  if (!allowInteraction) return;
                  if (pendingToken) {
                    assignToTarget(target.id, pendingToken);
                  } else if (tokenId) {
                    removeFromTarget(target.id);
                  }
                }}
                onDragOver={(event) => {
                  if (!allowInteraction) return;
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  if (!allowInteraction) return;
                  event.preventDefault();
                  const tokenFromDrag = event.dataTransfer.getData("text/plain") || pendingToken;
                  assignToTarget(target.id, tokenFromDrag);
                  setDraggingToken(null);
                }}
              >
                {token ? token.label : "Drop label"}
              </button>
            );
          })}
        </div>
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
            Check labels
          </button>
        </div>
      </div>
      {feedback && (
        <p className={`gamified-feedback ${feedback.tone === "error" ? "is-error" : "is-success"}`}>{feedback.message}</p>
      )}
    </article>
  );
}
