import { useEffect } from "react";
import "./Segments.css";
import "./AssessmentResultsModal.css";

const successMessages = ["Great job!", "Well done!", "XP unlocked!", "Keep the streak going!"];
const tryAgainMessages = ["Almost there!", "Give it another shot!", "Check the hints and retry."];

function pickMessage(success) {
  const pool = success ? successMessages : tryAgainMessages;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function AssessmentResultsModal({ success, correctCount, totalCount, xpAward, onClose, onContinue }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
      if (event.key === "Enter") {
        onContinue?.();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onContinue]);

  const message = pickMessage(success);

  return (
    <div className={`results-modal ${success ? "is-success" : "is-error"}`}>
      <div className="results-modal__backdrop" onClick={onClose} />
      <div className="results-modal__card">
        <header>
          <h3>{success ? "Checkpoint cleared!" : "Keep going!"}</h3>
          <p>{message}</p>
        </header>
        <div className="results-modal__stats">
          <div>
            <span>Score</span>
            <strong>
              {correctCount}/{totalCount}
            </strong>
          </div>
          <div>
            <span>XP gained</span>
            <strong>{xpAward}</strong>
          </div>
        </div>
        <div className="results-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn--primary" onClick={onContinue}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

