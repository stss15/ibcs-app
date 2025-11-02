import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import logo from "../assets/logo.svg";
import "./Layout.css";

function Layout({ children }) {
  const { session, clear } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const role = session?.user?.role ?? null;
  const firstName = (session?.user?.firstName || "").trim();
  const displayName = session?.user?.displayName ?? session?.user?.username ?? "";
  const greetingName = firstName || displayName.split(" ")[0] || "";

  const navItems = useMemo(() => {
    if (role === "teacher") {
      return [
        { to: "/dashboard", label: "Teacher dashboard" },
        { to: "/curriculum", label: "Curriculum map" },
      ];
    }
    if (role === "student") {
      return [
        { to: "/student", label: "Student dashboard" },
        { to: "/curriculum", label: "Curriculum map" },
      ];
    }
    if (role === "admin") {
      return [
        { to: "/admin", label: "Admin dashboard" },
        { to: "/curriculum", label: "Curriculum map" },
      ];
    }
    return [
      { to: "/", label: "Login" },
      { to: "/dashboard", label: "Teacher dashboard" },
      { to: "/student", label: "Student dashboard" },
      { to: "/curriculum", label: "Curriculum map" },
    ];
  }, [role]);

  const handleSignOut = () => {
    clear();
    if (location.pathname !== "/") {
      navigate("/", { replace: true });
    }
    setMenuOpen(false);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const accountLabel = role ? `Hi, ${greetingName || "there"}` : null;
  const handleAccountBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header__content">
          <Link to="/curriculum" className="layout-brand">
            <img src={logo} alt="School crest" className="layout-brand__mark" />
            <div>
              <span className="layout-brand__title">Computer Science Department</span>
              <small className="layout-brand__subtitle">
                St Georges British International Schools Group Germany
              </small>
            </div>
          </Link>

          <nav className="layout-nav">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>

          {role && (
            <div className="layout-account" onBlur={handleAccountBlur}>
              <button
                type="button"
                className="layout-account__button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="layout-account__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 19c0-3.5 3.1-6 8-6s8 2.5 8 6" />
                  </svg>
                </span>
                <span className="layout-account__label">{accountLabel}</span>
              </button>
              {menuOpen && (
                <div className="layout-account__menu" role="menu">
                  <Link to="/account" role="menuitem">
                    My account
                  </Link>
                  <button type="button" onClick={handleSignOut} role="menuitem">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
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
