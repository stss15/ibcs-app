import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createClass, createStudent, getTeacherDashboard } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import "./TeacherDashboardPage.css";

function TeacherDashboardPage() {
  const { session, clear, ready } = useSession();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const teacherUsername = session?.user?.role === "teacher" ? session.user.username : null;
  const token = session?.token || null;

  useEffect(() => {
    if (!ready) return;
    if (!teacherUsername) {
      navigate("/", { replace: true });
    }
  }, [ready, teacherUsername, navigate]);

  const groupedStudents = useMemo(() => {
    const map = new Map();
    for (const student of students) {
      const key = String(student.classId ?? "");
      const list = map.get(key) || [];
      list.push(student);
      map.set(key, list);
    }
    return map;
  }, [students]);

  const loadDashboard = useCallback(async () => {
    if (!teacherUsername || !token) return;
    setLoading(true);
    setStatus({ tone: "info", message: "Loading dashboard…" });
    try {
      const payload = await getTeacherDashboard(token);
      setClasses(payload?.classes || []);
      setStudents(payload?.students || []);
      setStatus(null);
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to load dashboard." });
    } finally {
      setLoading(false);
    }
  }, [teacherUsername, token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSignOut = () => {
    clear();
    navigate("/", { replace: true });
  };

  async function handleCreateClass(event) {
    event.preventDefault();
    if (!teacherUsername || !token) return;
    const form = event.currentTarget;
    const className = form.className.value.trim();
    const description = form.description.value.trim();
    if (!className) {
      setStatus({ tone: "error", message: "Class name is required." });
      return;
    }
    setStatus({ tone: "info", message: "Creating class…" });
    try {
      await createClass(token, { className, description: description || undefined });
      form.reset();
      setStatus({ tone: "success", message: "Class created." });
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to create class." });
    }
  }

  async function handleAddStudent(event) {
    event.preventDefault();
    if (!teacherUsername || !token) return;
    const form = event.currentTarget;
    const classId = form.classId.value;
    const studentName = form.studentName.value.trim();
    const username = form.username.value.trim();
    const password = form.password.value;
    if (!classId || !studentName || !password) {
      setStatus({ tone: "error", message: "Class, student name, and password are required." });
      return;
    }
    setStatus({ tone: "info", message: "Adding student…" });
    try {
      await createStudent(token, {
        classId,
        studentName,
        username: username || undefined,
        password,
      });
      form.reset();
      setStatus({ tone: "success", message: "Student added." });
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to add student." });
    }
  }

  if (!ready) {
    return (
      <div className="dashboard-grid">
        <section className="card">
          <p className="muted">Checking session…</p>
        </section>
      </div>
    );
  }

  if (!teacherUsername) {
    return null;
  }

  return (
    <div className="dashboard-grid">
      <section className="card">
        <header className="card-header">
          <div>
            <h2>Teacher dashboard</h2>
            <p>Manage classes, enroll students, and review progress.</p>
          </div>
          <div className="card-actions">
            <Link to="/curriculum" className="button-outline">
              Curriculum map
            </Link>
            <button className="button-outline button-outline--danger" onClick={handleSignOut} type="button">
              Sign out
            </button>
          </div>
        </header>
        {status && <p className={`status status--${status.tone}`}>{status.message}</p>}
        {loading && <p className="muted">Loading…</p>}
        <div className="card-columns">
          <article>
            <h3>Create class</h3>
            <form onSubmit={handleCreateClass}>
              <label>
                <span>Class name</span>
                <input name="className" required placeholder="e.g. HL Year 1" />
              </label>
              <label>
                <span>Description</span>
                <input name="description" placeholder="Optional" />
              </label>
              <button type="submit" className="dashboard-submit">
                Create
              </button>
            </form>
          </article>

          <article>
            <h3>Add student</h3>
            <form onSubmit={handleAddStudent}>
              <label>
                <span>Class</span>
                <select name="classId" required>
                  <option value="">Select class</option>
                  {classes.map((clazz) => (
                    <option key={clazz.id} value={clazz.id}>
                      {clazz.className} ({clazz.id})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Student name</span>
                <input name="studentName" required placeholder="First name" />
              </label>
              <label>
                <span>Username (optional)</span>
                <input name="username" placeholder="username" />
              </label>
              <label>
                <span>Password</span>
                <input name="password" type="password" required placeholder="Temporary password" />
              </label>
              <button type="submit" className="dashboard-submit">
                Add student
              </button>
            </form>
          </article>
        </div>
      </section>

      <section className="card">
        <h3>Your classes</h3>
        <ul className="list">
          {classes.length === 0 && <li className="muted">No classes yet.</li>}
          {classes.map((clazz) => (
            <li key={clazz.id}>
              <strong>{clazz.className}</strong>
              <span className="muted">ID: {clazz.id}</span>
              {clazz.description && <span className="muted">Description: {clazz.description}</span>}
              <span className="muted">
                Students: {groupedStudents.get(String(clazz.id ?? clazz.classId ?? ""))?.length || 0}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Students</h3>
        <ul className="list">
          {students.length === 0 && <li className="muted">No students yet.</li>}
          {students.map((student) => (
            <li key={student.id}>
              <strong>{student.name}</strong>
              {student.username && <span className="muted">Username: {student.username}</span>}
              <span className="muted">Class ID: {student.classId}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default TeacherDashboardPage;
