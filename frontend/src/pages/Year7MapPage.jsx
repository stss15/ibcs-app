import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTeacherDashboard,
  getClassPacing,
  getStudentDashboard,
  getStudentClassPacing,
} from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import { YEAR7_UNITS, describeSlide, listSlidesForDeck } from "../../../shared/liveDecks.js";
import "./Year7MapPage.css";

function normaliseAccessible(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.slideId) return value.slideId;
  if (typeof value === "object" && value.id) return value.id;
  return null;
}

function buildSnapshot(payload) {
  if (!payload) return null;
  const pacing = payload.pacing ?? payload;
  const lessonId = payload.lesson?.id || pacing?.lessonId || pacing?.slideId || null;
  const lesson = lessonId ? describeSlide(lessonId) : null;
  const accessibleSource = payload.accessibleSlides ?? pacing?.accessibleSlides ?? [];
  const accessible = new Set(accessibleSource.map((entry) => normaliseAccessible(entry)).filter(Boolean));
  if (lesson?.slideId) accessible.add(lesson.slideId);
  return {
    classDoc: payload.class ?? null,
    pacing,
    lesson,
    accessible,
    sessionCode: pacing?.sessionCode ?? null,
    sessionStatus: pacing?.sessionStatus ?? (lesson ? "live" : "idle"),
    updatedAt: pacing?.updatedAt ?? null,
  };
}

function formatTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function statusBadge(status) {
  switch ((status || "upcoming").toLowerCase()) {
    case "available":
      return { label: "Ready", className: "is-ready" };
    case "upcoming":
    default:
      return { label: "Coming soon", className: "is-upcoming" };
  }
}

function statusLabel(status) {
  switch ((status || "upcoming").toLowerCase()) {
    case "live":
      return "Live";
    case "idle":
    default:
      return "Idle";
  }
}

