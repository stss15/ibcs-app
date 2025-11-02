import { Link } from "react-router-dom";
import "./CurriculumMapPage.css";

const tracks = {
  ks3: [
    { label: "Year 7", state: "locked" },
    { label: "Year 8", state: "locked" },
    { label: "Year 9", state: "locked" },
  ],
  igcse: [{ label: "IGCSE Computer Science", state: "locked" }],
};

function CurriculumMapPage() {
  return (
    <div className="page-shell curriculum-page">
      <section className="page-hero">
        <div className="page-hero__content">
          <span className="page-hero__eyebrow">Curriculum pathway</span>
          <h1 className="page-hero__title">Computer Science journey</h1>
          <p className="muted">
            A single place to preview the strands we are sequencing from Key Stage 3 through IB Computer Science.
            Track what is live today and what is in production for the next cohort.
          </p>
        </div>
        <div className="page-hero__actions">
          <Link to="/curriculum/ib" className="pill pill--action">
            Explore IB curriculum map
          </Link>
        </div>
      </section>

      <div className="curriculum-panels page-panels">
        <article className="curriculum-panel">
          <header className="curriculum-panel__header">
            <div>
              <h2>Key Stage 3</h2>
              <p className="muted">Module prototypes, robotics, and systems thinking foundations.</p>
            </div>
            <span className="status-pill status-pill--muted">In development</span>
          </header>
          <div className="curriculum-panel__body">
            <p>
              Our middle years experience is being rebuilt to align with the IB philosophy earlier in the student
              journey. You will see phased releases during the academic year.
            </p>
            <div className="curriculum-buttons">
              {tracks.ks3.map((item) => (
                <button key={item.label} type="button" disabled className="pill pill--locked">
                  {item.label}
                  <small>Preview coming soon</small>
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="curriculum-panel">
          <header className="curriculum-panel__header">
            <div>
              <h2>IGCSE Computer Science</h2>
              <p className="muted">Content sequencing to bridge from Key Stage 4 to DP readiness.</p>
            </div>
            <span className="status-pill status-pill--muted">Under construction</span>
          </header>
          <div className="curriculum-panel__body">
            <p>
              Assessment objectives, mark schemes, and lesson flows are in QA. Expect a beta release with core topics
              later this term.
            </p>
            <div className="curriculum-buttons">
              {tracks.igcse.map((item) => (
                <button key={item.label} type="button" disabled className="pill pill--locked">
                  {item.label}
                  <small>Launch soon</small>
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="curriculum-panel curriculum-panel--highlight">
          <header className="curriculum-panel__header">
            <div>
              <h2>IB Computer Science</h2>
              <p className="muted">Full Standard and Higher Level strands with lesson unlock logic.</p>
            </div>
            <span className="status-pill status-pill--info">Live</span>
          </header>
          <div className="curriculum-panel__body">
            <p>
              Dive into the RevisionDojo-inspired experience with structured units, chapter dashboards, and lesson
              unlocks ready for classroom delivery.
            </p>
            <div className="curriculum-buttons">
              <Link to="/curriculum/ib" className="pill pill--action">
                Open IB curriculum map
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default CurriculumMapPage;
