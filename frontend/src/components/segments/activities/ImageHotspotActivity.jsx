import { useState } from "react";
import AttemptBadge from "../AttemptBadge.jsx";
import FeedbackPanel from "../../ui/FeedbackPanel.jsx";
import ButtonGroup from "../../ui/ButtonGroup.jsx";
import "./Activities.css";

export default function ImageHotspotActivity({ segment, onBack, onComplete, onAttempt, attemptStats, isTeacher }) {
  const [selected, setSelected] = useState([]);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const toggleHotspot = (id) => {
    if (resolved && !isTeacher) return;
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      }
      return [...prev, id];
    });
    setFeedback(null);
  };

  const handleSubmit = () => {
    const correctSet = new Set(segment.correctHotspots ?? []);
    const selectedSet = new Set(selected);
    let correctCount = 0;
    segment.hotspots.forEach((hotspot) => {
      const shouldSelect = correctSet.has(hotspot.id);
      const didSelect = selectedSet.has(hotspot.id);
      if (shouldSelect === didSelect) {
        correctCount += 1;
      }
    });
    const passed = correctCount === segment.hotspots.length;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Hotspots identified!" : "Check the highlighted hotspots and retry.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount: passed ? segment.hotspots.length : correctCount,
      totalCount: segment.hotspots.length,
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
      <div className="activity-hotspot">
        <img src={segment.image?.src} alt={segment.image?.alt ?? ""} />
        {segment.hotspots.map((hotspot, index) => {
          const isSelected = selected.includes(hotspot.id);
          const shouldSelect = (segment.correctHotspots ?? []).includes(hotspot.id);
          const className = [
            "activity-hotspot__point",
            isSelected ? "is-selected" : "",
            resolved && isSelected && !shouldSelect ? "is-incorrect" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              type="button"
              key={hotspot.id}
              className={className}
              style={{
                '--hotspot-x': `${hotspot.x}%`,
                '--hotspot-y': `${hotspot.y}%`,
              }}
              onClick={() => toggleHotspot(hotspot.id)}
            >
              {index + 1}
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
            Check hotspots
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

