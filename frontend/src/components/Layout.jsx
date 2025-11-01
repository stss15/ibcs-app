import { Link } from "react-router-dom";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header__brand">
          <h1>IBCS Learning Journey</h1>
          <p>Teacher-directed, student-paced mastery for IB Computer Science.</p>
        </div>
        <nav>
          <Link to="/">Login</Link>
          <Link to="/teacher">Teacher</Link>
          <Link to="/student">Student</Link>
        </nav>
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        <small>
          Worker: {__WORKER_BASE__ || "configure WORKER_BASE"} · InstantDB App:{" "}
          {__INSTANT_APP_ID__ || "configure INSTANT_APP_ID"}
        </small>
      </footer>
    </div>
  );
}

export default Layout;
