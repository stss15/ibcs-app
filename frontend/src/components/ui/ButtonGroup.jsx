import "./ButtonGroup.css";

/**
 * ButtonGroup component for grouping related action buttons
 * 
 * @param {React.ReactNode} children - Button elements
 * @param {string} layout - Layout direction: 'horizontal' | 'vertical' (default: 'horizontal')
 * @param {string} align - Alignment: 'start' | 'center' | 'end' | 'space-between' (default: 'start')
 * @param {string} className - Additional CSS classes
 */
export default function ButtonGroup({ children, layout = "horizontal", align = "start", className = "" }) {
  const classes = [`button-group`, `button-group--${layout}`, `button-group--align-${align}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="group">
      {children}
    </div>
  );
}

