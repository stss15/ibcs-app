import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeacherStudentDashboard } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import { useCurriculumManifest } from "../hooks/useCurriculumManifest.js";
import {
  StudentDashboardLayout,
  createUnitSummaries,
  createRecentUpdates,
  describeTrack,
  normaliseStatus,
} from "./StudentDashboardPage.jsx";
import { getYear7LessonById } from "../../../shared/year7Curriculum.js";

function TeacherStudentDashboardPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const token = session?.token ?? null;
  const isTeacher = session?.user?.role === "teacher";

  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState(null);

  const { manifest } = useCurriculumManifest();

  useEffect(() => {
    if (!ready) return;
    if (!isTeacher) {
      navigate("/", { replace: true });
      return;
    }
    if (!studentId || !token) {
      setStatus({ tone: "error", message: "Student identifier missing." });
      return;
    }

    let active = true;
    setStatus({ tone: "info", message: "Loading student dashboard…" });

    (async () => {
      try {
        const response = await getTeacherStudentDashboard(token, studentId);
        if (!active) return;
        setPayload(response);
        setStatus(null);
      } catch (error) {
        if (!active) return;
        setStatus({ tone: "error", message: error.message || "Unable to load student dashboard." });
      }
    })();

    return () => {
      active = false;
    };
  }, [ready, isTeacher, studentId, token, navigate]);

  const student = payload?.student ?? null;
  const classInfo = payload?.class ?? null;
  const classPacing = payload?.classPacing ?? null;
  const progress = useMemo(() => payload?.progress ?? [], [payload?.progress]);

  const pointerLesson = useMemo(() => {
    if (!classPacing?.lessonId) return null;
    return getYear7LessonById(classPacing.lessonId);
  }, [classPacing]);

  const pointerUpdatedAt = useMemo(() => {
    if (!classPacing?.updatedAt) return null;
    const date = new Date(classPacing.updatedAt);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
  }, [classPacing?.updatedAt]);

  const lessonStatusMap = useMemo(() => {
    const map = new Map();
    for (const record of progress) {
      map.set(record.lessonSlug, normaliseStatus(record.status));
    }
    return map;
  }, [progress]);

  const track = (student?.curriculumTrack ?? "ib-sl").toLowerCase();
  const isIBTrack = track.startsWith("ib");
  const trackDisplayName = describeTrack(track);
  const curriculumLink = isIBTrack ? "/curriculum/ib" : "/curriculum";
  const curriculumCtaLabel = isIBTrack ? "View curriculum map" : "Open curriculum overview";

  const unitSummaries = useMemo(() => {
    if (!manifest) return [];
    return createUnitSummaries(manifest, lessonStatusMap, track);
  }, [manifest, lessonStatusMap, track]);

  const totalLessons = unitSummaries.reduce((sum, unit) => sum + unit.totalCount, 0);
  const totalCompleted = unitSummaries.reduce((sum, unit) => sum + unit.completedCount, 0);
  const overallPercentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const recentUpdates = useMemo(() => createRecentUpdates(progress), [progress]);

  const gamificationSummary = {
    level: null,
    xp: null,
    streak: null,
    totalAttempts: null,
    totalCorrect: null,
    accuracy: null,
  };

  if (!ready || !isTeacher) {
    return null;
  }

  if (status?.tone === "error" && !payload) {
    return (
      <div className="page-shell page-shell--fluid student-dashboard">
        <p className="status-banner status-banner--error">{status.message}</p>
      </div>
    );
  }

  if (status?.tone === "info" && !payload) {
    return (
      <div className="page-shell page-shell--fluid student-dashboard">
        <p className="status-banner status-banner--info">{status.message}</p>
      </div>
    );
  }

  if (!manifest || !student) {
    return null;
  }

  return (
    <StudentDashboardLayout
      studentName={student.displayName ?? student.username ?? "Student"}
      track={track}
      trackDisplayName={trackDisplayName}
      curriculumLink={curriculumLink}
      curriculumCtaLabel={curriculumCtaLabel}
      overallPercentage={overallPercentage}
      totalCompleted={totalCompleted}
      totalLessons={totalLessons}
      classInfo={classInfo}
      activeStage={student.activeStage ?? null}
      pointerLesson={pointerLesson}
      pointerUpdatedAt={pointerUpdatedAt}
      gamification={gamificationSummary}
      unitSummaries={unitSummaries}
      interactiveAttemptSections={[]}
      recentUpdates={recentUpdates}
      status={status}
      isIBTrack={isIBTrack}
    />
  );
}

export default TeacherStudentDashboardPage;
