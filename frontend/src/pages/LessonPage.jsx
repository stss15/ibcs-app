import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
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

// Mock function - will be replaced with actual API call  
async function fetchSubtopicLessons(subtopic) {
  // This will eventually fetch from the curriculum manifest
  // For now, return a mock structure
  const parts = subtopic.split('.');
  if (parts.length === 2) {
    // Return lessons for this subtopic
    const lessonCounts = {
      'A1.1': 9, 'A1.2': 5, 'A1.3': 7, 'A1.4': 1,
      'A2.1': 5, 'A2.2': 4, 'A2.3': 4, 'A2.4': 4,
      'A3.1': 1, 'A3.2': 7, 'A3.3': 6, 'A3.4': 4,
      'A4.1': 2, 'A4.2': 3, 'A4.3': 10, 'A4.4': 2,
      'B1.1': 4,
      'B2.1': 4, 'B2.2': 4, 'B2.3': 4, 'B2.4': 5, 'B2.5': 1,
      'B3.1': 5, 'B3.2': 5,
      'B4.1': 6,
    };
    
    const count = lessonCounts[subtopic] || 0;
    return Array.from({ length: count }, (_, i) => ({
      id: `${subtopic}.${i + 1}`,
      title: `${subtopic}.${i + 1}`,
      isUnlocked: i === 0, // First lesson is always unlocked
      isCompleted: false,
    }));
  }
  return [];
}

function LessonPage() {
  const { lessonId } = useParams();
  const { session } = useSession();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  
  // Extract subtopic from lessonId (e.g., "A1.1.1" → "A1.1")
  const subtopic = useMemo(() => {
    if (!lessonId) return null;
    const parts = lessonId.split('.');
    return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : null;
  }, [lessonId]);
  
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
  
  useEffect(() => {
    if (!lessonId || !subtopic) return;
    
    const loadLesson = async () => {
      setLoading(true);
      try {
        const [lessonData, subtopicLessons] = await Promise.all([
          fetchLessonContent(lessonId),
          fetchSubtopicLessons(subtopic),
        ]);
        setLesson(lessonData);
        setLessons(subtopicLessons);
      } catch (error) {
        console.error("Failed to load lesson:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLesson();
  }, [lessonId, subtopic]);
  
  const handleCompleteAssessment = () => {
    setAssessmentComplete(true);
    setShowAssessment(false);
    // TODO: Call API to mark lesson as complete and unlock next lesson
  };
  
  const handleNavigateToLesson = (lesson) => {
    if (!lesson.isUnlocked && !assessmentComplete) {
      alert("Complete the current lesson to unlock this one!");
      return;
    }
    navigate(`/lesson/${lesson.id}`);
  };
  
  if (loading) {
    return (
      <div className="lesson-page">
        <div className="lesson-container">
          <p className="muted">Loading lesson...</p>
        </div>
      </div>
    );
  }
  
  if (!lesson) {
    return (
      <div className="lesson-page">
        <div className="lesson-container">
          <p className="muted">Lesson not found.</p>
          <Link to="/curriculum">← Back to Curriculum Map</Link>
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
            <p className="muted">Lessons in this chapter</p>
          </div>
          
          <nav className="lesson-nav">
            {lessons.map((l) => {
              const isCurrent = l.id === lessonId;
              const isLocked = !l.isUnlocked && !assessmentComplete;
              
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
            <button className="btn-test" disabled>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
              </svg>
              End of Chapter Test
            </button>
            <p className="muted small">Complete all lessons to unlock</p>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="lesson-content">
          <header className="lesson-header">
            <h1>{lesson.title}</h1>
            <div className="lesson-header__meta">
              <span className="badge badge--primary">{subtopic}</span>
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
                
                {(assessmentComplete || !lesson.hasFormativeAssessment) && nextLesson && (
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
            const isLocked = !l.isUnlocked && !assessmentComplete;
            
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

