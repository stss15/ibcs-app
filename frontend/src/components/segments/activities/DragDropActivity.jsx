import { useState } from "react";
import AttemptBadge from "../AttemptBadge.jsx";
import FeedbackPanel from "../../ui/FeedbackPanel.jsx";
import ButtonGroup from "../../ui/ButtonGroup.jsx";
import "./Activities.css";

export default function DragDropActivity({ segment, onBack, onComplete, onAttempt, attemptStats, isTeacher }) {
  const [assignments, setAssignments] = useState(() => {
    return segment.targets.map((target) => ({
      targetId: target.id,
      tokenId: null,
    }));
  });
  const [selectedToken, setSelectedToken] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const assignedTokenIds = assignments.map((entry) => entry.tokenId).filter(Boolean);

  const handleAssign = (targetId) => {
    if (!selectedToken) return;
    setAssignments((prev) =>
      prev.map((entry) => {
        if (entry.targetId === targetId) {
          return { ...entry, tokenId: selectedToken };
        }
        if (entry.tokenId === selectedToken) {
          return { ...entry, tokenId: null };
        }
        return entry;
      }),
    );
    setSelectedToken(null);
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (resolved) return;
    const incomplete = assignments.some((entry) => !entry.tokenId);
    if (incomplete) {
      setFeedback({ tone: "error", message: "Place every token on a target." });
      return;
    }
    let correctCount = 0;
    const targetMap = new Map(assignments.map((entry) => [entry.targetId, entry.tokenId]));
    segment.targets.forEach((target) => {
      if (target.answer === targetMap.get(target.id)) {
        correctCount += 1;
      }
    });
    const passed = correctCount === segment.targets.length;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "All targets matched!" : "Check the highlighted tokens and retry.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount,
      totalCount: segment.targets.length,
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
      <div className="activity-dragdrop">
        <div className="activity-dragdrop__bank" aria-label="Token bank">
          {segment.tokens.map((token) => {
            const picked = assignedTokenIds.includes(token.id);
            return (
              <button
                type="button"
                key={token.id}
                className={`activity-dragdrop__token${picked ? " is-picked" : ""}${
                  selectedToken === token.id ? " is-selected" : ""
                }`}
                onClick={() => {
                  if (picked) {
                    setAssignments((prev) =>
                      prev.map((entry) =>
                        entry.tokenId === token.id ? { ...entry, tokenId: null } : entry,
                      ),
                    );
                    setFeedback(null);
                    return;
                  }
                  setSelectedToken((prev) => (prev === token.id ? null : token.id));
                }}
              >
                {token.label}
              </button>
            );
          })}
        </div>

        <div className="activity-dragdrop__targets">
          {segment.targets.map((target) => {
            const assignment = assignments.find((entry) => entry.targetId === target.id);
            const assignedToken = segment.tokens.find((token) => token.id === assignment?.tokenId);
            const isCorrect = assignedToken?.id === target.answer;
            return (
              <button
                type="button"
                key={target.id}
                className={`activity-dragdrop__target${
                  assignment?.tokenId ? " is-filled" : ""
                }${resolved ? (isCorrect ? " is-correct" : " is-incorrect") : ""}`}
                onClick={() => handleAssign(target.id)}
                disabled={resolved && !isTeacher}
              >
                <div>
                  <strong>{target.prompt}</strong>
                  <div>{assignedToken ? assignedToken.label : "Tap to assign"}</div>
                </div>
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
        <ButtonGroup align="end">
          <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={resolved && !isTeacher}>
            Check matches
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

