import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTeacher as createTeacherRequest, deleteTeacher, getAdminDashboard } from "../lib/api.js";
import { useSession } from "../hooks/useSession.js";
import FeedbackPanel from "../components/ui/FeedbackPanel.jsx";
import "./AdminDashboardPage.css";

function AdminDashboardPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const token = session?.token ?? null;
  const isAdmin = session?.user?.role === "admin";
  const adminName = session?.user?.displayName ?? session?.user?.username ?? "Admin";

  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [ready, isAdmin, navigate]);

  const loadDashboard = useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const data = await getAdminDashboard(token);
      setDashboard(data);
      setStatus(null);
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to load admin dashboard." });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, token]);

  useEffect(() => {
    if (!ready || !isAdmin) return;
    loadDashboard();
  }, [ready, isAdmin, loadDashboard]);

  const handleCreateTeacher = async (event) => {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const username = form.username.value.trim();
    const password = form.password.value;

    if (!firstName || !lastName || !username || !password) {
      setStatus({ tone: "error", message: "All fields are required to create a teacher account." });
      return;
    }

    try {
      setStatus({ tone: "info", message: "Creating teacher…" });
      await createTeacherRequest(token, { firstName, lastName, username, password });
      form.reset();
      setStatus({ tone: "success", message: `Teacher "${username}" created.` });
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to create teacher." });
    }
  };

  const handleDeleteTeacher = async (username) => {
    if (!token || !username) return;
    const confirm = window.confirm(`Archive teacher "${username}" and their classes?`);
    if (!confirm) return;

    try {
      setStatus({ tone: "info", message: "Archiving teacher…" });
      await deleteTeacher(token, username);
      setStatus({ tone: "success", message: `Teacher "${username}" archived.` });
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to archive teacher." });
    }
  };

  if (!ready || !isAdmin) {
    return (
      <div className="admin-dashboard">
        <p className="muted">Preparing admin tools…</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <h2>Admin Control Centre</h2>
          <p>Manage teacher accounts so the platform can run smoothly even if you are away.</p>
        </div>
        <div className="admin-summary">
          <div>
            <span className="muted">Signed in as</span>
            <strong>{adminName}</strong>
          </div>
          <div>
            <span className="muted">Active teachers</span>
            <strong>{dashboard?.teachers?.filter((teacher) => !teacher.archivedAt).length ?? 0}</strong>
          </div>
          <div>
            <span className="muted">Archived teachers</span>
            <strong>{dashboard?.teachers?.filter((teacher) => teacher.archivedAt).length ?? 0}</strong>
          </div>
        </div>
      </div>

      {status && (
        <FeedbackPanel tone={status.tone === "error" ? "error" : status.tone === "success" ? "success" : "info"}>
          {status.message}
        </FeedbackPanel>
      )}
      {loading && <p className="muted">Loading data…</p>}

      <section className="create-teacher-section">
        <h3>Create teacher account</h3>
        <form onSubmit={handleCreateTeacher} className="admin-form">
          <label>
            <span>FIRST NAME</span>
            <input name="firstName" required />
          </label>
          <label>
            <span>LAST NAME</span>
            <input name="lastName" required />
          </label>
          <label>
            <span>USERNAME</span>
            <input name="username" required />
          </label>
          <label>
            <span>TEMPORARY PASSWORD</span>
            <input name="password" type="password" required />
          </label>
          <button type="submit" className="sg-button">
            <span className="sg-btn-icon">→</span>
            <span className="sg-btn-text">CREATE TEACHER</span>
          </button>
        </form>
      </section>

      <section className="teacher-roster-section">
        <h3>Teacher roster</h3>
        <div className="teacher-table">
          <div className="teacher-table__head">
            <span>Name</span>
            <span>Username</span>
            <span>Classes</span>
            <span>Active students</span>
            <span>Status</span>
            <span />
          </div>
          <div className="teacher-table__body">
            {dashboard?.teachers?.length === 0 && <p className="muted">No teacher records yet.</p>}
            {dashboard?.teachers?.map((teacher) => (
              <div key={teacher.id} className="teacher-row">
                <span>
                  <strong>{teacher.displayName}</strong>
                </span>
                <span>{teacher.username}</span>
                <span>{teacher.totals?.classes ?? 0}</span>
                <span>{teacher.totals?.activeStudents ?? 0}</span>
                <span className={teacher.archivedAt ? "muted" : "badge"}>
                  {teacher.archivedAt ? `Archived ${new Date(teacher.archivedAt).toLocaleDateString()}` : "Active"}
                </span>
                <span>
                  <button
                    type="button"
                    className="button-outline button-outline--danger"
                    onClick={() => handleDeleteTeacher(teacher.username)}
                    disabled={!!teacher.archivedAt}
                  >
                    Archive
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
