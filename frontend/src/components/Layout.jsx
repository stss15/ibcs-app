import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header__content">
          <Link to="/curriculum" className="layout-brand">
            <img src={logo} alt="School crest" className="layout-brand__mark" />
            <div>
              <span className="layout-brand__title">Computer Science Department</span>
              <small className="layout-brand__subtitle">International British College of Spain</small>
            </div>
          </Link>

          <nav className="layout-nav">
            <Link to="/">Login</Link>
            <Link to="/dashboard">Teacher dashboard</Link>
            <Link to="/student">Student dashboard</Link>
            <Link to="/curriculum">Curriculum map</Link>
          </nav>
        </div>
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        <small>© {new Date().getFullYear()} Computer Science Department · All curriculum in progress.</small>
      </footer>
    </div>
  );
}

export default Layout;
