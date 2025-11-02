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
    <div className="curriculum-grid">
      <section className="curriculum-card">
        <h1>Curriculum map</h1>
        <p className="muted">
          We are sequencing the full learning journey from Key Stage 3 through IB Computer Science. Use
          this page to see which strands are available and what is coming next.
        </p>
      </section>

      <section className="curriculum-card">
        <header>
          <h2>Key Stage 3</h2>
          <span className="badge badge--muted">Building</span>
        </header>
        <div className="curriculum-buttons">
          {tracks.ks3.map((item) => (
            <button key={item.label} type="button" disabled className="pill pill--locked">
              {item.label}
              <small>Coming soon</small>
            </button>
          ))}
        </div>
      </section>

      <section className="curriculum-card">
        <header>
          <h2>IGCSE Computer Science</h2>
          <span className="badge badge--muted">Coming soon</span>
        </header>
        <div className="curriculum-buttons">
          {tracks.igcse.map((item) => (
            <button key={item.label} type="button" disabled className="pill pill--locked">
              {item.label}
              <small>Under construction</small>
            </button>
          ))}
        </div>
      </section>

      <section className="curriculum-card curriculum-card--highlight">
        <header>
          <h2>IB Computer Science</h2>
          <span className="badge">Available</span>
        </header>
        <p>
          The full Higher Level & Standard Level map is ready to explore. Track strands A–B, formative
          checkpoints, and links into InstantDB content as it lands.
        </p>
        <div className="curriculum-buttons">
          <Link to="/curriculum/ib" className="pill pill--action">
            Open IB curriculum map
          </Link>
        </div>
      </section>
    </div>
  );
}

export default CurriculumMapPage;

