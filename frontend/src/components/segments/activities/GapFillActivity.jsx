import { Fragment, useEffect, useMemo, useState } from "react";
import AttemptBadge from "../AttemptBadge.jsx";
import "./Activities.css";

const PLACEHOLDER_REGEX = /\[\[([^[\]]+)\]\]/g;

export default function GapFillActivity({ segment, onBack, onComplete, onAttempt, attemptStats, isTeacher }) {
  const blanks = useMemo(() => segment.blanks ?? [], [segment.blanks]);
  const [responses, setResponses] = useState({});
  const [assignments, setAssignments] = useState(() => {
    return blanks.reduce((acc, blank) => {
      acc[blank.id] = null;
      return acc;
    }, {});
  });
  const [pendingToken, setPendingToken] = useState(null);
  const [draggingToken, setDraggingToken] = useState(null);
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

  const interactionMode = segment.interaction ?? segment.mode ?? "select";
  const useTokenMode = interactionMode === "drag" || interactionMode === "tokens";
  const tokens = useMemo(() => {
    if (!useTokenMode) return [];
    if (Array.isArray(segment.tokens) && segment.tokens.length > 0) {
      return segment.tokens;
    }
    const unique = new Map();
    blanks.forEach((blank) => {
      (blank.options ?? []).forEach((option) => {
        const id = typeof option === "string" ? option : option.id;
        const label = typeof option === "string" ? option : option.label;
        if (id && !unique.has(id)) {
          unique.set(id, label ?? id);
        }
      });
    });
    return Array.from(unique.entries()).map(([id, label]) => ({ id, label }));
  }, [blanks, segment.tokens, useTokenMode]);

  const assignedTokenIds = useMemo(() => {
    return new Set(Object.values(assignments || {}).filter(Boolean));
  }, [assignments]);

  const allowInteraction = !resolved || isTeacher;

  useEffect(() => {
    setResponses({});
    setAssignments(
      blanks.reduce((acc, blank) => {
        acc[blank.id] = null;
        return acc;
      }, {}),
    );
    setPendingToken(null);
    setDraggingToken(null);
    setResolved(false);
    setFeedback(null);
  }, [blanks, useTokenMode, segment.text]);

  const activateToken = (tokenId) => {
    if (!allowInteraction) return;
    if (assignedTokenIds.has(tokenId)) {
      setAssignments((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((blankId) => {
          if (next[blankId] === tokenId) {
            next[blankId] = null;
          }
        });
        return next;
      });
      setPendingToken(null);
      setFeedback(null);
      return;
    }
    setPendingToken((prev) => (prev === tokenId ? null : tokenId));
    setFeedback(null);
  };

  const assignTokenToBlank = (blankId, tokenId) => {
    if (!allowInteraction || !tokenId) return;
    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === tokenId) {
          next[key] = null;
        }
      });
      next[blankId] = tokenId;
      return next;
    });
    setPendingToken(null);
    setFeedback(null);
  };

  const clearBlank = (blankId) => {
    setAssignments((prev) => {
      const next = { ...prev };
      next[blankId] = null;
      return next;
    });
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (resolved) return;
    let correctCount = 0;

    if (useTokenMode) {
      const missing = blanks.some((blank) => !assignments[blank.id]);
      if (missing) {
        setFeedback({ tone: "error", message: "Place every token before checking." });
        return;
      }
      blanks.forEach((blank) => {
        if (assignments[blank.id] === blank.answer) {
          correctCount += 1;
        }
      });
    } else {
      const missing = blanks.some((blank) => !responses[blank.id]);
      if (missing) {
        setFeedback({ tone: "error", message: "Fill every blank before checking." });
        return;
      }
      blanks.forEach((blank) => {
        if (responses[blank.id] === blank.answer) {
          correctCount += 1;
        }
      });
    }

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
      <div className={`activity-gapfill${useTokenMode ? " activity-gapfill--tokens" : ""}`}>
        {useTokenMode && (
          <div className="activity-gapfill__bank" aria-label="Word bank">
            {tokens.map((token) => {
              const isAssigned = assignedTokenIds.has(token.id);
              const isSelected = pendingToken === token.id || draggingToken === token.id;
              return (
                <button
                  key={token.id}
                  type="button"
                  className={`activity-gapfill__token${isAssigned ? " is-assigned" : ""}${isSelected ? " is-selected" : ""}`}
                  disabled={resolved && !isTeacher}
                  onClick={() => activateToken(token.id)}
                  draggable={allowInteraction && !isAssigned}
                  onDragStart={(event) => {
                    if (!allowInteraction || isAssigned) return;
                    event.dataTransfer.setData("text/plain", token.id);
                    event.dataTransfer.effectAllowed = "move";
                    setPendingToken(token.id);
                    setDraggingToken(token.id);
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
          </div>
        )}
        <p className="activity-gapfill__text">
          {parts.map((part, index) => {
            if (part.type === "text") {
              return <Fragment key={`text-${index}`}>{part.value}</Fragment>;
            }
            const blank = blanks.find((entry) => entry.id === part.id) ?? { id: part.id, options: [] };
            if (!blank) return null;

            if (useTokenMode) {
              const assignedId = assignments[blank.id];
              const assignedToken = tokens.find((token) => token.id === assignedId);
              const isCorrect = resolved && assignedToken?.id === blank.answer;
              const isIncorrect = resolved && assignedToken && assignedToken.id !== blank.answer;
              return (
                <span
                  key={blank.id}
                  className={`activity-gapfill__blank activity-gapfill__blank--drop${
                    isCorrect ? " is-correct" : ""
                  }${isIncorrect ? " is-incorrect" : ""}`}
                >
                  <button
                    type="button"
                    className="activity-gapfill__drop"
                    disabled={resolved && !isTeacher}
                    onClick={() => {
                      if (pendingToken) {
                        assignTokenToBlank(blank.id, pendingToken);
                      } else if (assignedId) {
                        clearBlank(blank.id);
                      }
                    }}
                    onDragOver={(event) => {
                      if (!allowInteraction) return;
                      event.preventDefault();
                    }}
                    onDrop={(event) => {
                      if (!allowInteraction) return;
                      event.preventDefault();
                      const tokenId = event.dataTransfer.getData("text/plain") || pendingToken;
                      assignTokenToBlank(blank.id, tokenId);
                      setDraggingToken(null);
                    }}
                  >
                    {assignedToken ? assignedToken.label : "Drop word"}
                  </button>
                </span>
              );
            }

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
                  {(blank.options ?? []).map((option) => (
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
