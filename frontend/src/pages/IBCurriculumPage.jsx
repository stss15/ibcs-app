import { Link } from "react-router-dom";
import TopicGrid from "../components/TopicGrid.jsx";
import "./IBCurriculumPage.css";

const IB_UNITS = [
  {
    title: "A1 · System fundamentals",
    summary: "Planning, evaluating, and installing new systems.",
    topics: ["A1.1", "A1.2", "A1.3", "A1.4"],
  },
  {
    title: "A2 · Computer organisation",
    summary: "Hardware, machine instructions, and the CPU architecture.",
    topics: ["A2.1", "A2.2", "A2.3", "A2.4"],
  },
  {
    title: "A3 · Networks",
    summary: "Communication networks, topologies, and data transmission.",
    topics: ["A3.1", "A3.2", "A3.3", "A3.4"],
  },
  {
    title: "A4 · Computational thinking",
    summary: "Abstraction, algorithms, and problem-solving patterns.",
    topics: ["A4.1", "A4.2", "A4.3", "A4.4"],
  },
  {
    title: "B1 · Resource management",
    summary: "Measuring and optimising resources across systems.",
    topics: ["B1.1"],
  },
  {
    title: "B2 · Resource management HL extensions",
    summary: "Higher level deep dive into virtualisation and distributed systems.",
    topics: ["B2.1", "B2.2", "B2.3", "B2.4", "B2.5"],
  },
  {
    title: "B3 · Control",
    summary: "Embedded systems and control theory for HL candidates.",
    topics: ["B3.1", "B3.2"],
  },
  {
    title: "B4 · Web science",
    summary: "Exploring modern web architecture within the HL option.",
    topics: ["B4.1"],
  },
];

function IBCurriculumPage() {
  return (
    <div className="ib-grid">
      <section className="ib-card">
        <div>
          <h1>IB Computer Science map</h1>
          <p className="muted">
            Core topic A (Systems) is paired with higher-level extensions from topic B. Each badge links
            to the detailed topic entry so you can attach resources, readings, or InstantDB data when it
            becomes available.
          </p>
        </div>
        <Link to="/curriculum" className="button-outline">
          ⟵ Back to curriculum overview
        </Link>
      </section>

      {IB_UNITS.map((unit) => (
        <section className="ib-card" key={unit.title}>
          <header className="ib-card__header">
            <div>
              <h2>{unit.title}</h2>
              <p className="muted">{unit.summary}</p>
            </div>
            <span className="badge">Unlocked</span>
          </header>
          <TopicGrid
            topics={unit.topics.map((code) => ({
              code,
              status: "unlocked",
            }))}
          />
        </section>
      ))}
    </div>
  );
}

export default IBCurriculumPage;

