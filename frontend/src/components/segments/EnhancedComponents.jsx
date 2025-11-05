import "./EnhancedComponents.css";

/**
 * Modern keyword definition card with icon and hover effects
 */
export function KeywordCard({ term, definition, icon = "●" }) {
  return (
    <div className="keyword-card">
      <div className="keyword-card__header">
        <span className="keyword-card__icon">{icon}</span>
        <h4 className="keyword-card__term">{term}</h4>
      </div>
      <p className="keyword-card__definition">{definition}</p>
    </div>
  );
}

/**
 * Enhanced callout/info box for highlighting important information
 */
export function Callout({ type = "info", title, children, icon }) {
  const iconMap = {
    info: "ℹ️",
    tip: "💡",
    warning: "⚠️",
    success: "✓",
    error: "⚠️",
  };

  return (
    <div className={`callout callout--${type}`}>
      <div className="callout__header">
        <span className="callout__icon">{icon || iconMap[type]}</span>
        {title && <strong className="callout__title">{title}</strong>}
      </div>
      <div className="callout__body">{children}</div>
    </div>
  );
}

/**
 * Enhanced table with sticky headers, zebra striping, and hover effects
 */
export function EnhancedTable({ columns, rows, caption }) {
  return (
    <div className="enhanced-table-wrapper">
      {caption && <div className="enhanced-table__caption">{caption}</div>}
      <div className="enhanced-table__scroll">
        <table className="enhanced-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Progress indicator for showing completion status
 */
export function ProgressIndicator({ current, total, label }) {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 1;
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const percentage = Math.round(Math.max(0, Math.min((safeCurrent / safeTotal) * 100, 100)));

  return (
    <div className="progress-indicator" style={{ "--progress-indicator": `${percentage}%` }}>
      {label && <div className="progress-indicator__label">{label}</div>}
      <div className="progress-indicator__track">
        <div
          className="progress-indicator__fill"
          role="progressbar"
          aria-valuenow={Math.max(0, Math.min(safeCurrent, safeTotal))}
          aria-valuemin="0"
          aria-valuemax={safeTotal}
        >
          <span className="progress-indicator__shimmer" />
        </div>
      </div>
      <div className="progress-indicator__stats">
        <span>
          {current} / {total}
        </span>
        <span className="progress-indicator__percentage">{percentage}%</span>
      </div>
    </div>
  );
}

/**
 * Achievement badge for displaying milestones and accomplishments
 */
export function AchievementBadge({ icon, title, description, unlocked = true }) {
  return (
    <div className={`achievement-badge ${unlocked ? "is-unlocked" : "is-locked"}`}>
      <div className="achievement-badge__icon">{icon || "🏆"}</div>
      <div className="achievement-badge__content">
        <strong className="achievement-badge__title">{title}</strong>
        {description && <p className="achievement-badge__description">{description}</p>}
      </div>
      {!unlocked && <div className="achievement-badge__lock">🔒</div>}
    </div>
  );
}

/**
 * XP notification toast for celebrating achievements
 */
export function XPNotification({ xpGained, message, onClose }) {
  return (
    <div className="xp-notification animate-slide-in-right">
      <div className="xp-notification__content">
        <span className="xp-notification__icon">✨</span>
        <div className="xp-notification__text">
          <strong className="xp-notification__xp">+{xpGained} XP</strong>
          {message && <p className="xp-notification__message">{message}</p>}
        </div>
      </div>
      {onClose && (
        <button className="xp-notification__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}

/**
 * Streak indicator for showing consecutive completions
 */
export function StreakIndicator({ streak, label = "Day Streak" }) {
  const getStreakEmoji = (count) => {
    if (count >= 30) return "🔥🔥🔥";
    if (count >= 7) return "🔥🔥";
    return "🔥";
  };

  return (
    <div className="streak-indicator">
      <div className="streak-indicator__flame">{getStreakEmoji(streak)}</div>
      <div className="streak-indicator__content">
        <strong className="streak-indicator__count">{streak}</strong>
        <span className="streak-indicator__label">{label}</span>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for content placeholders
 */
export function SkeletonLoader({ type = "text", count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton skeleton--${type}`} />
  ));

  return <div className="skeleton-container">{skeletons}</div>;
}

