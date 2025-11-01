import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import "./LoginPage.css";

const initialState = { status: "idle", message: "" };

function LoginPage() {
  const [teacherState, setTeacherState] = useState(initialState);
  const [studentState, setStudentState] = useState(initialState);
  const { setToken } = useSession();
  const navigate = useNavigate();

  const tokenText = useMemo(() => (value) => (value ? `${value.slice(0, 24)}…` : "n/a"), []);

  async function handleTeacherSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      email: form.email.value.trim(),
      password: form.password.value,
    };

    setTeacherState({ status: "loading", message: "Signing in…" });

    try {
      const data = await request("/t/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.token) {
        setToken(data.token);
      }
      setTeacherState({
        status: "success",
        message: `Signed in. Token ${tokenText(data.token)}`,
      });
      navigate("/teacher");
    } catch (error) {
      setTeacherState({
        status: "error",
        message: error.message,
      });
    }
  }

  async function handleStudentSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      classCode: form.classCode.value.trim(),
      username: form.username.value.trim(),
      password: form.password.value,
    };

    setStudentState({ status: "loading", message: "Signing in…" });

    try {
      const data = await request("/s/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.token) {
        setToken(data.token);
      }
      setStudentState({
        status: "success",
        message: `Signed in. Token ${tokenText(data.token)}`,
      });
      navigate("/student");
    } catch (error) {
      setStudentState({
        status: "error",
        message: error.message,
      });
    }
  }

  return (
    <div className="login-grid">
      <section className="card">
        <h2>Teacher sign in</h2>
        <form onSubmit={handleTeacherSubmit}>
          <label>
            <span>Email or username</span>
            <input name="email" required autoComplete="username" />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button type="submit" disabled={teacherState.status === "loading"}>
            {teacherState.status === "loading" ? "Working…" : "Sign in"}
          </button>
          <Status {...teacherState} />
        </form>
      </section>

      <section className="card">
        <h2>Student sign in</h2>
        <form onSubmit={handleStudentSubmit}>
          <label>
            <span>Class code</span>
            <input name="classCode" required />
          </label>
          <label>
            <span>Username</span>
            <input name="username" required autoComplete="username" />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button type="submit" disabled={studentState.status === "loading"}>
            {studentState.status === "loading" ? "Working…" : "Enter"}
          </button>
          <Status {...studentState} />
        </form>
      </section>

      <section className="card">
        <h2>Dashboards</h2>
        <div className="link-grid">
          <Link className="link-card" to="/teacher">
            <strong>Teacher dashboard</strong>
            <p>Manage classes, unlock topics, and monitor submissions.</p>
          </Link>
          <Link className="link-card" to="/student">
            <strong>Student dashboard</strong>
            <p>Follow the gated journey and track formative progress.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Status({ status, message }) {
  if (!message) return null;
  return <p className={`status status--${status}`}>{message}</p>;
}

export default LoginPage;
