import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import { useCurriculumManifest, getTrackLabel } from "../hooks/useCurriculumManifest.js";
import ContentContainer from "../components/ui/ContentContainer.jsx";
import "./LessonPage.css";

const MODULE_LINKS = {
  B1: { to: "/curriculum/ib/b1", label: "Open B1 interactive pathway" },
  B2: { to: "/curriculum/ib/b2", label: "Open B2 interactive pathway" },
};

function LessonPage() {
  const { lessonId } = useParams();
  const { session } = useSession();
  const { manifest, status, error } = useCurriculumManifest();

  const role = session?.user?.role ?? null;
  const isStaff = role === "teacher" || role === "admin";

  const lessonMeta = useMemo(() => {
    if (!manifest || !lessonId) return null;
    for (const unit of manifest.units ?? []) {
      for (const subtopic of unit.subtopics ?? []) {
        const lessons = subtopic.lessons ?? [];
        const index = lessons.findIndex((item) => item.id === lessonId);
        if (index !== -1) {
          return {
            unit,
            subtopic,
            lessons,
            lesson: lessons[index],
            lessonIndex: index,
          };
        }
      }
    }
    return null;
  }, [manifest, lessonId]);

  const userProgramme = useMemo(() => {
    if (isStaff) {
      return "ib-hl";
    }
    const track = session?.user?.curriculumTrack;
    if (typeof track === "string" && track.toLowerCase().startsWith("ib")) {
      return track.toLowerCase();
    }
    return "ib-sl";
  }, [session?.user?.curriculumTrack, isStaff]);

  const trackLabel = useMemo(() => {
    if (!manifest) return null;
    return getTrackLabel(manifest, userProgramme);
  }, [manifest, userProgramme]);

  const unitAvailable =
    lessonMeta && lessonMeta.unit
      ? !Array.isArray(lessonMeta.unit.availableFor) || lessonMeta.unit.availableFor.includes(userProgramme)
      : false;
  const subtopicAvailable =
    lessonMeta && lessonMeta.subtopic
      ? !Array.isArray(lessonMeta.subtopic.availableFor) || lessonMeta.subtopic.availableFor.includes(userProgramme)
      : false;
  const isHlOnly = Boolean(lessonMeta?.lesson?.hlOnly);
  const unlockedBySequence = lessonMeta ? lessonMeta.lessonIndex === 0 : false;
  const accessibleForLearner =
    Boolean(lessonMeta) &&
    unitAvailable &&
    subtopicAvailable &&
    (!isHlOnly || userProgramme === "ib-hl") &&
    unlockedBySequence;
  const canViewLesson = isStaff || accessibleForLearner;

  const lessonsWithStatus = useMemo(() => {
    if (!lessonMeta) return [];
    return lessonMeta.lessons.map((item, index) => {
      const hlOnly = Boolean(item.hlOnly);
      const unlocked = index === 0;
      const accessible =
        isStaff ||
        ((!hlOnly || userProgramme === "ib-hl") && unitAvailable && subtopicAvailable && unlocked);
      return {
        ...item,
        index,
        isCurrent: item.id === lessonMeta.lesson.id,
        hlOnly,
        accessible,
      };
    });
  }, [lessonMeta, isStaff, unitAvailable, subtopicAvailable, userProgramme]);

  if (status === "loading") {
    return (
      <ContentContainer variant="fullWidth" className="lesson-page">
        <section className="lesson-content">
          <p className="muted">Loading lesson details…</p>
        </section>
      </ContentContainer>
    );
  }

  if (error) {
    return (
      <ContentContainer variant="fullWidth" className="lesson-page">
        <section className="lesson-content">
          <h2>Unable to load lesson</h2>
          <p className="muted">{error.message ?? "Please try again later."}</p>
          <Link to="/curriculum/ib" className="pill pill--action">
            Back to IB curriculum
          </Link>
        </section>
      </ContentContainer>
    );
  }

  if (!lessonMeta) {
    return (
      <ContentContainer variant="fullWidth" className="lesson-page">
        <section className="lesson-content">
          <h2>Lesson not found</h2>
          <p className="muted">
            We could not locate lesson {lessonId}. Choose another chapter from the curriculum map.
          </p>
          <Link to="/curriculum/ib" className="pill pill--action">
            Back to IB curriculum
          </Link>
        </section>
      </ContentContainer>
    );
  }

  const { unit, subtopic, lesson } = lessonMeta;
  const moduleLink = MODULE_LINKS[unit.id] ?? null;

  let availabilityMessage = "";
  if (isStaff) {
    availabilityMessage = "Staff view shows the full sequence regardless of unlock status.";
  } else if (!unitAvailable || !subtopicAvailable) {
    availabilityMessage = "This chapter is locked for your programme. Ask your teacher to unlock it.";
  } else if (isHlOnly && userProgramme !== "ib-hl") {
    availabilityMessage = "This lesson is part of the Higher Level pathway.";
  } else if (!unlockedBySequence) {
    availabilityMessage = "Complete the first lesson in this chapter to unlock the remaining sequence.";
  } else {
    availabilityMessage = "Interactive lesson content is currently being migrated into the new gamified modules.";
  }

  return (
    <ContentContainer variant="fullWidth" className="lesson-page">
      <nav className="lesson-breadcrumb" aria-label="Breadcrumb">
        <Link to="/curriculum/ib">IB curriculum</Link>
        <span>/</span>
        <Link to={`/topic/${encodeURIComponent(subtopic.id)}`}>{subtopic.id}</Link>
        <span>/</span>
        <span>{lesson.id}</span>
      </nav>

      <div className="lesson-container">
        <aside className="lesson-sidebar">
          <div className="lesson-sidebar__header">
            <h3>
              {lesson.id} · {lesson.title}
            </h3>
            <p className="muted">
              {unit.id}: {unit.title}
            </p>
            <p className="muted">
              Viewing as {isStaff ? "staff" : trackLabel ?? userProgramme.toUpperCase()}.
            </p>
            {!canViewLesson && <span className="lesson-sidebar__alert">Locked for this track</span>}
            {isHlOnly && !isStaff && <span className="lesson-sidebar__alert">Higher Level only</span>}
          </div>

          <div className="lesson-nav" role="navigation" aria-label="Lesson sequence">
            {lessonsWithStatus.map((item) => {
              const classes = ["lesson-nav__item"];
              if (item.isCurrent) classes.push("active");
              if (!item.accessible) classes.push("locked");
              return (
                <Link
                  key={item.id}
                  to={`/lesson/${encodeURIComponent(item.id)}`}
                  className={classes.join(" ")}
                >
                  <span className="lesson-nav__number">{item.id.split(".").pop()}</span>
                  <span className="lesson-nav__title">{item.title}</span>
                  {item.hlOnly && <span className="badge badge--hl">HL</span>}
                </Link>
              );
            })}
          </div>

          <div className="lesson-sidebar__footer">
            <p className="small muted">{availabilityMessage}</p>
          </div>
        </aside>

        <section className="lesson-content">
          <header className="lesson-header">
            <h1>{lesson.title}</h1>
            <div className="lesson-header__meta">
              <span className="badge badge--primary">
                {unit.id} · {subtopic.id}
              </span>
              {isStaff && <span className="badge badge--teacher">Staff view</span>}
              {!isStaff && <span className="badge badge--muted">{trackLabel ?? userProgramme.toUpperCase()}</span>}
              {isHlOnly && <span className="badge badge--hl">Higher Level</span>}
            </div>
          </header>

          <div className="lesson-sections">
            <article className="lesson-section">
              <h2 className="lesson-section__title">Digital lesson coming soon</h2>
              <div className="lesson-section__content">
                <p>
                  We are migrating lesson {lesson.id} into the new gamified learning experience.{" "}
                  {canViewLesson
                    ? "Until the migration completes, use the unit overview or interactive module links below to cover this content."
                    : "Ask your teacher to unlock the chapter when you are ready to continue."}
                </p>
                {moduleLink && (
                  <p>
                    <Link to={moduleLink.to} className="pill pill--action">
                      {moduleLink.label}
                    </Link>
                  </p>
                )}
              </div>
            </article>

            <article className="lesson-section">
              <h2 className="lesson-section__title">What you can do now</h2>
              <div className="lesson-section__content">
                <ul>
                  <li>Review the chapter outline to keep track of the learning sequence.</li>
                  <li>Use the interactive module previews for B1 and B2 while we migrate lessons.</li>
                  <li>Teachers can unlock additional lessons to stage student access.</li>
                </ul>
              </div>
            </article>
          </div>

          <div className="lesson-actions">
            <Link to={`/topic/${encodeURIComponent(subtopic.id)}`} className="btn btn--secondary">
              ← Back to chapter
            </Link>
            <Link to="/curriculum/ib" className="btn btn--primary">
              Explore curriculum map
            </Link>
          </div>
        </section>
      </div>
    </ContentContainer>
  );
}

export default LessonPage;
