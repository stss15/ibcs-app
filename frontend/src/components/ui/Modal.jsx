import { useEffect, useRef } from "react";
import "./Modal.css";

/**
 * Modal component with focus trap, keyboard handling, and ARIA attributes
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal should close
 * @param {string} title - Modal title (used for aria-labelledby)
 * @param {React.ReactNode} children - Modal content
 * @param {string} size - Modal size: 'sm' | 'md' | 'lg' | 'full' (default: 'md')
 * @param {boolean} closeOnBackdropClick - Whether to close on backdrop click (default: true)
 * @param {boolean} closeOnEscape - Whether to close on Escape key (default: true)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
}) {
  const modalRef = useRef(null);
  const titleRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // Focus trap: capture focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Store previously focused element
    previouslyFocusedElement.current = document.activeElement;

    // Focus modal title or first focusable element
    const firstFocusable = modalRef.current.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    } else if (titleRef.current) {
      titleRef.current.focus();
    }

    // Handle tab key to trap focus
    const handleTab = (e) => {
      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Handle Escape key
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleTab);
    document.addEventListener("keydown", handleEscape);

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleTab);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";

      // Restore focus to previously focused element
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const titleId = title ? `modal-title-${Math.random().toString(36).substr(2, 9)}` : undefined;

  return (
    <div className="modal-overlay" role="presentation">
      <button
        type="button"
        className="modal-overlay__backdrop"
        aria-label="Close modal"
        tabIndex={-1}
        onClick={
          closeOnBackdropClick
            ? () => {
                onClose?.();
              }
            : undefined
        }
        aria-hidden={closeOnBackdropClick ? undefined : "true"}
      />
      <div
        ref={modalRef}
        className={`modal-dialog modal-dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {title && (
          <header className="modal-header">
            <h2 id={titleId} ref={titleRef} className="modal-title">
              {title}
            </h2>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </header>
        )}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
