import { classNames } from "../../utils/classNames.js";

const VARIANT_CLASS = {
  default: null,
  compact: "content-container--compact",
  wide: "content-container--wide",
  fullWidth: "content-container--full",
};

function ContentContainer({ variant = "default", className, children, ...props }) {
  const variantClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.default;
  return (
    <div className={classNames("content-container", variantClass, className)} {...props}>
      {children}
    </div>
  );
}

export default ContentContainer;

