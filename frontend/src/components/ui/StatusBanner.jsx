import classNames from "../../utils/classNames.js";

import "./StatusBanner.css";

const TONES = new Set(["info", "success", "warning", "danger", "neutral"]);

export default function StatusBanner({
  tone = "info",
  title,
  icon,
  children,
  actions,
  onDismiss,
  className,
  as: Component = "div",
  ...props
}) {
  const normalizedTone = TONES.has(tone) ? tone : "info";

  return (
    <Component
      className={classNames("status-banner", `status-banner--${normalizedTone}`, className)}
      role="status"
      {...props}
    >
      {icon ? (
        <span className="status-banner__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="status-banner__content">
        {title ? <strong>{title}</strong> : null}
        {children ? <div className="status-banner__body">{children}</div> : null}
      </div>
      {actions ? <div className="status-banner__actions">{actions}</div> : null}
      {onDismiss ? (
        <button type="button" className="status-banner__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      ) : null}
    </Component>
  );
}


