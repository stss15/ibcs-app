import { classNames } from "../../utils/classNames.js";
import styles from "./ResponsiveGrid.module.css";

function normalizeUnit(value) {
  if (value == null) return undefined;
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
}

function ResponsiveGrid({
  columns,
  minColumnWidth = 280,
  variant = "grid",
  className,
  children,
  style,
  ...props
}) {
  const resolvedStyle = { ...style };

  if (variant !== "masonry" && columns) {
    const base = columns.base ?? columns.xs ?? columns.sm ?? columns.md ?? columns.lg ?? 1;
    resolvedStyle["--columns-base"] = base;
    if (columns.sm != null) resolvedStyle["--columns-sm"] = columns.sm;
    if (columns.md != null) resolvedStyle["--columns-md"] = columns.md;
    if (columns.lg != null) resolvedStyle["--columns-lg"] = columns.lg;
    if (columns.xl != null) resolvedStyle["--columns-xl"] = columns.xl;
  }

  if (variant === "autoFit") {
    resolvedStyle["--min-column-width"] = normalizeUnit(minColumnWidth);
  }

  const classNamesList = classNames(
    variant === "masonry" ? styles.masonry : styles.grid,
    variant === "autoFit" && styles.autoFit,
    className,
  );

  return (
    <div className={classNamesList} style={resolvedStyle} {...props}>
      {children}
    </div>
  );
}

export default ResponsiveGrid;

