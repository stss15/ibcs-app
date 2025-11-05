import { useEffect, useMemo, useRef, useState } from "react";
import Sk from "skulpt";
import AttemptBadge from "./AttemptBadge.jsx";
import SegmentNav from "./SegmentNav.jsx";
import FeedbackPanel from "../ui/FeedbackPanel.jsx";
import ButtonGroup from "../ui/ButtonGroup.jsx";
import "./PythonPlaygroundSegment.css";

function builtinRead(x) {
  const files = Sk.builtinFiles?.files ?? Sk.builtinFiles?.["files"];
  if (!files || !files[x]) {
    throw new Error(`File not found: ${x}`);
  }
  return files[x];
}

function parseFillSnippet(task) {
  const parts = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let lastIndex = 0;
  const text = task.snippet;
  text.replace(regex, (match, placeholder, index) => {
    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    parts.push({ type: "blank", id: placeholder.trim() });
    lastIndex = index + match.length;
    return match;
  });
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }
  return parts;
}

export default function PythonPlaygroundSegment({ segment, onBack, onComplete, onAttempt, attemptStats, isTeacher }) {
  const [code, setCode] = useState(() => segment.starterCode ?? "");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("idle");
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const outputRef = useRef(null);

  const [fillResponses, setFillResponses] = useState({});
  const [fillFeedback, setFillFeedback] = useState(null);
  const [fillResolved, setFillResolved] = useState(false);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    setCode(segment.starterCode ?? "");
    setOutput("");
    setStatus("idle");
    setRunning(false);
    setHasRun(false);
    setFillResponses({});
    setFillFeedback(null);
    setFillResolved(false);
  }, [segment.id, segment.starterCode]);

  const fillTasks = useMemo(() => segment.fillTasks ?? [], [segment.fillTasks]);
  const parsedTasks = useMemo(() => fillTasks.map((task) => ({ ...task, parts: parseFillSnippet(task) })), [fillTasks]);

  const handleRun = async () => {
    setRunning(true);
    setOutput("");
    setStatus("idle");
    try {
      Sk.configure({
        output: (text) => setOutput((prev) => prev + text),
        read: builtinRead,
        __future__: {
          print_function: true,
          division: true,
        },
        python3: true,
      });
      await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true));
      setStatus("success");
      setHasRun(true);
    } catch (error) {
      const message = error?.toString ? error.toString() : String(error);
      setOutput((prev) => prev + (prev.endsWith("\n") || prev.length === 0 ? "" : "\n") + message);
      setStatus("error");
    } finally {
      setRunning(false);
    }
  };

  const handleInsertExample = (exampleCode) => {
    const snippet = typeof exampleCode === "string" ? exampleCode : exampleCode?.code;
    if (!snippet) return;
    const needsPadding = code.length > 0 && !code.endsWith("\n");
    setCode((prev) => `${prev}${needsPadding ? "\n" : ""}${snippet}`);
  };

  const handleReset = () => {
    setCode(segment.starterCode ?? "");
    setOutput("");
    setStatus("idle");
    setRunning(false);
    setHasRun(false);
  };

  const handleFillCheck = () => {
    const missing = parsedTasks.some((task) =>
      task.parts
        .filter((part) => part.type === "blank")
        .some((blank) => !fillResponses[`${task.id}:${blank.id}`]),
    );
    if (missing) {
      setFillFeedback({ tone: "error", message: "Complete every blank in the snippets." });
      return;
    }
    let correctCount = 0;
    parsedTasks.forEach((task) => {
      task.parts
        .filter((part) => part.type === "blank")
        .forEach((blank) => {
          const key = `${task.id}:${blank.id}`;
          if (fillResponses[key] === task.answers?.[blank.id]) {
            correctCount += 1;
          }
        });
    });
    const totalBlanks = parsedTasks.reduce(
      (sum, task) => sum + task.parts.filter((part) => part.type === "blank").length,
      0,
    );
    const passed = correctCount === totalBlanks;
    setFillFeedback({
      tone: passed ? "success" : "error",
      message: passed ? "Snippets complete!" : "Check the highlights and retry.",
    });
    onAttempt(segment.id, {
      success: passed,
      correctCount,
      totalCount: totalBlanks,
      onAdvance: passed
        ? () => {
            setFillResolved(true);
            onComplete();
          }
        : null,
    });
    if (passed) {
      setFillResolved(true);
    }
  };

  return (
    <article className="gamified-card gamified-card--python">
      <header>
        <div>
          <h3>{segment.heading}</h3>
          {segment.prompt && <p>{segment.prompt}</p>}
        </div>
        <AttemptBadge attemptStats={attemptStats} />
      </header>
      <div className="python-playground">
        <div className="python-playground__editor">
          <label htmlFor={`${segment.id}-editor`} className="python-playground__label">
            Python editor
          </label>
          <textarea
            id={`${segment.id}-editor`}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            className="python-playground__textarea"
          />
          <div className="python-playground__actions">
            <ButtonGroup align="start">
              <button type="button" className="btn btn--ghost" onClick={handleReset} disabled={running}>
                Reset starter
              </button>
              <button type="button" className="btn btn--outline" onClick={handleRun} disabled={running}>
                {running ? "Running…" : "Run code"}
              </button>
            </ButtonGroup>
          </div>
          {segment.examples?.length > 0 && (
            <div className="python-playground__examples">
              <span>Run example:</span>
              {segment.examples.map((example) => (
                <button
                  type="button"
                  key={example.id}
                  className="pill pill--outline"
                  onClick={() => handleInsertExample(example.code)}
                >
                  {example.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={`python-playground__console python-playground__console--${status}`}>
          <header>
            <span>Console</span>
            {status === "success" && <span className="console-status is-success">Ran successfully</span>}
            {status === "error" && <span className="console-status is-error">Runtime error</span>}
          </header>
          <pre ref={outputRef}>{output || "Run the code to see output here."}</pre>
        </div>
      </div>

      {parsedTasks.length > 0 && (
        <div className="python-playground__fill">
          <h4>Snippet challenge</h4>
          {parsedTasks.map((task) => (
            <code key={task.id} className="python-playground__snippet">
              {task.parts.map((part, index) => {
                if (part.type === "text") {
                  return <span key={`text-${index}`}>{part.value}</span>;
                }
                const options = task.options?.[part.id] ?? [];
                const key = `${task.id}:${part.id}`;
                const selected = fillResponses[key] ?? "";
                const answer = task.answers?.[part.id];
                const isCorrect = fillResolved && selected === answer;
                const isIncorrect = fillResolved && selected && selected !== answer;
                return (
                  <span
                    key={key}
                    className={`python-playground__blank${isCorrect ? " is-correct" : ""}${isIncorrect ? " is-incorrect" : ""}`}
                  >
                    <select
                      value={selected}
                      disabled={fillResolved && !isTeacher}
                      onChange={(event) => {
                        setFillResponses((prev) => ({ ...prev, [key]: event.target.value }));
                        setFillFeedback(null);
                      }}
                    >
                      <option value="">?</option>
                      {options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </span>
                );
              })}
            </code>
          ))}
          <button type="button" className="btn btn--primary" onClick={handleFillCheck} disabled={fillResolved && !isTeacher}>
            Check snippets
          </button>
          {fillFeedback && (
            <FeedbackPanel tone={fillFeedback.tone === "error" ? "error" : "success"}>
              {fillFeedback.message}
            </FeedbackPanel>
          )}
        </div>
      )}

      <SegmentNav
        onBack={onBack}
        onComplete={() => {
          if (!fillTasks.length) {
            if (hasRun || isTeacher) {
              onComplete();
            } else {
              setFillFeedback({ tone: "error", message: "Run the code at least once before continuing." });
            }
          } else if (fillResolved || isTeacher) {
            onComplete();
          } else {
            setFillFeedback({ tone: "error", message: "Complete the snippet challenge before continuing." });
          }
        }}
        completeLabel={!fillTasks.length && !hasRun && !isTeacher ? "Run code to continue" : "Continue"}
      />
    </article>
  );
}

