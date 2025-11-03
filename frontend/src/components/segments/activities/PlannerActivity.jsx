import { useState } from "react";
import AttemptBadge from "../AttemptBadge.jsx";
import "./Activities.css";

export default function PlannerActivity({
  segment,
  onComplete,
  onBack,
  plannerValues = {},
  onPlannerSave,
  isTeacher,
  attemptStats,
  onAttempt,
}) {
  const panels = segment.panels ?? [];
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(() =>
    panels.every((panel) => {
      const value = plannerValues[panel.id];
      return typeof value === "string" && value.trim().length > 0;
    }),
  );

  const handleChange = (panelId, value) => {
    onPlannerSave?.(panelId, value);
    setFeedback(null);
  };

  const submitSuccess = () => {
    const total = panels.length || 1;
    setLocked(true);
    onAttempt?.(segment.id, {
      success: true,
      correctCount: total,
      totalCount: total,
      onAdvance: () => {
        onComplete();
      },
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const allFilled = panels.every((panel) => {
      const value = plannerValues[panel.id];
      return typeof value === "string" && value.trim().length > 0;
    });
    if (!allFilled) {
      setFeedback({ tone: "error", message: "Complete every panel before locking the planner." });
      return;
    }
    submitSuccess();
  };

  const handleTeacherComplete = () => {
    submitSuccess();
  };

  return (
    <article className="gamified-card">
      <header>
        <h3>{segment.heading}</h3>
        {segment.instructions && <p>{segment.instructions}</p>}
        <AttemptBadge attemptStats={attemptStats} />
      </header>
      <form className="activity-planner" onSubmit={handleSubmit}>
        {panels.map((panel) => (
          <label key={panel.id} className="activity-planner__panel">
            <span>{panel.label}</span>
            <textarea
              value={plannerValues[panel.id] ?? ""}
              onChange={(event) => handleChange(panel.id, event.target.value)}
              rows={4}
              disabled={locked && !isTeacher}
            />
          </label>
        ))}
        <div className="gamified-segment-nav">
          {onBack ? (
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="gamified-segment-actions">
            {isTeacher && (
              <button type="button" className="btn btn--outline" onClick={handleTeacherComplete}>
                Mark complete
              </button>
            )}
            <button type="submit" className="btn btn--primary" disabled={locked && !isTeacher}>
              Lock planner
            </button>
          </div>
        </div>
        {feedback && (
          <p className={`gamified-feedback ${feedback.tone === "error" ? "is-error" : "is-success"}`}>
            {feedback.message}
          </p>
        )}
      </form>
    </article>
  );
}


