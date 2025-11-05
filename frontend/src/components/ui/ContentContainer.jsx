import { classNames } from "../../utils/classNames.js";
import styles from "./ContentContainer.module.css";

const VARIANT_MAP = {
  default: styles.default,
  compact: styles.compact,
  wide: styles.wide,
  fullWidth: styles.fullWidth,
};

function ContentContainer({ variant = "default", className, children, ...props }) {
  const variantClass = VARIANT_MAP[variant] ?? VARIANT_MAP.default;
  return (
    <div className={classNames(styles.container, variantClass, className)} {...props}>
      {children}
    </div>
  );
}

export default ContentContainer;

