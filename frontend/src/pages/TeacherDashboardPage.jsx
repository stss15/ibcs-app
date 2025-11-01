import { useEffect, useState } from "react";
import { request, withAuthHeaders } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import "./TeacherDashboardPage.css";

function TeacherDashboardPage() {
  const { token, clear } = useSession();
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    let active = true;
    request("/t/dashboard", {
      headers: withAuthHeaders(token),
    })
      .then((data) => {
        if (active) {
          setDashboard(data);
        }
      })
      .catch((error) => {
        if (active) {
          setStatus({ tone: "error", message: error.message });
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  if (!token) {
    return (
      <section className="card">
        <h2>Authentication required</h2>
        <p>Sign in from the login page to manage your classes.</p>
      </section>
    );
  }

  async function handleSubmit(event, endpoint, transform) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = transform(new FormData(form));

    try {
      setStatus({ tone: "info", message: "Saving…" });
      await request(endpoint, {
        method: "POST",
        headers: withAuthHeaders(token),
        body: JSON.stringify(payload),
      });
      setStatus({ tone: "success", message: "Saved!" });
      form.reset();
      const refreshed = await request("/t/dashboard", {
        headers: withAuthHeaders(token),
      });
      setDashboard(refreshed);
    } catch (error) {
      setStatus({ tone: "error", message: error.message });
    }
  }

  return (
    <div className="dashboard-grid">
      <section className="card">
        <header className="card-header">
          <div>
            <h2>Teacher dashboard</h2>
            <p>Manage classes, enroll students, and unlock topics.</p>
          </div>
          <button className="secondary" onClick={clear}>
            Sign out
          </button>
        </header>
        {status && <p className={`status status--${status.tone}`}>{status.message}</p>}
        <div className="card-columns">
          <article>
            <h3>Create class</h3>
            <form
              onSubmit={(event) =>
                handleSubmit(event, "/t/add-class", (form) => ({
                  name: form.get("name"),
                  description: form.get("description"),
                }))
              }
            >
              <label>
                <span>Class name</span>
                <input name="name" required placeholder="e.g. HL Year 1" />
              </label>
              <label>
                <span>Description</span>
                <input name="description" placeholder="Optional short label" />
              </label>
              <button type="submit">Create</button>
            </form>
          </article>

          <article>
            <h3>Add student</h3>
            <form
              onSubmit={(event) =>
                handleSubmit(event, "/t/add-student", (form) => ({
                  classId: form.get("classId"),
                  student: {
                    username: form.get("username"),
                    name: form.get("name"),
                    password: form.get("password"),
                  },
                }))
              }
            >
              <label>
                <span>Class ID</span>
                <input name="classId" required />
              </label>
              <label>
                <span>Student username</span>
                <input name="username" required />
              </label>
              <label>
                <span>Display name</span>
                <input name="name" placeholder="Optional" />
              </label>
              <label>
                <span>Password</span>
                <input name="password" type="password" placeholder="Temporary password" />
              </label>
              <button type="submit">Enroll</button>
            </form>
          </article>

          <article>
            <h3>Unlock topic</h3>
            <form
              onSubmit={(event) =>
                handleSubmit(event, "/t/unlock-topic", (form) => ({
                  classId: form.get("classId"),
                  topicId: form.get("topicId"),
                }))
              }
            >
              <label>
                <span>Class ID</span>
                <input name="classId" required />
              </label>
              <label>
                <span>Topic ID</span>
                <input name="topicId" required placeholder="e.g. A1.1" />
              </label>
              <button type="submit">Unlock</button>
            </form>
          </article>
        </div>
      </section>

      <section className="card">
        <h3>Your classes</h3>
        <ul className="list">
          {dashboard?.classes?.length ? (
            dashboard.classes.map((item) => (
              <li key={item.id ?? item.classId}>
                <strong>{item.name ?? "Class"}</strong>
                <span className="muted">ID: {item.id ?? item.classId ?? "unknown"}</span>
              </li>
            ))
          ) : (
            <li className="muted">No classes yet.</li>
          )}
        </ul>
      </section>

      <section className="card">
        <h3>Roster</h3>
        <ul className="list">
          {dashboard?.roster?.length ? (
            dashboard.roster.map((item, index) => (
              <li key={`${item.studentId ?? index}`}>
                <strong>{item.student?.name ?? item.student?.username ?? item.studentId}</strong>
                <span className="muted">Class: {item.classId ?? "n/a"}</span>
                <span className="badge">{item.status ?? "active"}</span>
              </li>
            ))
          ) : (
            <li className="muted">No enrollments yet.</li>
          )}
        </ul>
      </section>

      <section className="card">
        <h3>Unlocked topics</h3>
        <ul className="list">
          {dashboard?.unlocks?.length ? (
            dashboard.unlocks.map((item, index) => (
              <li key={`${item.topicId ?? index}`}>
                <strong>{item.topic?.title ?? item.topicId}</strong>
                <span className="muted">Unlocked: {item.unlockedAt ?? "recently"}</span>
                <span className="muted">Class: {item.classId ?? "n/a"}</span>
              </li>
            ))
          ) : (
            <li className="muted">No topics unlocked yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

export default TeacherDashboardPage;
