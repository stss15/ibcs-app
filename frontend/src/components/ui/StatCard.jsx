import { classNames } from "../../utils/classNames.js";
import "./StatCard.css";

function clampProgress(progress) {
  if (typeof progress !== "number" || Number.isNaN(progress)) {
    return null;
  }
  return Math.max(0, Math.min(progress, 1));
}

function resolveNode(content, fallbackClassName) {
  if (!content) return null;
  if (typeof content === "string") {
    return <span className={fallbackClassName}>{content}</span>;
  }
  return content;
}

function StatCard({
  label,
  value,
  description,
  badge,
  icon,
  meta,
  actions,
  progress,
  progressLabel,
  tone = "default",
  compact = false,
  className,
  children,
}) {
  const clampedProgress = clampProgress(progress);
  const progressPercentage = clampedProgress === null ? null : Math.round(clampedProgress * 100);

  const badgeNode = resolveNode(badge, "stat-card__badge");
  const metaNode = resolveNode(meta, "stat-card__meta-text");

  return (
    <article
      className={classNames(
        "stat-card",
        tone && `stat-card--${tone}`,
        compact && "stat-card--compact",
        className,
      )}
    >
      {(badgeNode || label || actions) && (
        <div className="stat-card__top">
          <div className="stat-card__title">
            {badgeNode}
            {label && <span className="stat-card__label">{label}</span>}
          </div>
          {actions ? <div className="stat-card__actions">{actions}</div> : null}
        </div>
      )}

      {(value || description || icon || children) && (
        <div className="stat-card__content">
          {icon ? (
            <span className="stat-card__icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <div className="stat-card__metrics">
            {value ? <span className="stat-card__value">{value}</span> : null}
            {description ? <p className="stat-card__description">{description}</p> : null}
            {children}
          </div>
        </div>
      )}

      {metaNode ? <div className="stat-card__meta">{metaNode}</div> : null}

      {progressPercentage !== null ? (
        <div className="stat-card__progress" style={{ "--stat-card-progress": `${progressPercentage}%` }}>
          <div
            className="stat-card__progress-bar"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      ) : null}

      {progressLabel ? <div className="stat-card__progress-label">{progressLabel}</div> : null}
    </article>
  );
}

export default StatCard;


