import { useMemo, useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

function SortableRow({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <motion.div ref={setNodeRef} layout className="formative-card" style={style} data-id={item.id} {...attributes} {...listeners}>
      <span className="formative-card__handle" aria-hidden="true">
        ☰
      </span>
      <span>{item.content || item.label || item.text}</span>
    </motion.div>
  );
}

function MultipleChoice({ question, onSubmit, allowRetry, disabled }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const evaluate = () => {
    const isCorrect = selected === question.answer;
    setFeedback({ isCorrect });
    onSubmit?.({
      status: "completed",
      score: isCorrect ? 1 : 0,
      attempts: 1,
      details: [{ questionId: question.id, isCorrect }],
    });
    if (isCorrect) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 } });
    }
  };

  const reset = () => {
    setSelected(null);
    setFeedback(null);
  };

  return (
    <div className="formative">
      <p className="formative__prompt">{question.prompt}</p>
      <div className="formative__options">
        {question.options?.map((option) => (
          <label key={option.id} className={`formative-option ${selected === option.id ? "is-selected" : ""}`}>
            <input
              type="radio"
              name={question.id}
              disabled={Boolean(feedback) || disabled}
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
            />
            <span>{option.label || option.text}</span>
          </label>
        ))}
      </div>
      <footer className="formative__footer">
        {!feedback && (
          <button type="button" className="y7-btn y7-btn--primary" onClick={evaluate} disabled={selected === null || disabled}>
            Check answer
          </button>
        )}
        {feedback && allowRetry && (
          <button type="button" className="y7-btn" onClick={reset}>
            Try again
          </button>
        )}
        {feedback && <span className={`formative__badge ${feedback.isCorrect ? "is-correct" : "is-incorrect"}`}>{feedback.isCorrect ? "Correct" : "Try again"}</span>}
      </footer>
    </div>
  );
}

function OrderingAssessment({ question, sessionId, studentId, onComplete, disabled }) {
  const [items, setItems] = useState(() => question.items ?? []);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [activeId, setActiveId] = useState(null);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const evaluate = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    const submittedIds = items.map((item) => item.id);
    const correct = JSON.stringify(submittedIds) === JSON.stringify(question.correctOrder);
    if (correct) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    setFeedback({ correct });
    onComplete?.(correct);
  };

  const reset = () => {
    setItems(question.items);
    setFeedback(null);
    setAttempts(0);
  };

  return (
    <div className="formative">
      <p className="formative__prompt">{question.prompt}</p>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={({ active }) => setActiveId(active.id)} onDragCancel={() => setActiveId(null)}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="formative__stack">
            {items.map((item) => (
              <SortableRow key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <motion.div layout className="formative-card formative-card--overlay">
              <span className="formative-card__handle" aria-hidden="true">
                ☰
              </span>
              <span>{items.find((item) => item.id === activeId)?.content || ""}</span>
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <footer className="formative__footer">
        {!feedback && (
          <button type="button" className="y7-btn y7-btn--primary" onClick={evaluate} disabled={disabled}>
            Check order
          </button>
        )}
        {feedback && question.allowRetry !== false && (
          <button type="button" className="y7-btn" onClick={reset}>
            Try again
          </button>
        )}
        {feedback && <span className={`formative__badge ${feedback.correct ? "is-correct" : "is-incorrect"}`}>{feedback.correct ? "Great work" : "One more attempt"}</span>}
      </footer>
    </div>
  );
}

function ClassificationAssessment({ question, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);

  const evaluate = () => {
    const summary = question.items.map((item) => {
      const submitted = answers[item.id];
      const isCorrect = submitted === item.correct;
      return {
        id: item.id,
        isCorrect,
      };
    });
    const correctCount = summary.filter((item) => item.isCorrect).length;
    const score = summary.length ? correctCount / summary.length : 1;
    setFeedback({ summary, score });
    if (score === 1) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
    onComplete?.(score === 1);
  };

  const reset = () => {
    setAnswers({});
    setFeedback(null);
  };

  return (
    <div className="formative">
      <p className="formative__prompt">{question.prompt}</p>
      <div className="formative__classification">
        {question.items.map((item) => (
          <div key={item.id} className="formative-classification__row">
            <span>{item.label}</span>
            <select value={answers[item.id] || ""} onChange={(event) => setAnswers((prev) => ({ ...prev, [item.id]: event.target.value }))}>
              <option value="" disabled>
                Select category
              </option>
              {question.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {feedback && (
              <span className={`formative__badge ${feedback.summary.find((entry) => entry.id === item.id)?.isCorrect ? "is-correct" : "is-incorrect"}`}>
                {feedback.summary.find((entry) => entry.id === item.id)?.isCorrect ? "Correct" : "Incorrect"}
              </span>
            )}
          </div>
        ))}
      </div>
      <footer className="formative__footer">
        {!feedback && (
          <button type="button" className="y7-btn y7-btn--primary" onClick={evaluate}>
            Check answers
          </button>
        )}
        {feedback && question.allowRetry !== false && (
          <button type="button" className="y7-btn" onClick={reset}>
            Try again
          </button>
        )}
      </footer>
    </div>
  );
}

export default function FormativeAssessment({ question, variant, sessionId, studentId, onComplete, allowRetry = true, disabled }) {
  const resolvedVariant = useMemo(() => {
    if (variant) return variant;
    if (Array.isArray(question?.options) && typeof question?.answer !== "undefined") return "multiple-choice";
    if (Array.isArray(question?.items) && Array.isArray(question?.correctOrder)) return "ordering";
    return "ordering";
  }, [question, variant]);

  if (resolvedVariant === "multiple-choice") {
    return <MultipleChoice question={question} allowRetry={allowRetry} disabled={disabled} onSubmit={onComplete} />;
  }

  if (resolvedVariant === "classification") {
    return <ClassificationAssessment question={question} onComplete={onComplete} />;
  }

  return <OrderingAssessment question={question} sessionId={sessionId} studentId={studentId} onComplete={onComplete} disabled={disabled} />;
}

