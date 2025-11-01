import { useEffect, useMemo, useState } from "react";
import { request, withAuthHeaders } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import TopicGrid from "../components/TopicGrid.jsx";
import "./StudentDashboardPage.css";

const TOPIC_CODES = [
  "A1.1",
  "A1.2",
  "A1.3",
  "A1.4",
  "A2.1",
  "A2.2",
  "A2.3",
  "A2.4",
  "A3.1",
  "A3.2",
  "A3.3",
  "A3.4",
  "A4.1",
  "A4.2",
  "A4.3",
  "A4.4",
  "B1.1",
  "B2.1",
  "B2.2",
  "B2.3",
  "B2.4",
  "B2.5",
  "B3.1",
  "B3.2",
  "B4.1",
];

function StudentDashboardPage() {
  const { token } = useSession();
  const [verifyState, setVerifyState] = useState({ status: "idle", message: "" });
  const [unlocks, setUnlocks] = useState([]);

  useEffect(() => {
    if (!token) {
      setVerifyState({
        status: "idle",
        message: "Sign in to view your progress.",
      });
      return;
    }

    let active = true;

    request("/verify", {
      method: "POST",
      headers: withAuthHeaders(token),
      body: JSON.stringify({ token }),
    })
      .then((data) => {
        if (!active) return;
        setVerifyState({
          status: data.valid ? "success" : "error",
          message: data.valid ? "Session verified." : "Token invalid.",
        });
      })
      .catch((error) => {
        if (!active) return;
        setVerifyState({ status: "error", message: error.message });
      });

    request("/t/dashboard", {
      headers: withAuthHeaders(token),
    })
      .then((data) => {
        if (!active) return;
        setUnlocks(data.unlocks ?? []);
      })
      .catch(() => {
        if (!active) return;
        setUnlocks([]);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const unlockedCodes = useMemo(
    () => new Set(unlocks.map((item) => item.topicId ?? item.topic?.id)),
    [unlocks],
  );

  return (
    <div className="student-grid">
      <section className="card">
        <h2>Student dashboard</h2>
        <p>Track your locked/unlocked topics and monitor progress.</p>
        {verifyState.message && (
          <p className={`status status--${verifyState.status}`}>{verifyState.message}</p>
        )}
      </section>

      <section className="card">
        <h3>Unlocked topics</h3>
        {unlocks.length === 0 ? (
          <p className="muted">No topics unlocked yet.</p>
        ) : (
          <div className="unlocks-grid">
            {unlocks.map((item, index) => (
              <article className="unlock-card" key={`${item.topicId ?? index}`}>
                <strong>{item.topic?.title ?? item.topicId}</strong>
                <span className="muted">Unlocked: {item.unlockedAt ?? "recently"}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h3>All syllabus topics</h3>
        <TopicGrid
          topics={TOPIC_CODES.map((code) => ({
            code,
            status: unlockedCodes.has(code) ? "unlocked" : "locked",
          }))}
        />
      </section>
    </div>
  );
}

export default StudentDashboardPage;
