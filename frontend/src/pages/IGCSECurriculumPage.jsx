import { useMemo } from "react";
import { IGCSE_CURRICULUM } from "../../../shared/igcseCurriculum.js";
import "./IGCSECurriculumPage.css";

function LessonList({ lessons }) {
  return (
    <ol className="igcse-unit__list">
      {lessons.map((lesson) => (
        <li key={lesson.id} className="igcse-lesson">
          <span className="igcse-lesson__order">{lesson.order.toString().padStart(2, "0")}</span>
          <div className="igcse-lesson__meta">
            <strong>{lesson.title}</strong>
            <small className="muted">Content coming soon</small>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function IGCSECurriculumPage() {
  const units = useMemo(() => IGCSE_CURRICULUM, []);

  return (
    <div className="page-shell igcse-map">
      <section className="igcse-hero card">
        <div className="igcse-hero__text">
          <span className="igcse-hero__eyebrow">Cambridge IGCSE · Syllabus 0478 (20260)</span>
          <h1>IGCSE Computer Science roadmap</h1>
          <p className="muted">
            Two strands mirror the official syllabus: Computer Systems (topics 16) and Algorithms, Programming &amp;
            Logic (topics 710). Use this map to plan releases, teacher pacing, and future student unlocks.
          </p>
        </div>
        <div className="igcse-hero__status">
          <span className="status-pill status-pill--info">Beta map</span>
          <p className="muted">Lesson content placeholders are ready for authoring.</p>
        </div>
      </section>

      <div className="igcse-grid">
        {units.map((unit) => (
          <article key={unit.id} className="igcse-unit card" style={{ borderTopColor: unit.accent }}>
            <header className="igcse-unit__header">
              <div className="igcse-unit__icon" aria-hidden="true">
                {unit.icon}
              </div>
              <div className="igcse-unit__meta">
                <h2>{unit.title}</h2>
                <p className="muted">{unit.summary}</p>
              </div>
            </header>
            <LessonList lessons={unit.lessons} />
          </article>
        ))}
      </div>
    </div>
  );
}

