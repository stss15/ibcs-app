import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import { useCurriculumManifest } from "../hooks/useCurriculumManifest.js";
import "./TopicPage.css";

function TopicPage() {
  const { id } = useParams();
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const { manifest, loading } = useCurriculumManifest();
  const [message, setMessage] = useState("Loading topic details…");

  const subtopic = useMemo(() => {
    if (!manifest || !id) return null;
    
    for (const unit of manifest.units) {
      for (const sub of unit.subtopics) {
        if (sub.id === id) {
          return {
            ...sub,
            unitId: unit.id,
            unitTitle: unit.title,
          };
        }
      }
    }
    return null;
  }, [manifest, id]);

  const userProgramme = session?.user?.curriculumTrack || "ib-sl";

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!session) {
      setMessage("Authenticate to view topic content.");
      navigate("/", { replace: true });
    } else if (!loading && !subtopic) {
      setMessage("Subtopic not found.");
    } else if (subtopic) {
      setMessage("");
    }
  }, [session, navigate, ready, loading, subtopic]);

  if (loading || !ready) {
    return (
      <section className="card topic-page">
        <p className="muted">Loading topic details…</p>
      </section>
    );
  }

  if (!subtopic) {
    return (
      <section className="card topic-page">
        <h2>Topic {id}</h2>
        <p className="muted">{message}</p>
        <Link to="/curriculum">← Back to Curriculum Map</Link>
      </section>
    );
  }

  return (
    <div className="topic-page">
      <nav className="topic-breadcrumb">
        <Link to="/curriculum">Curriculum</Link>
        <span>/</span>
        <span>{subtopic.unitId} {subtopic.unitTitle}</span>
        <span>/</span>
        <span>{subtopic.title}</span>
      </nav>

      <section className="topic-content">
        <header className="topic-header">
          <h1>{subtopic.id}: {subtopic.title}</h1>
          <p className="muted">Part of {subtopic.unitId}: {subtopic.unitTitle}</p>
        </header>

        <div className="topic-lessons">
          <h2>Lessons in this chapter</h2>
          <div className="lesson-grid">
            {subtopic.lessons?.map((lesson, index) => {
              const isHLOnly = lesson.hlOnly || false;
              const isAccessible = !isHLOnly || userProgramme === "ib-hl";
              const isFirstLesson = index === 0;

              return (
                <Link
                  key={lesson.id}
                  to={isAccessible ? `/lesson/${lesson.id}` : "#"}
                  className={`lesson-card ${!isAccessible ? "locked" : ""} ${isFirstLesson ? "unlocked" : ""}`}
                  onClick={(e) => {
                    if (!isAccessible) {
                      e.preventDefault();
                      alert("This lesson is only available to Higher Level students.");
                    }
                  }}
                >
                  <div className="lesson-card__header">
                    <span className="lesson-card__number">{lesson.id.split('.').pop()}</span>
                    {isHLOnly && <span className="badge badge--hl">HL</span>}
                    {isFirstLesson && <span className="badge badge--unlocked">Unlocked</span>}
                  </div>
                  <h3 className="lesson-card__title">{lesson.title}</h3>
                  {!isAccessible && (
                    <div className="lesson-card__lock">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                      </svg>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="topic-footer">
            <div className="topic-test">
              <h3>End of Chapter Test</h3>
              <p className="muted">Complete all lessons to unlock the chapter test</p>
              <button className="btn btn--primary" disabled>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
                </svg>
                Take Chapter Test
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TopicPage;
