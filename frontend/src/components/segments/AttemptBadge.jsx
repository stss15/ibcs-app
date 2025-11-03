import "./Segments.css";

export default function AttemptBadge({ attemptStats }) {
  if (!attemptStats) {
    return null;
  }
  const attempts = attemptStats?.count ?? 0;
  const correct = attemptStats?.correct ?? 0;

  return (
    <span className="gamified-attempt-badge">
      Attempts: {attempts} · Correct: {correct}/{attempts}
    </span>
  );
}

