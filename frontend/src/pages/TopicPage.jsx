import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import "./TopicPage.css";

function TopicPage() {
  const { id } = useParams();
  const { session } = useSession();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Loading topic details…");

  useEffect(() => {
    if (!session) {
      setMessage("Authenticate to view topic content.");
      navigate("/", { replace: true });
    } else {
      setMessage("Topic content coming soon. Stay tuned!");
    }
  }, [session, navigate]);

  return (
    <section className="card topic-page">
      <h2>Topic {id}</h2>
      <p className="muted">
        {message} Once the syllabus content migrates into InstantDB, readings and formative items will
        be unlocked here automatically.
      </p>
    </section>
  );
}

export default TopicPage;