export default function Year7MapPage() {
  const { session, ready } = useSession();
  const token = session?.token ?? null;
  const role = session?.user?.role ?? null;
  const isTeacher = role === "teacher";
  const isStudent = role === "student";
  const navigate = useNavigate();

  const [selectedUnitId, setSelectedUnitId] = useState(YEAR7_UNITS[0]?.id ?? "");
  const selectedUnit = YEAR7_UNITS.find((unit) => unit.id === selectedUnitId) ?? YEAR7_UNITS[0];

  const [teacherData, setTeacherData] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classSnapshot, setClassSnapshot] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentSnapshot, setStudentSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const unitDeckSlides = useMemo(() => (selectedUnit?.deckId ? listSlidesForDeck(selectedUnit.deckId) : []), [selectedUnit?.deckId]);

  useEffect(() => {
    if (!ready || !token) return;
    const run = async () => {
      setLoading(true);
      try {
        if (isTeacher) {
          const data = await getTeacherDashboard(token);
          setTeacherData(data);
          const year7Classes = (data.classes || []).filter((clazz) => {
            const label = String(clazz?.yearGroup || "").toLowerCase();
            return label.includes("year 7") || label.includes("ks3");
          });
          const defaultClass = year7Classes[0]?.id || "";
          setSelectedClassId((previous) => (previous && year7Classes.some((clazz) => clazz.id === previous) ? previous : defaultClass));
        } else if (isStudent) {
          const dashboard = await getStudentDashboard(token);
          setStudentInfo(dashboard);
          const classId = dashboard.class?.id || dashboard.student?.classId || "";
          if (classId) {
            const response = await getStudentClassPacing(token, classId);
            setStudentSnapshot(buildSnapshot(response));
          } else {
            setStudentSnapshot(null);
          }
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [ready, token, isTeacher, isStudent]);

  useEffect(() => {
    if (!isTeacher || !token || !selectedClassId) {
      setClassSnapshot(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await getClassPacing(token, selectedClassId);
        if (!cancelled) setClassSnapshot(buildSnapshot(response));
      } catch (err) {
        console.error(err);
        if (!cancelled) setClassSnapshot(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isTeacher, token, selectedClassId]);

  useEffect(() => {
    if (!isStudent || !token || !studentInfo?.class?.id) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await getStudentClassPacing(token, studentInfo.class.id);
        if (!cancelled) setStudentSnapshot(buildSnapshot(response));
      } catch (err) {
        console.error(err);
        if (!cancelled) setStudentSnapshot(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isStudent, token, studentInfo?.class?.id]);

  const handleTeachUnit = (unit) => {
    if (!unit.deckId) return;
    const params = new URLSearchParams();
    params.set("deckId", unit.deckId);
    if (selectedClassId) params.set("classId", selectedClassId);
    navigate(`/curriculum/year7/live?${params.toString()}`);
  };

  const handlePreviewUnit = (unit) => {
    if (!unit.deckId) return;
    navigate(`/curriculum/year7/live?deckId=${unit.deckId}`);
  };

  const handleStudentContinue = (unit) => {
    if (!unit.deckId) return;
    const params = new URLSearchParams();
    params.set("deckId", unit.deckId);
    navigate(`/curriculum/year7/live?${params.toString()}`);
  };

  return (
    <div className="y7-map-shell">
      <header className="y7-map-hero">
        <div>
          <span className="y7-map-eyebrow">Key Stage 3 · Year 7 Computing</span>
          <h1>Year 7 Curriculum Map</h1>
          <p>
            Launch a purposeful computing journey. Start with a teacher-paced introduction, then flow through practical units that
            blend pedagogy, live facilitation, and student independence.
          </p>
        </div>
      </header>

      {error && <div className="y7-map-alert">{error.message || "Something went wrong."}</div>}

      <div className="y7-map-layout">
        <section className="y7-map-units">
          {YEAR7_UNITS.map((unit) => {
            const badge = statusBadge(unit.status);
            const isSelected = unit.id === selectedUnit.id;
            return (
              <button
                key={unit.id}
                type="button"
                className={`y7-unit-card ${isSelected ? "is-selected" : ""}`}
                onClick={() => setSelectedUnitId(unit.id)}
              >
                <span className="y7-unit-icon" aria-hidden="true">
                  {unit.icon}
                </span>
                <div className="y7-unit-text">
                  <strong>{unit.title}</strong>
                  <p>{unit.summary}</p>
                </div>
                <span className={`y7-unit-status ${badge.className}`}>{badge.label}</span>
              </button>
            );
          })}
        </section>

        <aside className="y7-map-detail">
          <div className="y7-map-detail__header">
            <div>
              <h2>{selectedUnit.title}</h2>
              <p>{selectedUnit.summary}</p>
            </div>
            <div className="y7-map-stats">
              {selectedUnit.estimatedHours && (
                <div>
                  <span>Estimated time</span>
                  <strong>{selectedUnit.estimatedHours}</strong>
                </div>
              )}
              <div>
                <span>Status</span>
                <strong>{statusBadge(selectedUnit.status).label}</strong>
              </div>
            </div>
          </div>

          <div className="y7-map-detail__actions">
            {selectedUnit.deckId ? (
              isTeacher ? (
                <>
                  <label className="y7-map-field">
                    <span>Select a class</span>
                    <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
                      <option value="">Preview only</option>
                      {(teacherData?.classes || [])
                        .filter((clazz) => {
                          const label = String(clazz?.yearGroup || "").toLowerCase();
                          return label.includes("year 7") || label.includes("ks3");
                        })
                        .map((clazz) => (
                          <option key={clazz.id} value={clazz.id}>
                            {clazz.className}
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="y7-map-buttons">
                    <button
                      type="button"
                      className="y7-btn y7-btn--primary"
                      disabled={!selectedClassId || loading}
                      onClick={() => handleTeachUnit(selectedUnit)}
                    >
                      Start teaching
                    </button>
                    <button type="button" className="y7-btn" onClick={() => handlePreviewUnit(selectedUnit)}>
                      Preview deck
                    </button>
                  </div>
                </>
              ) : (
                <div className="y7-map-buttons">
                  <button type="button" className="y7-btn y7-btn--primary" onClick={() => handleStudentContinue(selectedUnit)}>
                    Continue learning
                  </button>
                  <button type="button" className="y7-btn" onClick={() => handlePreviewUnit(selectedUnit)}>
                    Preview deck
                  </button>
                </div>
              )
            ) : (
              <div className="y7-map-coming-soon">
                <p>We&apos;re crafting a live experience for this unit. Teacher notes, formative checkpoints, and pacing tools arrive soon.</p>
              </div>
            )}
          </div>

          <div className="y7-map-live-cards">
            {isTeacher && (
              <div className="y7-live-summary-card">
                <header>
                  <strong>Live session status</strong>
                  <span className={`chip ${classSnapshot ? classSnapshot.sessionStatus : "is-idle"}`}>
                    {statusLabel(classSnapshot?.sessionStatus)}
                  </span>
                </header>
                {classSnapshot?.lesson && classSnapshot.lesson.deckId === selectedUnit.deckId ? (
                  <>
                    <p>
                      Pointer on <strong>{classSnapshot.lesson.slideTitle}</strong>
                      {typeof classSnapshot.lesson.index === "number" && unitDeckSlides.length ? (
                        <span>
                          {" "}(slide {classSnapshot.lesson.index + 1} of {unitDeckSlides.length})
                        </span>
                      ) : null}
                    </p>
                    {classSnapshot.sessionCode && (
                      <p className="code">Join code: {classSnapshot.sessionCode}</p>
                    )}
                    {classSnapshot.updatedAt && (
                      <p className="meta">Updated {formatTimestamp(classSnapshot.updatedAt)}</p>
                    )}
                  </>
                ) : (
                  <p>No active session for this unit yet. Launch it to generate a join code and live pointer.</p>
                )}
              </div>
            )}

            {isStudent && (
              <div className="y7-live-summary-card">
                <header>
                  <strong>Your live pointer</strong>
                  <span className={`chip ${studentSnapshot ? studentSnapshot.sessionStatus : "is-idle"}`}>
                    {statusLabel(studentSnapshot?.sessionStatus)}
                  </span>
                </header>
                {studentSnapshot?.lesson && studentSnapshot.lesson.deckId === selectedUnit.deckId ? (
                  <>
                    <p>
                      Current slide: <strong>{studentSnapshot.lesson.slideTitle}</strong>
                      {typeof studentSnapshot.lesson.index === "number" && unitDeckSlides.length ? (
                        <span>
                          {" "}(slide {studentSnapshot.lesson.index + 1} of {unitDeckSlides.length})
                        </span>
                      ) : null}
                    </p>
                    {studentSnapshot.sessionCode && (
                      <p className="code">Join code: {studentSnapshot.sessionCode}</p>
                    )}
                  </>
                ) : (
                  <p>Your teacher hasn&apos;t started a live session for this unit yet. You can still review slides once it begins.</p>
                )}
              </div>
            )}
          </div>

          <div className="y7-map-note">
            <h3>Why this unit works</h3>
            <ul>
              <li>Teacher-paced slides keep the class together while enabling rapid formative feedback.</li>
              <li>Students revisit previous slides for retrieval practice but can never jump ahead of the pointer.</li>
              <li>Live checkpoints surface to the teacher dashboard, supporting classroom dialogue and responsive teaching.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

