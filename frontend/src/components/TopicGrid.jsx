import { Link } from "react-router-dom";
import "./TopicGrid.css";

function TopicGrid({ topics }) {
  return (
    <div className="topic-grid">
      {topics.map((topic) => (
        <Link
          key={topic.code}
          className={`topic-card topic-card--${topic.status}`}
          to={`/topic/${encodeURIComponent(topic.code)}`}
        >
          <strong>{topic.code}</strong>
          <span>{topic.status === "unlocked" ? "Unlocked" : "Locked"}</span>
        </Link>
      ))}
    </div>
  );
}

export default TopicGrid;
