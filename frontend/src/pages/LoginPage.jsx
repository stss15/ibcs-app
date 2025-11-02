import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import logo from "../assets/logo.svg";
import "./LoginPage.css";

const initialState = { status: "idle", message: "" };

function LoginPage() {
  const [role, setRole] = useState("teacher");
  const [status, setStatus] = useState(initialState);
  const { setSession } = useSession();
  const navigate = useNavigate();

  const roleLabel = role === "teacher" ? "Teacher" : "Student";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
      setStatus({ status: "error", message: "Enter username and password." });
      return;
    }

    setStatus({ status: "loading", message: `Signing in as ${roleLabel}…` });

    try {
      const response = await loginRequest({ role, username, password });
      if (!response?.token || !response?.user) {
        throw new Error("Unexpected login response");
      }
      setSession({ token: response.token, user: response.user });
      setStatus({ status: "success", message: "Signed in." });
      navigate(response.user.role === "teacher" ? "/dashboard" : "/student", { replace: true });
    } catch (error) {
      setStatus({ status: "error", message: error.message || "Login failed" });
    }
  };

  return (
    <div className="login-container">
      <section className="login-card">
        <header className="login-card__header">
          <img src={logo} alt="School crest" className="login-card__logo" />
          <div>
            <h1>Computer Science Department</h1>
            <p className="muted">Sign in to access the teaching dashboards and curriculum map.</p>
          </div>
        </header>

        <div className="login-role">
          <span>Sign in as</span>
          <div className="login-role__toggle" role="group" aria-label="Choose account role">
            <button
              type="button"
              className={role === "teacher" ? "active" : ""}
              onClick={() => {
                setRole("teacher");
                setStatus(initialState);
              }}
            >
              Teacher
            </button>
            <button
              type="button"
              className={role === "student" ? "active" : ""}
              onClick={() => {
                setRole("student");
                setStatus(initialState);
              }}
            >
              Student
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>Username</span>
            <input name="username" required autoComplete="username" />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button type="submit" className="login-submit" disabled={status.status === "loading"}>
            {status.status === "loading" ? "Working…" : `Log in as ${roleLabel}`}
          </button>
          {status.message && <p className={`status status--${status.status}`}>{status.message}</p>}
        </form>

        <footer className="login-footnote">
          <p className="muted">
            Staff and students share the same sign-in screen—select your role above so we can route you
            to the right dashboard.
          </p>
        </footer>
      </section>
    </div>
  );
}

export default LoginPage;
