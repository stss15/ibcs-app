import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import { useCurriculumManifest, getTrackLabel } from "../hooks/useCurriculumManifest.js";
import "./LessonPage.css";

// Mock function - will be replaced with actual API call
async function fetchLessonContent(lessonId) {
  // This will eventually fetch from the backend
  return {
    id: lessonId,
    title: `Lesson ${lessonId}`,
    content: "Lesson content will be loaded here",
    hasFormativeAssessment: true,
    isCompleted: false,
  };
}

function LessonPage() {
  const { lessonId } = useParams();
  const { session } = useSession();
  const navigate = useNavigate();
  const { manifest, status: manifestStatus, error: manifestError } = useCurriculumManifest();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  
  // Extract subtopic from lessonId (e.g., "A1.1.1" → "A1.1")
  const subtopic = useMemo(() => {
    if (!lessonId) return null;
    const parts = lessonId.split('.');
    return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : null;
  }, [lessonId]);

  const { unit: unitData, subtopic: subtopicData } = useMemo(() => {
    if (!manifest || !subtopic) {
      return { unit: null, subtopic: null };
    }

    for (const unit of manifest.units ?? []) {
      for (const candidate of unit.subtopics ?? []) {
        if (candidate.id === subtopic) {
          return {
            unit,
            subtopic: {
              ...candidate,
              unitAvailableFor: unit.availableFor ?? null,
            },
          };
        }
      }
    }

    return { unit: null, subtopic: null };
  }, [manifest, subtopic]);

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
    if (isTeacher) return true;
    if (!subtopicData) return false;
    const unitAccess = !subtopicData.unitAvailableFor || subtopicData.unitAvailableFor.includes(userProgramme);
    const subtopicAccess = !subtopicData.availableFor || subtopicData.availableFor.includes(userProgramme);
    return unitAccess && subtopicAccess;
  }, [subtopicData, userProgramme, isTeacher]);

  const lessons = useMemo(() => {
    if (!subtopicData) return [];
    const rawLessons = subtopicData.lessons ?? [];

    return rawLessons.map((item, index) => {
      if (isTeacher) {
        return {
          ...item,
          status: "unlocked",
          isUnlocked: true,
          isHLOnly: Boolean(item.hlOnly),
          teacherUnlocked: true,
          isCompleted: false,
        };
      }
      if (!chapterAccessible) {
        return {
          ...item,
          status: "hl-only",
          isUnlocked: false,
          isHLOnly: true,
          teacherUnlocked: false,
          isCompleted: false,
        };
      }

      if (item.hlOnly && userProgramme !== "ib-hl") {
        return {
          ...item,
          status: "hl-only",
          isUnlocked: false,
          isHLOnly: true,
          teacherUnlocked: false,
          isCompleted: false,
        };
      }

      const isUnlocked = index === 0;
      return {
        ...item,
        status: isUnlocked ? "unlocked" : "locked",
        isUnlocked,
        isHLOnly: Boolean(item.hlOnly),
        teacherUnlocked: false,
        isCompleted: false,
      };
    });
  }, [subtopicData, chapterAccessible, userProgramme, isTeacher]);
  
  const currentIndex = useMemo(() => {
    return lessons.findIndex((l) => l.id === lessonId);
  }, [lessons, lessonId]);
  
  const nextLesson = useMemo(() => {
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      return lessons[currentIndex + 1];
    }
    return null;
  }, [lessons, currentIndex]);
  
  const prevLesson = useMemo(() => {
    if (currentIndex > 0) {
      return lessons[currentIndex - 1];
    }
    return null;
  }, [lessons, currentIndex]);

  const isLoading = loading || manifestStatus === "loading";
  const lessonInManifest = currentIndex !== -1;
  const currentLessonMeta = lessons[currentIndex] ?? null;
  
  useEffect(() => {
    if (!lessonId) return;

    let cancelled = false;
    setLoading(true);
    setLesson(null);

    const loadLesson = async () => {
      try {
        const lessonData = await fetchLessonContent(lessonId);
        if (!cancelled) {
          setLesson(lessonData);
        }
      } catch (error) {
        console.error("Failed to load lesson:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      cancelled = true;
    };
  }, [lessonId]);
  
  const handleCompleteAssessment = () => {
    setAssessmentComplete(true);
    setShowAssessment(false);
    // TODO: Call API to mark lesson as complete and unlock next lesson
  };
  
  const handleNavigateToLesson = (lessonItem) => {
    if (isTeacher) {
      navigate(`/lesson/${lessonItem.id}`);
      return;
    }
    if (lessonItem.status === "hl-only") {
      alert("This lesson is only available to Higher Level students.");
      return;
    }
    if (lessonItem.status !== "unlocked" && !assessmentComplete) {
      alert("Complete the unlocked lesson and formative assessment to continue.");
      return;
    }
    navigate(`/lesson/${lessonItem.id}`);
  };
  
  if (isLoading) {
    return (
      <div className="lesson-page">
        <div className="lesson-container">
          <p className="muted">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (manifestError) {
    return (
      <div className="lesson-page">
        <div className="lesson-container">
          <h2>Unable to load curriculum</h2>
          <p className="muted">{manifestError.message ?? "Please try again later."}</p>
          <Link to="/curriculum">← Back to Curriculum Map</Link>
        </div>
      </div>
    );
  }
  
  if (!lessonInManifest || !subtopicData) {
    return (
      <div className="lesson-page">
        <div className="lesson-container">
          <p className="muted">Lesson not found in the IB Computer Science map.</p>
          <Link to="/curriculum">← Back to Curriculum Map</Link>
        </div>
      </div>
    );
  }

  if (!chapterAccessible) {
    return (
      <div className="lesson-page">
        <div className="lesson-container">
          <h2>This lesson is part of the Higher Level pathway</h2>
          <p className="muted">Ask your teacher to unlock it if you are studying the HL course.</p>
          <Link to={`/topic/${subtopic}`}>← Back to {subtopic}</Link>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-page">
        <div className="lesson-container">
          <p className="muted">Lesson content unavailable right now.</p>
          <Link to={`/topic/${subtopic}`}>← Back to {subtopic}</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="lesson-page">
      {/* Breadcrumb Navigation */}
      <nav className="lesson-breadcrumb">
        <Link to="/curriculum">Curriculum</Link>
        <span>/</span>
        <Link to={`/topic/${subtopic}`}>{subtopic}</Link>
        <span>/</span>
        <span>{lessonId}</span>
      </nav>
      
      <div className="lesson-container">
        {/* Sidebar with lesson navigation */}
        <aside className="lesson-sidebar">
          <div className="lesson-sidebar__header">
            <h3>{subtopic}</h3>
            <p className="muted">
              Part of {unitData?.id ?? subtopic?.split('.')[0]} · {unitData?.title ?? "IB Computer Science"}
            </p>
            <p className="muted small">Viewing as {trackLabel}</p>
            {!isTeacher && !chapterAccessible && (
              <span className="lesson-sidebar__alert">Locked for SL · Higher Level pathway</span>
            )}
          </div>
          
          <nav className="lesson-nav">
            {lessons.map((l) => {
              const isCurrent = l.id === lessonId;
              const isLocked = !isTeacher && ((l.status !== "unlocked" && !assessmentComplete) || l.status === "hl-only");
              
              return (
                <button
                  key={l.id}
                  className={`lesson-nav__item ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''} ${l.isCompleted ? 'completed' : ''}`}
                  onClick={() => handleNavigateToLesson(l)}
                  disabled={isLocked}
                >
                  <span className="lesson-nav__number">{l.id.split('.').pop()}</span>
                  <span className="lesson-nav__title">{l.title}</span>
                  {isLocked && (
                    <svg className="lesson-nav__lock" viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                    </svg>
                  )}
                  {l.isCompleted && (
                    <svg className="lesson-nav__check" viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </nav>
          
          {/* End of chapter test button */}
          <div className="lesson-sidebar__footer">
            <button className="btn-test" disabled aria-disabled="true">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
              </svg>
              {isTeacher ? "Teacher preview" : "End of Chapter Test"}
            </button>
            <p className="muted small">
              {isTeacher ? "Students must complete all lessons to unlock" : "Complete all lessons to unlock"}
            </p>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="lesson-content">
          <header className="lesson-header">
            <h1>{lesson.title}</h1>
            <div className="lesson-header__meta">
              <span className="badge badge--primary">{subtopic}</span>
              <span className="badge badge--muted">{trackLabel}</span>
              {currentLessonMeta?.isHLOnly && <span className="badge badge--hl">HL focus</span>}
              {isTeacher && <span className="badge badge--teacher">Teacher view</span>}
              {lesson.isCompleted && <span className="badge badge--success">Completed</span>}
            </div>
          </header>
          
          {!showAssessment ? (
            <>
              {/* Collapsible sections for content */}
              <div className="lesson-sections">
                <section className="lesson-section">
                  <h2 className="lesson-section__title">Learning Objectives</h2>
                  <div className="lesson-section__content">
                    <p>{lesson.content}</p>
                    <p className="muted">
                      In this lesson, you will learn about the key concepts related to {lesson.title}.
                    </p>
                  </div>
                </section>
                
                <section className="lesson-section">
                  <h2 className="lesson-section__title">Key Concepts</h2>
                  <div className="lesson-section__content">
                    <p>Content for key concepts goes here...</p>
                  </div>
                </section>
                
                <section className="lesson-section">
                  <h2 className="lesson-section__title">Examples</h2>
                  <div className="lesson-section__content">
                    <p>Examples and diagrams will be added here...</p>
                  </div>
                </section>
                
                <section className="lesson-section">
                  <h2 className="lesson-section__title">Real-World Applications</h2>
                  <div className="lesson-section__content">
                    <p>Real-world scenarios and applications...</p>
                  </div>
                </section>
              </div>
              
              {/* Action buttons */}
              <div className="lesson-actions">
                <button
                  className="btn btn--secondary"
                  onClick={() => prevLesson && navigate(`/lesson/${prevLesson.id}`)}
                  disabled={!prevLesson}
                >
                  ← Previous Lesson
                </button>
                
                {lesson.hasFormativeAssessment && !assessmentComplete && (
                  <button
                    className="btn btn--primary"
                    onClick={() => setShowAssessment(true)}
                  >
                    Take Formative Assessment →
                  </button>
                )}
                
                {(assessmentComplete || !lesson.hasFormativeAssessment || isTeacher) && nextLesson && (
                  <button
                    className="btn btn--primary"
                    onClick={() => navigate(`/lesson/${nextLesson.id}`)}
                  >
                    Next Lesson →
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Formative Assessment View */
            <div className="lesson-assessment">
              <h2>Formative Assessment</h2>
              <p className="muted">Complete this quick assessment to unlock the next lesson.</p>
              
              <div className="assessment-question">
                <h3>Question 1</h3>
                <p>What is the primary function of the CPU?</p>
                <div className="assessment-options">
                  <label>
                    <input type="radio" name="q1" value="a" />
                    <span>Store data permanently</span>
                  </label>
                  <label>
                    <input type="radio" name="q1" value="b" />
                    <span>Execute instructions</span>
                  </label>
                  <label>
                    <input type="radio" name="q1" value="c" />
                    <span>Display graphics</span>
                  </label>
                </div>
              </div>
              
              <div className="lesson-actions">
                <button
                  className="btn btn--secondary"
                  onClick={() => setShowAssessment(false)}
                >
                  Back to Lesson
                </button>
                <button
                  className="btn btn--primary"
                  onClick={handleCompleteAssessment}
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Progress dots at bottom */}
      <div className="lesson-progress">
        <div className="lesson-progress__track">
          {lessons.map((l, index) => {
            const isCurrent = l.id === lessonId;
            const isLocked = !isTeacher && ((l.status !== "unlocked" && !assessmentComplete) || l.status === "hl-only");
            
            return (
              <button
                key={l.id}
                className={`lesson-progress__dot ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''} ${l.isCompleted ? 'completed' : ''}`}
                onClick={() => handleNavigateToLesson(l)}
                disabled={isLocked}
                title={l.title}
                aria-label={`Lesson ${index + 1}: ${l.title}`}
              >
                {l.isCompleted ? '✓' : index + 1}
              </button>
            );
          })}
        </div>
        <p className="lesson-progress__label">
          Lesson {currentIndex + 1} of {lessons.length}
        </p>
      </div>
    </div>
  );
}

export default LessonPage;

