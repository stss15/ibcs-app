import { classNames } from "../../utils/classNames.js";
import "./ProgressBar.css";

function clampPercent(value = 0, max = 100) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const ratio = Number.isFinite(value) ? value / safeMax : 0;
  const percent = ratio * 100;
  if (!Number.isFinite(percent)) return 0;
  return Math.max(0, Math.min(percent, 100));
}

function ProgressBar({
  value = 0,
  max = 100,
  tone = "brand",
  size = "md",
  showValue = false,
  label,
  className,
  children,
  ariaLabel,
  ...rest
}) {
  const percent = clampPercent(value, max);
  const rounded = Math.round(percent);
  const rootClass = classNames(
    "progress-bar",
    tone && `progress-bar--${tone}`,
    size && `progress-bar--${size}`,
    className,
  );

  return (
    <div className={rootClass} style={{ "--progress-percent": `${percent}%` }} {...rest}>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-label={ariaLabel}
        >
          {showValue ? <span className="progress-bar__value">{rounded}%</span> : null}
        </div>
      </div>
      {(label || children) && <div className="progress-bar__footer">{label || children}</div>}
    </div>
  );
}

export default ProgressBar;


