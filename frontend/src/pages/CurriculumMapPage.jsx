import { Link } from "react-router-dom";
import ContentContainer from "../components/ui/ContentContainer.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";

import "./CurriculumMapPage.css";

const tracks = {
  ks3: [
    { label: "Year 7", state: "live", href: "/curriculum/year7" },
    { label: "Year 8", state: "preview" },
    { label: "Year 9", state: "preview" },
  ],
  igcse: [{ label: "IGCSE Computer Science", state: "live", href: "/curriculum/igcse" }],
};

function CurriculumMapPage() {
  return (
    <ContentContainer variant="fullWidth" className="curriculum-page">
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
              <p className="muted">Start with the Year 7 Computing Adventure. Years 8 &amp; 9 unlock as the sequence ships.</p>
            </div>
            <StatusPill tone="info" size="sm">
              Rolling release
            </StatusPill>
          </header>
          <div className="curriculum-panel__body">
            <p>
              Our middle years pathway is being rebuilt to mirror the IB learning experience. Year 7 is ready to run
              today with live pacing pointers. Subsequent years follow later in the academic year.
            </p>
            <div className="curriculum-buttons">
              {tracks.ks3.map((item) => (
                item.state === "live" && item.href ? (
                  <Link key={item.label} to={item.href} className="pill pill--live">
                    {item.label}
                    <small>Available now</small>
                  </Link>
                ) : (
                  <button key={item.label} type="button" disabled className="pill pill--locked">
                    {item.label}
                    <small>Preview coming soon</small>
                  </button>
                )
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
            <StatusPill tone="info" size="sm">
              Beta map
            </StatusPill>
          </header>
          <div className="curriculum-panel__body">
            <p>
              Topics 1 10 are now scaffolded into two streams so you can plan assessment pacing, live unlocks, and content authoring.
            </p>
            <div className="curriculum-buttons">
              {tracks.igcse.map((item) => (
                item.state === "live" && item.href ? (
                  <Link key={item.label} to={item.href} className="pill pill--action">
                    {item.label}
                    <small>Open roadmap</small>
                  </Link>
                ) : (
                  <button key={item.label} type="button" disabled className="pill pill--locked">
                    {item.label}
                    <small>Launch soon</small>
                  </button>
                )
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
            <StatusPill tone="success" size="sm">
              Live
            </StatusPill>
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
    </ContentContainer>
  );
}

export default CurriculumMapPage;
