import { useMemo, useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

import classNames from "../../utils/classNames.js";
import "./FormativeAssessment.css";

function SortableRow({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    "--sortable-transform": transform ? CSS.Transform.toString(transform) : undefined,
    "--sortable-transition": transition || undefined,
    "--sortable-opacity": isDragging ? 0.72 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className="formative-card"
      data-id={item.id}
      data-dragging={isDragging ? "true" : "false"}
      style={style}
      role="listitem"
      {...attributes}
      {...listeners}
    >
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selected === null || disabled) return;
    evaluate();
  };

  const promptId = `${question.id}-prompt`;

  return (
    <form className="formative formative--choice" onSubmit={handleSubmit}>
      <p className="formative__prompt" id={promptId}>
        {question.prompt}
      </p>
      <div className="formative__options" role="radiogroup" aria-labelledby={promptId}>
        {question.options?.map((option) => (
          <label
            key={option.id}
            className={classNames("formative-option", { "is-selected": selected === option.id })}
          >
            <input
              type="radio"
              name={question.id}
              value={option.id}
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
          <button type="submit" className="y7-btn y7-btn--primary" disabled={selected === null || disabled}>
            Check answer
          </button>
        )}
        {feedback && allowRetry && (
          <button type="button" className="y7-btn" onClick={reset}>
            Try again
          </button>
        )}
        {feedback && (
          <span
            className={classNames("formative__badge", feedback.isCorrect ? "is-correct" : "is-incorrect")}
            role="status"
          >
            {feedback.isCorrect ? "Correct" : "Try again"}
          </span>
        )}
      </footer>
    </form>
  );
}

function OrderingAssessment({ question, onComplete, disabled }) {
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
    <section className="formative formative--ordering">
      <p className="formative__prompt">{question.prompt}</p>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="formative__stack" role="list">
            {items.map((item) => (
              <SortableRow key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <motion.div
              layout
              className="formative-card formative-card--overlay"
              data-dragging="true"
              style={{
                "--sortable-transform": "translate3d(0, 0, 0)",
                "--sortable-opacity": 1,
              }}
            >
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
        {feedback && (
          <span
            className={classNames("formative__badge", feedback.correct ? "is-correct" : "is-incorrect")}
            role="status"
          >
            {feedback.correct ? "Great work" : "One more attempt"}
          </span>
        )}
      </footer>
    </section>
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

  const handleSubmit = (event) => {
    event.preventDefault();
    evaluate();
  };

  return (
    <form className="formative formative--classification" onSubmit={handleSubmit}>
      <p className="formative__prompt">{question.prompt}</p>
      <div className="formative__classification">
        {question.items.map((item) => {
          const fieldId = `${question.id}-${item.id}`;
          const entry = feedback?.summary.find((summary) => summary.id === item.id);
          const toneClass = entry ? (entry.isCorrect ? "is-correct" : "is-incorrect") : null;
          return (
            <div key={item.id} className={classNames("formative-classification__row", { "has-feedback": Boolean(entry) })}>
              <label className="formative-classification__label" htmlFor={fieldId}>
                {item.label}
              </label>
              <select
                id={fieldId}
                value={answers[item.id] || ""}
                onChange={(event) => setAnswers((prev) => ({ ...prev, [item.id]: event.target.value }))}
              >
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
                <span
                  className={classNames("formative__badge", toneClass)}
                  role="status"
                >
                  {entry?.isCorrect ? "Correct" : "Incorrect"}
              </span>
            )}
          </div>
          );
        })}
      </div>
      <footer className="formative__footer">
        {!feedback && (
          <button type="submit" className="y7-btn y7-btn--primary">
            Check answers
          </button>
        )}
        {feedback && question.allowRetry !== false && (
          <button type="button" className="y7-btn" onClick={reset}>
            Try again
          </button>
        )}
      </footer>
    </form>
  );
}

export default function FormativeAssessment({ question, variant, onComplete, allowRetry = true, disabled }) {
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

  return <OrderingAssessment question={question} onComplete={onComplete} disabled={disabled} />;
}

