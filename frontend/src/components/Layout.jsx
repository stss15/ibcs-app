import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import logo from "../assets/logo.svg";
import "./Layout.css";

function Layout({ children }) {
  const { session, clear, ready } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const role = session?.user?.role ?? null;
  const firstName = (session?.user?.firstName || "").trim();
  const displayName = (session?.user?.displayName || session?.user?.username || "").trim();
  const greetingName = firstName || displayName.split(" ")[0] || "";
  const initials = useMemo(() => {
    if (!displayName) return "CS";
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return displayName.slice(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  const dashboardLink = useMemo(() => {
    if (role === "teacher") return "/dashboard";
    if (role === "student") return "/student";
    if (role === "admin") return "/admin";
    return null;
  }, [role]);

  const studentTrack = role === "student" ? (session?.user?.curriculumTrack || "").toLowerCase() : "";

  const navigationLinks = useMemo(() => {
    const links = [
      {
        to: "/curriculum",
        label: "Curriculum overview",
        match: (pathname) => pathname === "/curriculum",
      },
    ];

    const allowYear7Link =
      role === "teacher" ||
      role === "admin" ||
      studentTrack.startsWith("ks3") ||
      (session?.user?.yearGroup ?? "").toLowerCase().includes("year 7");

    if (allowYear7Link) {
      links.push({
        to: "/curriculum/year7",
        label: "Year 7 map",
        match: (pathname) => pathname.startsWith("/curriculum/year7"),
      });
    }

    const allowIbLink = role === "teacher" || role === "admin" || studentTrack.startsWith("ib");
    if (allowIbLink) {
      links.push({
        to: "/curriculum/ib",
        label: "IB curriculum map",
        match: (pathname) =>
          pathname.startsWith("/curriculum/ib") || pathname.startsWith("/topic") || pathname.startsWith("/lesson"),
      });
    }

    if (role === "teacher") {
      links.push({
        to: "/dashboard",
        label: "Teacher dashboard",
        match: (pathname) => pathname.startsWith("/dashboard"),
      });
    } else if (role === "student") {
      links.push({
        to: "/student",
        label: "Student space",
        match: (pathname) => pathname.startsWith("/student"),
      });
    } else if (role === "admin") {
      links.push({
        to: "/admin",
        label: "Admin panel",
        match: (pathname) => pathname.startsWith("/admin"),
      });
    }

    return links;
  }, [role, studentTrack, session?.user?.yearGroup]);

  const handleSignOut = useCallback(() => {
    clear();
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [clear, navigate, location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const menuItems = useMemo(() => {
    if (!role) return [];
    const items = [];
    if (dashboardLink) {
      items.push({ type: "link", to: dashboardLink, label: "My dashboard" });
    }
    items.push({ type: "link", to: "/account", label: "My account" });
    items.push({ type: "action", label: "Log out", onClick: handleSignOut });
    return items;
  }, [role, dashboardLink, handleSignOut]);

  const handleAccountBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setMenuOpen(false);
    }
  };

  const isAuthenticated = ready && Boolean(role);

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-header__content">
          <Link to={isAuthenticated ? "/curriculum" : "/"} className="layout-brand" aria-label="Computer Science Department home">
            <img src={logo} alt="School crest" className="layout-brand__mark" />
            <div className="layout-brand__text">
              <span className="layout-brand__title">Computer Science Department</span>
              <small className="layout-brand__subtitle">St Georges British International Schools Group Germany</small>
            </div>
          </Link>

          {isAuthenticated && (
            <nav className="layout-nav" aria-label="Primary navigation">
              {navigationLinks.map((link) => {
                const isActive = link.match ? link.match(location.pathname) : location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`layout-nav__link ${isActive ? "is-active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="layout-actions">
            {ready && !isAuthenticated && (
              <Link to="/" className="layout-login-link">
                Log in
              </Link>
            )}

            {ready && isAuthenticated && (
              <div className="layout-account" onBlur={handleAccountBlur}>
                <button
                  type="button"
                  className="layout-account__button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="layout-account__avatar" aria-hidden="true">
                    {initials}
                  </span>
                  <span className="layout-account__greeting">{greetingName ? `Hi, ${greetingName}` : "Account"}</span>
                  <svg className="layout-account__chevron" viewBox="0 0 12 8" aria-hidden="true">
                    <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="layout-account__menu" role="menu">
                    {menuItems.map((item) =>
                      item.type === "link" ? (
                        <Link key={item.label} to={item.to} role="menuitem">
                          {item.label}
                        </Link>
                      ) : (
                        <button key={item.label} type="button" onClick={item.onClick} role="menuitem">
                          {item.label}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
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
