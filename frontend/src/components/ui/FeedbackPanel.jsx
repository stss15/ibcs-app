import { useEffect, useRef } from "react";
import "./FeedbackPanel.css";

/**
 * FeedbackPanel component for displaying status messages
 * 
 * @param {string} tone - Feedback tone: 'success' | 'error' | 'warning' | 'info'
 * @param {React.ReactNode} children - Feedback message content
 * @param {boolean} animated - Whether to animate on mount (default: true)
 * @param {string} className - Additional CSS classes
 */
export default function FeedbackPanel({ tone = "info", children, animated = true, className = "" }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (animated && panelRef.current) {
      // Trigger animation on mount
      panelRef.current.classList.add("feedback-panel--animate");
      const timer = setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.classList.remove("feedback-panel--animate");
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  if (!children) return null;

  const classes = [`feedback-panel`, `feedback-panel--${tone}`, className].filter(Boolean).join(" ");

  return (
    <div ref={panelRef} className={classes} role="status" aria-live="polite">
      {children}
    </div>
  );
}

