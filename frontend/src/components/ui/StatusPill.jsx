import classNames from "../../utils/classNames.js";

import "./StatusPill.css";

const TONES = new Set(["info", "success", "warning", "danger", "neutral", "muted"]);
const VARIANTS = new Set(["soft", "solid", "outline"]);
const SIZES = new Set(["sm", "md", "lg"]);

export default function StatusPill({
  tone = "info",
  variant = "soft",
  size = "sm",
  icon,
  className,
  children,
  as: Component = "span",
  ...props
}) {
  const normalizedTone = TONES.has(tone) ? tone : "info";
  const normalizedVariant = VARIANTS.has(variant) ? variant : "soft";
  const normalizedSize = SIZES.has(size) ? size : "sm";

  return (
    <Component
      className={classNames(
        "status-pill",
        `status-pill--${normalizedTone}`,
        `status-pill--variant-${normalizedVariant}`,
        `status-pill--size-${normalizedSize}`,
        icon ? "status-pill--with-icon" : null,
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="status-pill__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="status-pill__label">{children}</span>
    </Component>
  );
}


