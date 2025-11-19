import './FeedbackPanel.css';

export default function FeedbackPanel({ tone = 'info', children }) {
  if (!children) return null;
  return (
    <div className={`feedback-panel feedback-panel--${tone}`} role="status" aria-live="polite">
      {children}
    </div>
  );
}
