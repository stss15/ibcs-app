import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import { request, withAuthHeaders } from "../lib/api.js";
import "./TopicPage.css";

function TopicPage() {
  const { id } = useParams();
  const { token } = useSession();
  const [topic, setTopic] = useState(null);
  const [status, setStatus] = useState({ tone: "info", message: "Loading topic details…" });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await request("/t/dashboard", {
          headers: withAuthHeaders(token),
        });
        if (!active) return;
        const match = data.unlocks?.find((entry) => entry.topicId === id || entry.topic?.id === id);
        setTopic(match || null);
        setStatus({
          tone: match ? "success" : "error",
          message: match ? "Topic unlocked." : "Topic not yet unlocked.",
        });
      } catch (error) {
        if (!active) return;
        setStatus({ tone: "error", message: error.message });
      }
    }

    if (token) {
      load();
    } else {
      setStatus({ tone: "error", message: "Authenticate to view topic content." });
    }

    return () => {
      active = false;
    };
  }, [id, token]);

  return (
    <section className="card topic-page">
      <h2>Topic {id}</h2>
      <p className={`status status--${status.tone}`}>{status.message}</p>
      {topic ? (
        <article className="topic-panel">
          <h3>{topic.topic?.title ?? id}</h3>
          <p>Unlocked at: {topic.unlockedAt ?? "recently"}</p>
          <p>Class: {topic.classId ?? "n/a"}</p>
        </article>
      ) : (
        <p className="muted">
          Once your teacher unlocks this topic, formative items, readings, and summative tasks will
          appear here.
        </p>
      )}
    </section>
  );
}

export default TopicPage;
