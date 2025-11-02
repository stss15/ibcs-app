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
          <Link to="/dashboard">Teacher dashboard</Link>
          <Link to="/student">Student view</Link>
        </nav>
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        <small>
          Static SPA served via GitHub Pages · Auth + data flows now run through the Cloudflare Worker
          backed by InstantDB.
        </small>
      </footer>
    </div>
  );
}

export default Layout;
