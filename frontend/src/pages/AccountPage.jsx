import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import "./AccountPage.css";

function formatLabel(value) {
  if (!value) return "";
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function AccountPage() {
  const { session, clear } = useSession();
  const navigate = useNavigate();
  const user = session?.user ?? null;

  const details = useMemo(() => {
    if (!user) return [];
    const base = [
      { label: "Username", value: user.username || "—" },
      { label: "Role", value: formatLabel(user.role) || "—" },
      { label: "First name", value: user.firstName || "—" },
      { label: "Last name", value: user.lastName || "—" },
      { label: "Display name", value: user.displayName || "—" },
    ];

    if (user.role === "student") {
      base.push({ label: "Year group", value: user.yearGroup || "—" });
      base.push({ label: "Learning track", value: formatLabel(user.curriculumTrack) || "—" });
      base.push({ label: "Active stage", value: formatLabel(user.activeStage) || "—" });
    }

    if (user.role === "teacher") {
      base.push({ label: "Status", value: user.archivedAt ? `Archived on ${new Date(user.archivedAt).toLocaleDateString()}` : "Active" });
    }

    return base;
  }, [user]);

  if (!user) {
    return (
      <div className="account-grid">
        <section className="card">
          <h2>No session found</h2>
          <p className="muted">
            Please <Link to="/">return to the login screen</Link> to sign in.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="account-grid">
      <section className="card">
        <header className="card-header">
          <div>
            <h2>Account overview</h2>
            <p>Personal details and role-specific permissions for your profile.</p>
          </div>
          <button
            type="button"
            className="button-outline button-outline--danger"
            onClick={() => {
              clear();
              navigate("/", { replace: true });
            }}
          >
            Sign out
          </button>
        </header>
        <dl className="account-detail">
          {details.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default AccountPage;
