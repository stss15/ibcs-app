import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import { useCurriculumManifest, getTrackLabel } from "../hooks/useCurriculumManifest.js";
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
            unitAvailableFor: unit.availableFor ?? null,
          };
        }
      }
    }
    return null;
  }, [manifest, id]);

  const role = session?.user?.role ?? null;
  const isTeacher = role === "teacher";

  const userProgramme = useMemo(() => {
    if (isTeacher) return "ib-hl";
    const track = session?.user?.curriculumTrack;
    if (typeof track === "string" && track.toLowerCase().startsWith("ib")) {
      return track;
    }
    return "ib-sl";
  }, [session?.user?.curriculumTrack, isTeacher]);

  const trackLabel = useMemo(() => {
    const base = getTrackLabel(manifest, userProgramme);
    return isTeacher ? `${base} · Teacher view` : base;
  }, [manifest, userProgramme, isTeacher]);

  const chapterAccessible = useMemo(() => {
    if (!subtopic) return false;
    if (isTeacher) return true;
    const unitAccess = !subtopic.unitAvailableFor || subtopic.unitAvailableFor.includes(userProgramme);
    const subtopicAccess = !subtopic.availableFor || subtopic.availableFor.includes(userProgramme);
    return unitAccess && subtopicAccess;
  }, [subtopic, userProgramme, isTeacher]);

  const lessonsWithStatus = useMemo(() => {
    if (!subtopic) return [];
    const lessons = subtopic.lessons ?? [];

    return lessons.map((lesson, index) => {
      if (isTeacher) {
        return {
          ...lesson,
          status: "unlocked",
          teacherUnlocked: true,
        };
      }
      if (!chapterAccessible) {
        return {
          ...lesson,
          status: "hl-only",
          teacherUnlocked: false,
        };
      }

      if (lesson.hlOnly && userProgramme !== "ib-hl") {
        return {
          ...lesson,
          status: "hl-only",
          teacherUnlocked: false,
        };
      }

      return {
        ...lesson,
        status: index === 0 ? "unlocked" : "locked",
        teacherUnlocked: false,
      };
    });
  }, [subtopic, chapterAccessible, userProgramme, isTeacher]);

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
          <h1>
            {subtopic.id}: {subtopic.title}
          </h1>
          <p className="muted">
            Part of {subtopic.unitId}: {subtopic.unitTitle} · Viewing as {trackLabel}
          </p>
          {!isTeacher && !chapterAccessible && (
            <p className="topic-alert">This chapter is part of the Higher Level pathway. Ask your teacher to unlock it.</p>
          )}
        </header>

        <div className="topic-lessons">
          <h2>Lessons in this chapter</h2>
          <p className="muted topic-lessons__intro">
            First lesson is unlocked by default. Additional lessons and assessments will unlock as you progress.
          </p>
          <div className="lesson-grid">
            {lessonsWithStatus.map((lesson) => {
              const isUnlocked = lesson.status === "unlocked";
              const isLocked = lesson.status === "locked";
              const isHLOnly = lesson.status === "hl-only";
              const teacherUnlocked = !!lesson.teacherUnlocked;
              const isAccessible = teacherUnlocked || isUnlocked;

              const handleClick = (event) => {
                if (!isAccessible) {
                  event.preventDefault();
                  if (isHLOnly) {
                    alert("This lesson is only available to Higher Level students.");
                  } else {
                    alert("Complete the unlocked lesson first to continue the chapter.");
                  }
                }
              };

              return (
                <Link
                  key={lesson.id}
                  to={isAccessible ? `/lesson/${lesson.id}` : "#"}
                  className={`lesson-card ${(isUnlocked || teacherUnlocked) ? "unlocked" : ""} ${(!teacherUnlocked && (isLocked || isHLOnly)) ? "locked" : ""}`}
                  onClick={handleClick}
                  aria-disabled={!isAccessible}
                >
                  <div className="lesson-card__header">
                    <span className="lesson-card__number">{lesson.id.split(".").pop()}</span>
                    {teacherUnlocked && <span className="badge badge--teacher">Teacher view</span>}
                    {!teacherUnlocked && isHLOnly && <span className="badge badge--hl">HL only</span>}
                    {isUnlocked && <span className="badge badge--unlocked">Unlocked</span>}
                  </div>
                  <h3 className="lesson-card__title">{lesson.title}</h3>
                  {!isAccessible && (
                    <div className="lesson-card__lock" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path
                          fill="currentColor"
                          d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"
                        />
                      </svg>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

        </div>
      </section>
    </div>
  );
}

export default TopicPage;
