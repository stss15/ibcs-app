import SegmentNav from "./SegmentNav.jsx";
import "./Segments.css";

export default function DemoSegment({ segment, onBack, onComplete }) {
  const Demo = segment.demoComponent;

  return (
    <article className="gamified-card">
      <header>
        <h3>{segment.heading}</h3>
        {segment.description && <p>{segment.description}</p>}
      </header>
      <div className="gamified-card__body">{Demo ? <Demo /> : <p>Demo coming soon.</p>}</div>
      <SegmentNav onBack={onBack} onComplete={onComplete} />
    </article>
  );
}

