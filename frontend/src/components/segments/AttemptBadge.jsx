import "./Segments.css";

export default function AttemptBadge({ attemptStats }) {
  if (!attemptStats) {
    return null;
  }
  const attempts = attemptStats.count ?? 0;
  const clears = attemptStats.correct ?? 0;
  const last = attemptStats.last ?? {};
  const lastCorrect = Number.isFinite(last.correct) ? last.correct : null;
  const lastTotal = Number.isFinite(last.total) && last.total > 0 ? last.total : null;
  const lastSuccess = last.success;

  return (
    <span className="gamified-attempt-badge">
      Attempts: {attempts}
      <span aria-hidden="true"> · </span>
      Cleared: {clears}
      {lastTotal !== null && lastTotal > 0 && (
        <>
          <span aria-hidden="true"> · </span>
          Last score: {lastCorrect ?? 0}/{lastTotal}
        </>
      )}
      {lastSuccess === false && (
        <>
          <span aria-hidden="true"> · </span>
          Try again
        </>
      )}
    </span>
  );
}
