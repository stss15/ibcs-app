import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findOneByField, list } from "../lib/instant.js";
import { useSession } from "../hooks/useSession.js";
import "./StudentDashboardPage.css";

function StudentDashboardPage() {
  const { session, clear } = useSession();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [status, setStatus] = useState(null);

  const studentUsername = session?.role === "student" ? session.username : null;

  useEffect(() => {
    if (!studentUsername) {
      navigate("/", { replace: true });
      return;
    }

    let active = true;
    setStatus({ tone: "info", message: "Loading student data…" });

    (async () => {
      try {
        const studentDoc = await findOneByField("students", "username", studentUsername);
        if (!studentDoc) {
          throw new Error("Student record not found");
        }
        if (!active) return;
        setStudent(studentDoc);
        const classes = await list("classes");
        if (!active) return;
        const match = classes.find(
          (clazz) => String(clazz.id ?? clazz.classId ?? "") === String(studentDoc.classId ?? "")
        );
        setClassInfo(match || null);
        setStatus(null);
      } catch (error) {
        if (!active) return;
        setStatus({ tone: "error", message: error.message || "Failed to load student" });
      }
    })();

    return () => {
      active = false;
    };
  }, [studentUsername, navigate]);

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
