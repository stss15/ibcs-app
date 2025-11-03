import "./Segments.css";

export default function SegmentNav({ onBack, onComplete, completeLabel = "Continue", completeDisabled = false }) {
  return (
    <div className="gamified-segment-nav">
      {onBack ? (
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
      ) : (
        <span />
      )}
      <div className="gamified-segment-actions">
        <button type="button" className="btn btn--primary" onClick={onComplete} disabled={completeDisabled}>
          {completeLabel}
        </button>
      </div>
    </div>
  );
}

