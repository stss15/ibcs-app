import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "../../hooks/useSession.js";
import { getLiveAssessmentStatus } from "../../lib/api.js";
import "./LiveAssessmentDashboard.css";

const POLL_INTERVAL_MS = 4000;

function formatStatusLabel(status) {
  switch ((status || "not-started").toLowerCase()) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In Progress";
    default:
      return "Not Started";
  }
}

function LiveAssessmentDashboard({
  classId,
  unitId,
  segment,
  stage,
  isLastStage,
  nextStageTitle,
  advanceState,
  advanceError,
  onShowAssessment,
  onAdvancePacing,
}) {
  const { session } = useSession();
  const token = session?.token;
  const segmentId = segment?.id;
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ completed: 0, "in-progress": 0, "not-started": 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !classId || !unitId || !segmentId) {
      setRows([]);
      setSummary({ completed: 0, "in-progress": 0, "not-started": 0 });
      return;
    }

    let cancelled = false;
    let intervalId;

    async function fetchStatus(initial = false) {
      if (initial) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await getLiveAssessmentStatus(token, classId, { unitId, segmentId });
        if (cancelled) return;
        setRows(Array.isArray(data?.students) ? data.students : []);
        setSummary(data?.summary || { completed: 0, "in-progress": 0, "not-started": 0 });
        setError(null);
      } catch (fetchError) {
        if (cancelled) return;
        console.warn("Failed to load live assessment status", fetchError);
        setError(fetchError?.message || "Unable to load live progress right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStatus(true);
    intervalId = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [token, classId, unitId, segmentId]);

  const totals = useMemo(() => {
    const totalStudents = rows.length;
    const completed = typeof summary.completed === "number" ? summary.completed : rows.filter((row) => row.status === "completed").length;
    const inProgress = typeof summary["in-progress"] === "number" ? summary["in-progress"] : rows.filter((row) => row.status === "in-progress").length;
    const notStarted = Math.max(totalStudents - completed - inProgress, 0);
    return { totalStudents, completed, inProgress, notStarted };
  }, [rows, summary]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const left = (a.displayName || a.username || "").toLowerCase();
      const right = (b.displayName || b.username || "").toLowerCase();
      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    });
  }, [rows]);

  const unlockButtonLabel = isLastStage
    ? "Complete Unit"
    : nextStageTitle
    ? `Unlock ${nextStageTitle}`
    : "Unlock Next Stage";

  const isAdvancing = advanceState === "pending";
  const segmentTitle = segment?.heading || segment?.title || "Formative Check";
  const stageTitle = stage?.title || stage?.id || "Current Stage";

  return (
    <div className="live-assessment-dashboard">
      <div className="dashboard-header">
        <div>
          <h3>{stageTitle}</h3>
          <p className="dashboard-subtitle">{segmentTitle}</p>
        </div>
        <div className="summary">
          <span>{`Completion: ${totals.completed} / ${totals.totalStudents}`}</span>
          <progress value={totals.totalStudents > 0 ? totals.completed : 0} max={Math.max(totals.totalStudents, 1)} />
        </div>
      </div>

      <div className="dashboard-meta">
        <span className="meta-pill meta-pill--complete">Completed: {totals.completed}</span>
        <span className="meta-pill meta-pill--progress">In progress: {totals.inProgress}</span>
        <span className="meta-pill meta-pill--idle">Not started: {totals.notStarted}</span>
      </div>

      <div className="dashboard-controls">
        <button onClick={onShowAssessment} className="control-button">
          Show Assessment View
        </button>
        <button
          onClick={onAdvancePacing}
          className="control-button primary"
          disabled={!onAdvancePacing || isAdvancing}
        >
          {isAdvancing ? "Unlocking..." : unlockButtonLabel}
        </button>
      </div>

      {(loading || error || advanceError) && (
        <div className="dashboard-alerts">
          {loading && <span className="alert-note">Loading live status…</span>}
          {error && <span className="alert-error">{error}</span>}
          {!error && advanceError && <span className="alert-error">{advanceError}</span>}
        </div>
      )}

      <div className="student-grid-container">
        <table className="student-progress-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Score</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  {loading ? "Waiting for student activity…" : "No student attempts recorded yet."}
                </td>
              </tr>
            ) : (
              sortedRows.map((student) => {
                const statusClass = `status-${(student.status || "not-started").toLowerCase().replace(/\s+/g, '-')}`;
                const attempts = typeof student.attempts === "number" ? student.attempts : 0;
                const score = typeof student.score === "number" ? `${student.score}%` : "—";
                const lastUpdated = student.lastUpdated ? new Date(student.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                return (
                  <tr key={student.id} className={statusClass}>
                    <td>{student.displayName || student.username || "Student"}</td>
                    <td>
                      <span className="status-indicator" />
                      {formatStatusLabel(student.status)}
                    </td>
                    <td>{attempts}</td>
                    <td>{score}</td>
                    <td>{lastUpdated}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LiveAssessmentDashboard;

