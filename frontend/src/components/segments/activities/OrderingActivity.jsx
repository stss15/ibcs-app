import { useEffect, useMemo, useState } from "react";
import { shuffle } from "../../../utils/array.js";
import AttemptBadge from "../AttemptBadge.jsx";
import FeedbackPanel from "../../ui/FeedbackPanel.jsx";
import ButtonGroup from "../../ui/ButtonGroup.jsx";
import "./Activities.css";

export default function OrderingActivity({ segment, onBack, onComplete, onAttempt, attemptStats, isTeacher }) {
  const baseItems = useMemo(
    () =>
      (segment.items ?? []).map((text, index) => ({
        id: `${segment.id}-${index}`,
        text,
        correctIndex: index,
      })),
    [segment.id, segment.items],
  );

  const [cards, setCards] = useState(() => shuffle(baseItems));
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setCards(shuffle(baseItems));
    setResolved(false);
    setFeedback(null);
  }, [baseItems]);

  const moveCard = (sourceId, targetId) => {
    if (sourceId === targetId) return;
    setCards((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((card) => card.id === sourceId);
      const toIndex = next.findIndex((card) => card.id === targetId);
      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setFeedback(null);
  };

  const moveToEnd = (sourceId) => {
    setCards((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((card) => card.id === sourceId);
      if (fromIndex === -1) return prev;
      const [moved] = next.splice(fromIndex, 1);
      next.push(moved);
      return next;
    });
    setFeedback(null);
  };

  const moveByOffset = (index, delta) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= cards.length) return;
    setCards((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (resolved) return;
    const correctCount = cards.filter((card, index) => card.correctIndex === index).length;
    const passed = correctCount === cards.length;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Sequence locked in!" : "Some steps are out of order.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount,
      totalCount: cards.length,
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
        <p className="activity-ordering__hint">
          Drag and drop each card into the correct sequence. Use the arrow buttons if you prefer keyboard controls.
        </p>
        <ul className="activity-ordering__list">
          {cards.map((card, index) => {
            const isCorrectSpot = card.correctIndex === index;
            const isDropTarget = dragOverId === card.id && draggingId !== card.id;
            const allowInteraction = !resolved || isTeacher;
            return (
              <li
                key={card.id}
                className={`activity-ordering__card${resolved ? (isCorrectSpot ? " is-correct" : " is-incorrect") : ""}${
                  isDropTarget ? " is-drop-target" : ""
                }`}
                draggable={allowInteraction}
                onDragStart={() => allowInteraction && setDraggingId(card.id)}
                onDragEnter={() => allowInteraction && draggingId && setDragOverId(card.id)}
                onDragOver={(event) => {
                  if (!allowInteraction) return;
                  event.preventDefault();
                  if (draggingId && card.id !== draggingId) {
                    setDragOverId(card.id);
                  }
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverId(null);
                }}
                onDrop={(event) => {
                  if (!allowInteraction) return;
                  event.preventDefault();
                  if (draggingId) {
                    moveCard(draggingId, card.id);
                  }
                  setDraggingId(null);
                  setDragOverId(null);
                }}
              >
                <span className="activity-ordering__index">{index + 1}</span>
                <span className="activity-ordering__text">{card.text}</span>
                <div className="activity-ordering__actions">
                  <button
                    type="button"
                    className="activity-ordering__action"
                    onClick={() => moveByOffset(index, -1)}
                    disabled={!allowInteraction || index === 0}
                    aria-label={`Move "${card.text}" up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="activity-ordering__action"
                    onClick={() => moveByOffset(index, 1)}
                    disabled={!allowInteraction || index === cards.length - 1}
                    aria-label={`Move "${card.text}" down`}
                  >
                    ↓
                  </button>
                </div>
              </li>
            );
          })}
          {draggingId && (
            <li
              className={`activity-ordering__dropzone${dragOverId === "end" ? " is-drop-target" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (draggingId) {
                  setDragOverId("end");
                }
              }}
              onDragEnter={() => setDragOverId("end")}
              onDrop={(event) => {
                event.preventDefault();
                if (draggingId) {
                  moveToEnd(draggingId);
                }
                setDraggingId(null);
                setDragOverId(null);
              }}
            >
              Drop here to move to the end
            </li>
          )}
        </ul>
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
            Check order
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
