import { useEffect, useState } from "react";
import SegmentNav from "./SegmentNav.jsx";
import "./Segments.css";

export default function ReflectionSegment({
  segment,
  onBack,
  onComplete,
  onSave,
  isTeacher,
  initialValue = "",
}) {
  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [segment.id, initialValue]);

  const handleSave = () => {
    if (onSave) {
      onSave(segment.id, value);
    }
    onComplete();
  };

  return (
    <article className="gamified-card">
      <header>
        <h3>{segment.heading}</h3>
        {segment.prompt && <p>{segment.prompt}</p>}
      </header>
      <textarea
        rows={6}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Capture your reflections here…"
      />
      <SegmentNav
        onBack={onBack}
        onComplete={handleSave}
        completeLabel={isTeacher ? "Mark complete" : "Save reflection"}
      />
    </article>
  );
}

