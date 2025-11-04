import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import { getTeacherDashboard, getStudentDashboard, updateClassPacing } from "../lib/api.js";
import {
  YEAR7_CURRICULUM,
  YEAR7_LESSON_SEQUENCE,
  getYear7LessonById,
  getYear7LessonIndex,
} from "../../../shared/year7Curriculum.js";
import "./Year7MapPage.css";

const STATUS_LABELS = {
  complete: "Complete",
  current: "Current focus",
  ready: "Ready",
  locked: "Locked",
};

function isYear7ClassRecord(classRecord) {
  return (classRecord?.yearGroup ?? "").toLowerCase().includes("year 7");
}

function upsertClassPacingRecords(list = [], pacing) {
  if (!pacing?.classId) return Array.isArray(list) ? list : [];
  const filtered = (list ?? []).filter((entry) => entry?.classId !== pacing.classId);
  return [...filtered, pacing];
}

const TOTAL_YEAR7_LESSONS = YEAR7_LESSON_SEQUENCE.length;

export default function Year7MapPage() {
  const { session, ready } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = session?.token ?? null;
  const role = session?.user?.role ?? null;
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  const defaultUnitId = YEAR7_CURRICULUM[0]?.id ?? null;
  const [teacherData, setTeacherData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(searchParams.get("classId") || "");
  const [pacingState, setPacingState] = useState({});
  const [selectedUnitId, setSelectedUnitId] = useState(defaultUnitId);

  useEffect(() => {
    if (!ready || !token) return;

    setLoading(true);
    (async () => {
      try {
        if (isTeacher) {
          const data = await getTeacherDashboard(token);
          setTeacherData(data);
          setError(null);
          const year7Classes = (data?.classes ?? []).filter(isYear7ClassRecord);
          if (year7Classes.length > 0) {
            if (!selectedClassId || !year7Classes.some((clazz) => clazz.id === selectedClassId)) {
              setSelectedClassId(year7Classes[0].id);
            }
          } else if (selectedClassId) {
            setSelectedClassId("");
          }
        } else if (isStudent) {
          const data = await getStudentDashboard(token);
          setStudentData(data);
          setError(null);
          if (data?.class?.id && selectedClassId !== data.class.id) {
            setSelectedClassId(data.class.id);
          }
        } else {
          setError(new Error("This map is available to teachers and students only."));
        }
      } catch (fetchError) {
        setError(fetchError);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, token, isTeacher, isStudent, selectedClassId]);

  useEffect(() => {
    if (selectedClassId) {
      setSearchParams({ classId: selectedClassId });
    } else {
      setSearchParams({});
    }
  }, [selectedClassId, setSearchParams]);

  const teacherClasses = useMemo(() => {
    if (!teacherData?.classes) return [];
    return teacherData.classes.filter(isYear7ClassRecord);
  }, [teacherData?.classes]);

  const classPacingMap = useMemo(() => {
    const map = new Map();
    for (const entry of teacherData?.classPacing ?? []) {
      if (entry?.classId) {
        map.set(entry.classId, entry);
      }
    }
    return map;
  }, [teacherData?.classPacing]);

  const activePacing = useMemo(() => {
    if (isTeacher) {
      if (!selectedClassId) return null;
      return classPacingMap.get(selectedClassId) ?? null;
    }
    if (isStudent) {
      return studentData?.classPacing ?? null;
    }
    return null;
  }, [isTeacher, isStudent, selectedClassId, classPacingMap, studentData?.classPacing]);

  const pointerLesson = useMemo(() => {
    if (!activePacing?.lessonId) return null;
    return getYear7LessonById(activePacing.lessonId);
  }, [activePacing]);

  const pointerUnitId = pointerLesson?.unitId ?? null;

  useEffect(() => {
    if (pointerUnitId) {
      setSelectedUnitId(pointerUnitId);
    }
  }, [pointerUnitId]);

  const pointerUpdatedAt = useMemo(() => {
    if (!activePacing?.updatedAt) return null;
    const timestamp = new Date(activePacing.updatedAt);
    return Number.isNaN(timestamp.getTime()) ? null : timestamp.toLocaleString();
  }, [activePacing?.updatedAt]);

  const pointerIndex = useMemo(() => {
    if (!pointerLesson) return -1;
    return getYear7LessonIndex(pointerLesson.id);
  }, [pointerLesson]);

  const accessibleLessonCount = pointerIndex >= 0 ? pointerIndex + 1 : 0;

  const pacingInfo = selectedClassId ? pacingState[selectedClassId] : null;

  const moduleLinkState = selectedClassId ? { classId: selectedClassId } : undefined;

  const clearPacingMessage = useCallback((classId) => {
    setTimeout(() => {
      setPacingState((prev) => {
        const current = prev[classId];
        if (!current || current.busy) {
          return prev;
        }
        const next = { ...prev };
        delete next[classId];
        return next;
      });
    }, 4000);
  }, []);

  const handleStartTeaching = useCallback(async () => {
    if (!token || !selectedClassId) return;
    setPacingState((prev) => ({
      ...prev,
      [selectedClassId]: {
        ...(prev[selectedClassId] ?? {}),
        busy: true,
        message: "Updating pointer…",
        tone: "info",
      },
    }));

    try {
      const response = await updateClassPacing(token, selectedClassId, { command: "start" });
      if (response?.pacing) {
        setTeacherData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            classPacing: upsertClassPacingRecords(prev.classPacing, response.pacing),
          };
        });
      }
      const lessonTitle = response?.lesson?.title ?? "Lesson 1";
      setPacingState((prev) => ({
        ...prev,
        [selectedClassId]: {
          busy: false,
          message: `Pointer set to ${lessonTitle}`,
          tone: "success",
        },
      }));
    } catch (apiError) {
      setPacingState((prev) => ({
        ...prev,
        [selectedClassId]: {
          busy: false,
          message: apiError?.message || "Unable to update the teaching pointer.",
          tone: "error",
        },
      }));
    } finally {
      clearPacingMessage(selectedClassId);
    }
  }, [token, selectedClassId, clearPacingMessage]);

  const handleAdvanceTeaching = useCallback(async () => {
    if (!token || !selectedClassId) return;
    setPacingState((prev) => ({
      ...prev,
      [selectedClassId]: {
        ...(prev[selectedClassId] ?? {}),
        busy: true,
        message: "Advancing pointer…",
        tone: "info",
      },
    }));

    try {
      const response = await updateClassPacing(token, selectedClassId, { command: "advance" });
      if (response?.pacing) {
        setTeacherData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            classPacing: upsertClassPacingRecords(prev.classPacing, response.pacing),
          };
        });
      }
      const lessonTitle = response?.lesson?.title ?? "the next lesson";
      setPacingState((prev) => ({
        ...prev,
        [selectedClassId]: {
          busy: false,
          message: `Advanced to ${lessonTitle}`,
          tone: "success",
        },
      }));
    } catch (apiError) {
      setPacingState((prev) => ({
        ...prev,
        [selectedClassId]: {
          busy: false,
          message: apiError?.message || "Unable to advance the pointer.",
          tone: "error",
        },
      }));
    } finally {
      clearPacingMessage(selectedClassId);
    }
  }, [token, selectedClassId, clearPacingMessage]);

  const unitSummaries = useMemo(() => {
    return YEAR7_CURRICULUM.map((unit) => {
      const lessons = unit.lessons.map((lesson) => {
        const lessonIndex = getYear7LessonIndex(lesson.id);
        let status = "locked";
        if (pointerIndex >= 0) {
          if (lessonIndex < pointerIndex) status = "complete";
          else if (lessonIndex === pointerIndex) status = "current";
        } else if (lessonIndex === 0) {
          status = "ready";
        }
        return {
          ...lesson,
          status,
        };
      });

      const completed = lessons.filter((lesson) => lesson.status === "complete").length;
      const unlocked = lessons.filter((lesson) => lesson.status !== "locked").length;

      return {
        ...unit,
        lessons,
        completed,
        unlocked,
        progress: unit.lessons.length ? Math.round((completed / unit.lessons.length) * 100) : 0,
      };
    });
  }, [pointerIndex]);

  const selectedUnit = useMemo(() => {
    if (!unitSummaries.length) return null;
    if (selectedUnitId) {
      const match = unitSummaries.find((unit) => unit.id === selectedUnitId);
      if (match) {
        return match;
      }
    }
    return unitSummaries[0];
  }, [unitSummaries, selectedUnitId]);

  if (loading) {
    return (
      <div className="y7-map">
        <section className="y7-hero card">
          <p className="muted">Loading Year 7 adventure…</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="y7-map">
        <section className="y7-hero card">
          <h2>Unable to load Year 7 pathway</h2>
          <p className="muted">{error.message ?? "Please try again later."}</p>
        </section>
      </div>
    );
  }

  const teacherHasClasses = isTeacher && teacherClasses.length > 0;

  return (
    <div className="y7-map">
      <section className="y7-hero">
        <div className="y7-hero__intro">
          <span className="y7-hero__eyebrow">Key Stage 3</span>
          <h1>Year 7 Computing Adventure</h1>
          <p className="muted">
            Guide your class through a playful, teacher-paced journey. Unlock each lesson live so students stay in sync
            while earning XP and confidence.
          </p>
        </div>

        {isTeacher && (
          <div className="y7-controls">
            <label>
              <span>Select a class</span>
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                disabled={!teacherHasClasses}
              >
                <option value="">Preview (no class selected)</option>
                {teacherClasses.map((clazz) => (
                  <option key={clazz.id} value={clazz.id}>
                    {clazz.className}
                  </option>
                ))}
              </select>
            </label>

            <div className="y7-controls__actions">
              <button
                type="button"
                className="pill pill--action"
                onClick={handleStartTeaching}
                disabled={!selectedClassId || Boolean(pacingInfo?.busy)}
              >
                {activePacing ? "Restart at lesson 1" : "Start teaching"}
              </button>
              <button
                type="button"
                className="pill"
                onClick={handleAdvanceTeaching}
                disabled={!selectedClassId || !activePacing || Boolean(pacingInfo?.busy)}
              >
                Advance lesson
              </button>
            </div>

            <Link
              to="/curriculum/year7/intro"
              state={moduleLinkState}
              className="pill pill--action y7-controls__launch"
            >
              Open Unit 1 interactive lesson
            </Link>

            {pacingInfo?.message && (
              <p className={`y7-status y7-status--${pacingInfo.tone ?? "info"}`}>{pacingInfo.message}</p>
            )}

            {!teacherHasClasses && (
              <p className="muted">Create a Year 7 class to enable live pacing controls.</p>
            )}
          </div>
        )}

        {isStudent && (
          <div className="y7-student-focus">
            <span className="y7-student-focus__label">Current class focus</span>
            <strong>
              {pointerLesson
                ? `${pointerLesson.unitTitle}: ${pointerLesson.title}`
                : "Your teacher will unlock the first lesson in class."}
            </strong>
            {pointerUpdatedAt && <span className="muted">Updated {pointerUpdatedAt}</span>}
            <Link to="/curriculum/year7/intro" className="pill pill--action y7-student-focus__launch">
              Open Unit 1 lesson
            </Link>
          </div>
        )}
      </section>

      <section className="y7-overview">
        <article className="y7-overview__card">
          <span className="y7-overview__label">Lessons unlocked</span>
          <strong>
            {accessibleLessonCount} / {TOTAL_YEAR7_LESSONS}
          </strong>
        </article>
        {pointerLesson && (
          <article className="y7-overview__card">
            <span className="y7-overview__label">Live lesson</span>
            <strong>{pointerLesson.title}</strong>
            <span className="muted">{pointerLesson.unitTitle}</span>
          </article>
        )}
        {isStudent && pointerLesson && (
          <article className="y7-overview__card">
            <span className="y7-overview__label">What to do now</span>
            <p className="muted">
              Work through the unlocked lessons in order. Everything beyond the current pointer will unlock when your
              teacher is ready.
            </p>
          </article>
        )}
      </section>

      <section className="y7-board">
        <div className="y7-board__grid" aria-label="Year 7 units">
          {unitSummaries.map((unit) => {
            const isActive = selectedUnit?.id === unit.id;
            const isPointerUnit = pointerUnitId === unit.id;
            return (
              <button
                key={unit.id}
                type="button"
                className={`y7-unit-chip ${isActive ? "is-active" : ""}`}
                onClick={() => setSelectedUnitId(unit.id)}
                aria-pressed={isActive}
              >
                <span className="y7-unit-chip__icon" aria-hidden="true">
                  {unit.icon}
                </span>
                <div className="y7-unit-chip__meta">
                  <strong>{unit.title}</strong>
                  <span>{unit.progress}% unlocked · {unit.completed}/{unit.lessons.length} complete</span>
                </div>
                {isPointerUnit && <span className="y7-unit-chip__live">Live now</span>}
              </button>
            );
          })}
        </div>

        {selectedUnit && (
          <article className="y7-board__detail" aria-live="polite">
            <header className="y7-detail__header" style={{ borderColor: selectedUnit.accent }}>
              <div className="y7-detail__title">
                <span aria-hidden="true" className="y7-detail__icon">
                  {selectedUnit.icon}
                </span>
                <div>
                  <h2>{selectedUnit.title}</h2>
                  <p className="muted">{selectedUnit.summary}</p>
                </div>
              </div>
              <div className="y7-detail__stats">
                <div>
                  <span>Unlocked</span>
                  <strong>{selectedUnit.progress}%</strong>
                </div>
                <div>
                  <span>Completed</span>
                  <strong>{selectedUnit.completed}/{selectedUnit.lessons.length}</strong>
                </div>
              </div>
            </header>

            <ol className="y7-timeline">
              {selectedUnit.lessons.map((lesson) => {
                const statusLabel = STATUS_LABELS[lesson.status] ?? STATUS_LABELS.locked;
                return (
                  <li
                    key={lesson.id}
                    className={`y7-timeline__item y7-timeline__item--${lesson.status}`}
                    aria-current={lesson.status === "current" ? "step" : undefined}
                  >
                    <div className="y7-timeline__marker">{lesson.order}</div>
                    <div className="y7-timeline__body">
                      <div className="y7-timeline__heading">
                        <strong>{lesson.title}</strong>
                        <span>{lesson.duration}</span>
                      </div>
                      <span className="y7-timeline__status">{statusLabel}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </article>
        )}
      </section>

      <section className="y7-notes">
        <article>
          <h3>How pacing works</h3>
          <p>
            Teachers unlock one lesson at a time during class. Students automatically gain access to every prior lesson,
            so late joiners can catch up without losing momentum.
          </p>
        </article>
        <article>
          <h3>Planning time</h3>
          <p>
            Teachers can preview the entire pathway even when it’s locked for students. Use the preview mode to plan
            resources and adjust the pace for your group.
          </p>
        </article>
        <article>
          <h3>Student progress</h3>
          <p>
            New students start with a clean XP history but see every previously unlocked lesson right away. Encourage
            them to revisit earlier stages to build confidence.
          </p>
        </article>
      </section>
    </div>
  );
}

