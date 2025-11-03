import { Fragment, useEffect, useMemo, useState } from "react";
import AttemptBadge from "../AttemptBadge.jsx";
import "./Activities.css";

const PLACEHOLDER_REGEX = /\[\[([^[\]]+)\]\]/g;

export default function CodeCompletionActivity({
  segment,
  onBack,
  onComplete,
  onAttempt,
  attemptStats,
  isTeacher,
}) {
  const [responses, setResponses] = useState({});
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const placeholders = useMemo(() => segment.placeholders ?? [], [segment.placeholders]);
  const placeholderMap = useMemo(() => {
    return placeholders.reduce((acc, placeholder) => {
      acc[placeholder.id] = placeholder;
      return acc;
    }, {});
  }, [placeholders]);

  const parts = useMemo(() => {
    const code = segment.code ?? "";
    const chunks = [];
    let lastIndex = 0;
    code.replace(PLACEHOLDER_REGEX, (match, placeholderId, index) => {
      if (index > lastIndex) {
        chunks.push({ type: "code", value: code.slice(lastIndex, index) });
      }
      chunks.push({ type: "blank", id: placeholderId });
      lastIndex = index + match.length;
      return match;
    });
    if (lastIndex < code.length) {
      chunks.push({ type: "code", value: code.slice(lastIndex) });
    }
    return chunks;
  }, [segment.code]);

  useEffect(() => {
    setResponses({});
    setResolved(false);
    setFeedback(null);
  }, [segment.id, segment.code]);

  const allowInteraction = !resolved || isTeacher;

  const evaluateResponse = (value, placeholder) => {
    if (!placeholder) return false;
    const trimmedValue = placeholder.trimInput === false ? value : value.trim();
    if (placeholder.caseSensitive === false) {
      return trimmedValue.toLowerCase() === placeholder.answer.toLowerCase();
    }
    return trimmedValue === placeholder.answer;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (resolved) return;
    const total = placeholders.length;
    const missing = placeholders.some((placeholder) => {
      const value = responses[placeholder.id];
      return value === undefined || value === null || value === "";
    });
    if (missing) {
      setFeedback({ tone: "error", message: "Fill every placeholder before checking." });
      return;
    }
    let correctCount = 0;
    placeholders.forEach((placeholder) => {
      if (evaluateResponse(responses[placeholder.id], placeholder)) {
        correctCount += 1;
      }
    });
    const passed = correctCount === total;
    setFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Code compiled! Every placeholder is correct." : "Review the highlighted slots and retry.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount,
      totalCount: total,
      onAdvance: passed
        ? () => {
            setResolved(true);
            onComplete();
          }
        : null,
    });
    if (passed) {
      setResolved(true);
    }
  };

  return (
    <article className="gamified-card">
      <header>
        <h3>{segment.heading}</h3>
        <AttemptBadge attemptStats={attemptStats} />
        {segment.instructions && <p>{segment.instructions}</p>}
      </header>

      <form className="activity-code" onSubmit={handleSubmit}>
        {segment.prompt && <p className="activity-code__prompt">{segment.prompt}</p>}
        <pre className="activity-code__block">
          <code>
            {parts.map((part, index) => {
              if (part.type === "code") {
                return <Fragment key={`code-${index}`}>{part.value}</Fragment>;
              }
              const placeholder = placeholderMap[part.id];
              if (!placeholder) return null;
              const value = responses[placeholder.id] ?? "";
              const isCorrect = resolved && evaluateResponse(value, placeholder);
              const isIncorrect = resolved && !evaluateResponse(value, placeholder);
              return (
                <span
                  key={placeholder.id}
                  className={`activity-code__blank${isCorrect ? " is-correct" : ""}${isIncorrect ? " is-incorrect" : ""}`}
                >
                  <input
                    type="text"
                    value={value}
                    disabled={!allowInteraction}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setResponses((prev) => ({ ...prev, [placeholder.id]: nextValue }));
                      setFeedback(null);
                    }}
                    placeholder={placeholder.placeholder ?? "…"}
                    aria-label={placeholder.label ?? `Fill placeholder ${placeholder.id}`}
                  />
                </span>
              );
            })}
          </code>
        </pre>
        {placeholders.some((placeholder) => placeholder.hint) && (
          <ul className="activity-code__hints">
            {placeholders.map(
              (placeholder) =>
                placeholder.hint && (
                  <li key={`${placeholder.id}-hint`}>
                    <strong>{placeholder.label ?? placeholder.id}:</strong> {placeholder.hint}
                  </li>
                ),
            )}
          </ul>
        )}

        <div className="gamified-segment-nav">
          {onBack ? (
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="gamified-segment-actions">
            <button type="submit" className="btn btn--primary" disabled={resolved && !isTeacher}>
              Check code
            </button>
          </div>
        </div>
        {feedback && (
          <p className={`gamified-feedback ${feedback.tone === "error" ? "is-error" : "is-success"}`}>{feedback.message}</p>
        )}
      </form>
    </article>
  );
}
