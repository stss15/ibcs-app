import { useEffect, useMemo, useState } from "react";
import AttemptBadge from "../AttemptBadge.jsx";
import FeedbackPanel from "../../ui/FeedbackPanel.jsx";
import ButtonGroup from "../../ui/ButtonGroup.jsx";
import "./Activities.css";

export default function ClassificationActivity({
  segment,
  onBack,
  onComplete,
  onAttempt,
  attemptStats,
  isTeacher,
}) {
  const categories = useMemo(() => segment.categories ?? [], [segment.categories]);
  const tokens = useMemo(() => segment.tokens ?? [], [segment.tokens]);
  const [assignments, setAssignments] = useState(() =>
    tokens.reduce((acc, token) => {
      acc[token.id] = null;
      return acc;
    }, {}),
  );
  const [pendingToken, setPendingToken] = useState(null);
  const [draggingToken, setDraggingToken] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setAssignments(
      tokens.reduce((acc, token) => {
        acc[token.id] = null;
        return acc;
      }, {}),
    );
    setPendingToken(null);
    setDraggingToken(null);
    setResolved(false);
    setFeedback(null);
  }, [tokens, categories, segment.id]);

  const allowInteraction = !resolved || isTeacher;
  const placedTokenIds = useMemo(() => new Set(Object.keys(assignments).filter((id) => assignments[id])), [assignments]);

  const unplacedTokens = tokens.filter((token) => !placedTokenIds.has(token.id));

  const assignToken = (tokenId, categoryId) => {
    if (!allowInteraction || !tokenId) return;
    setAssignments((prev) => ({
      ...prev,
      [tokenId]: categoryId,
    }));
    setPendingToken(null);
    setFeedback(null);
  };

  const removeToken = (tokenId) => {
    setAssignments((prev) => ({
      ...prev,
      [tokenId]: null,
    }));
    setPendingToken(null);
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (resolved) return;
    const total = tokens.length;
    const missing = tokens.some((token) => !assignments[token.id]);
    if (missing) {
      setFeedback({ tone: "error", message: "Classify every card before checking." });
      return;
    }
    let correctCount = 0;
    tokens.forEach((token) => {
      if (assignments[token.id] === token.answer) {
        correctCount += 1;
      }
    });
    const passed = correctCount === total;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Everything is in the right bucket!" : "Some cards need to move. Check the highlights.",
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

  const tokensByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = tokens.filter((token) => assignments[token.id] === category.id);
      return acc;
    }, {});
  }, [assignments, categories, tokens]);

  return (
    <article className="gamified-card">
      <header>
        <h3>{segment.heading}</h3>
        <AttemptBadge attemptStats={attemptStats} />
        {segment.instructions && <p>{segment.instructions}</p>}
      </header>

      <div className="activity-classification">
        <div className="activity-classification__bank" aria-label="Token bank">
          {unplacedTokens.map((token) => {
            const isSelected = pendingToken === token.id || draggingToken === token.id;
            return (
              <button
                key={token.id}
                type="button"
                className={`activity-classification__token${isSelected ? " is-selected" : ""}`}
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
                  setDraggingToken(token.id);
                  setPendingToken(token.id);
                }}
                onDragEnd={() => {
                  setDraggingToken(null);
                  setPendingToken(null);
                }}
              >
                {token.label}
              </button>
            );
          })}
          {unplacedTokens.length === 0 && <span className="activity-classification__bank-empty">All cards placed</span>}
        </div>

        <div className="activity-classification__categories">
          {categories.map((category) => {
            const placed = tokensByCategory[category.id] ?? [];
            return (
              <section
                key={category.id}
                className="activity-classification__category"
                onDragOver={(event) => {
                  if (!allowInteraction) return;
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  if (!allowInteraction) return;
                  event.preventDefault();
                  const tokenId = event.dataTransfer.getData("text/plain") || pendingToken;
                  assignToken(tokenId, category.id);
                  setDraggingToken(null);
                }}
              >
                <header>
                  <h4>{category.title}</h4>
                  {category.description && <p className="muted">{category.description}</p>}
                </header>
                <div className="activity-classification__slots">
                  {placed.map((token) => {
                    const isCorrect = resolved && token.answer === category.id;
                    const isIncorrect = resolved && token.answer !== category.id;
                    return (
                      <button
                        key={token.id}
                        type="button"
                        className={`activity-classification__chip${isCorrect ? " is-correct" : ""}${
                          isIncorrect ? " is-incorrect" : ""
                        }`}
                        disabled={resolved && !isTeacher}
                        onClick={() => {
                          if (!allowInteraction) return;
                          removeToken(token.id);
                        }}
                      >
                        {token.label}
                      </button>
                    );
                  })}
                  {placed.length === 0 && <span className="activity-classification__placeholder">Drop cards here</span>}
                </div>
              </section>
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
        <ButtonGroup align="end">
          <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={resolved && !isTeacher}>
            Check categories
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
