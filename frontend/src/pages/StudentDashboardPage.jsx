import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentDashboard } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import "./StudentDashboardPage.css";

function StudentDashboardPage() {
  const { session, clear, ready } = useSession();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [status, setStatus] = useState(null);

  const studentUsername = session?.user?.role === "student" ? session.user.username : null;
  const token = session?.token || null;

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!studentUsername) {
      navigate("/", { replace: true });
      return;
    }

    let active = true;
    setStatus({ tone: "info", message: "Loading student data…" });

    (async () => {
      try {
        if (!token) {
          throw new Error("Session expired");
        }
        const payload = await getStudentDashboard(token);
        if (!active) return;
        setStudent(payload?.student || null);
        setClassInfo(payload?.class || null);
        setStatus(null);
      } catch (error) {
        if (!active) return;
        setStatus({ tone: "error", message: error.message || "Failed to load student" });
      }
    })();

    return () => {
      active = false;
    };
  }, [studentUsername, navigate, token, ready]);

  if (!ready) {
    return (
      <div className="student-grid">
        <section className="card">
          <p className="muted">Checking session…</p>
        </section>
      </div>
    );
  }

  if (!studentUsername) {
    return null;
  }

  return (
    <div className="student-grid">
      <section className="card">
        <h2>Welcome, {studentUsername}</h2>
        <p>Your teacher has set up a guided journey. Check with them for the next tasks.</p>
        <button className="secondary" onClick={() => { clear(); navigate("/", { replace: true }); }}>
          Sign out
        </button>
        {status && <p className={`status status--${status.tone}`}>{status.message}</p>}
      </section>

      <section className="card">
        <h3>Your class</h3>
        {classInfo ? (
          <div className="topic-card">
            <strong>{classInfo.className}</strong>
            {classInfo.description && <p className="muted">{classInfo.description}</p>}
            <p className="muted">Class ID: {classInfo.id}</p>
          </div>
        ) : (
          <p className="muted">No class assigned yet.</p>
        )}
      </section>
    </div>
  );
}

export default StudentDashboardPage;
