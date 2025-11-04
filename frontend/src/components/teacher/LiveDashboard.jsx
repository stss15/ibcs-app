import { useEffect, useMemo, useState } from "react";
import { db } from "../../lib/instantdb/schema.js";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function tileTone(state) {
  if (!state?.isActive) return "is-idle";
  if (state.isBehind) return "is-behind";
  return "is-on-time";
}

export default function LiveDashboard({ sessionId, classSize = 0 }) {
  const [studentStates, setStudentStates] = useState([]);
  const [assessmentProgress, setAssessmentProgress] = useState({});

  const engagementScore = useMemo(() => {
    if (studentStates.length === 0) return 0;
    const active = studentStates.filter((state) => state.isActive).length;
    const onTrack = studentStates.filter((state) => !state.isBehind).length;
    return Math.round(((active + onTrack) / (studentStates.length * 2)) * 100);
  }, [studentStates]);

  useEffect(() => {
    if (!sessionId || !db) return undefined;

    const unsubscribeStates = db.subscribeQuery(db.studentStates.where("sessionId", sessionId), (states) => {
      setStudentStates(states);
    });

    const unsubscribeAssessments = db.subscribeQuery(db.assessmentResponses.where("sessionId", sessionId), (responses) => {
      const summary = {};
      responses.forEach((response) => {
        if (!summary[response.assessmentId]) {
          summary[response.assessmentId] = { completed: 0, inProgress: 0, notStarted: classSize };
        }
        if (response.isComplete) {
          summary[response.assessmentId].completed += 1;
          summary[response.assessmentId].notStarted -= 1;
        } else {
          summary[response.assessmentId].inProgress += 1;
          summary[response.assessmentId].notStarted -= 1;
        }
      });
      setAssessmentProgress(summary);
    });

    return () => {
      unsubscribeStates?.();
      unsubscribeAssessments?.();
    };
  }, [sessionId, classSize]);

  return (
    <div className="live-dashboard">
      <header className="live-dashboard__header">
        <h2>Live class dashboard</h2>
        <p>Monitor engagement and assessment progress in real time.</p>
      </header>

      <div className="live-dashboard__metrics">
        <div className="live-dashboard__card">
          <h3>Class engagement</h3>
          <div className="live-dashboard__gauge">
            <CircularProgressbar
              value={engagementScore}
              text={`${engagementScore}%`}
              styles={buildStyles({
                pathColor: engagementScore > 70 ? "#10b981" : engagementScore > 40 ? "#f59e0b" : "#ef4444",
                textColor: "#0f172a",
                trailColor: "#e2e8f0",
              })}
            />
          </div>
        </div>

        <div className="live-dashboard__card">
          <h3>Active students</h3>
          <p className="live-dashboard__value">
            {studentStates.filter((state) => state.isActive).length} / {classSize}
          </p>
          <p className="live-dashboard__note">{studentStates.filter((state) => state.isBehind).length} behind pointer</p>
        </div>

        <div className="live-dashboard__card">
          <h3>Assessment status</h3>
          {Object.keys(assessmentProgress).length === 0 ? (
            <p className="live-dashboard__note">No active assessments</p>
          ) : (
            <ul className="live-dashboard__assessment-list">
              {Object.entries(assessmentProgress).map(([assessmentId, summary]) => (
                <li key={assessmentId}>
                  <div className="live-dashboard__assessment-row">
                    <span className="chip chip--success">✓ {summary.completed}</span>
                    <span className="chip chip--warn">⟳ {summary.inProgress}</span>
                    <span className="chip chip--muted">○ {summary.notStarted}</span>
                  </div>
                  <div className="live-dashboard__progress">
                    <div
                      className="live-dashboard__progress-bar"
                      style={{ width: `${classSize ? Math.round((summary.completed / classSize) * 100) : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="live-dashboard__grid">
        <header>
          <h3>Student status</h3>
        </header>
        <div className="live-dashboard__grid-body">
          {studentStates.length === 0 ? (
            <p className="live-dashboard__note">Waiting for students to join…</p>
          ) : (
            studentStates.map((state) => (
              <div key={state.studentId} className={`live-dashboard__tile ${tileTone(state)}`}>
                <span>{state.studentId?.slice(-4)}</span>
                <strong>Slide {state.currentPosition ?? 0}</strong>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

