import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { findOneByField } from "../lib/instant.js";
import { hashPassword } from "../lib/hash.js";
import { useSession } from "../hooks/useSession.js";
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
      const collection = role === "teacher" ? "teachers" : "students";
      const user = await findOneByField(collection, "username", username);
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const hashedInput = await hashPassword(password);
      if (user.password !== hashedInput) {
        throw new Error("Invalid credentials");
      }
      setSession({ role, username, classId: user.classId || null });
      setStatus({ status: "success", message: "Signed in." });
      navigate(role === "teacher" ? "/dashboard" : "/student", { replace: true });
    } catch (error) {
      setStatus({ status: "error", message: error.message || "Login failed" });
    }
  };

  return (
    <div className="login-grid">
      <section className="card">
        <h2>Welcome back</h2>
        <p>Select your role, then enter your credentials.</p>
        <div className="role-toggle">
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
        <form onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input name="username" required autoComplete="username" />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button type="submit" disabled={status.status === "loading"}>
            {status.status === "loading" ? "Working…" : `Log in as ${roleLabel}`}
          </button>
          {status.message && <p className={`status status--${status.status}`}>{status.message}</p>}
        </form>
      </section>
      <section className="card">
        <h2>Dev note</h2>
        <p>
          This proof-of-concept talks directly to InstantDB using a temporary admin token. Rotate the
          token after the demo and move sensitive operations server-side.
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
