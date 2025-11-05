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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

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

  const navSections = useMemo(() => {
    if (!role) return [];

    const sections = new Map();
    const ensureSection = (key, title) => {
      if (!sections.has(key)) {
        sections.set(key, { id: key, title, items: [] });
      }
      return sections.get(key);
    };

    const overview = ensureSection("overview", "Curriculum");
    overview.items.push({
      id: "curriculum-overview",
      to: "/curriculum",
      label: "Curriculum overview",
      match: (pathname) => pathname === "/curriculum",
    });

    const allowYear7Link =
      role === "teacher" ||
      role === "admin" ||
      studentTrack.startsWith("ks3") ||
      (session?.user?.yearGroup ?? "").toLowerCase().includes("year 7");

    if (allowYear7Link) {
      overview.items.push({
        id: "year7-map",
        to: "/curriculum/year7",
        label: "Year 7 map",
        match: (pathname) => pathname.startsWith("/curriculum/year7"),
      });
    }

    const allowIbLink = role === "teacher" || role === "admin" || studentTrack.startsWith("ib");
    if (allowIbLink) {
      overview.items.push({
        id: "ib-map",
        to: "/curriculum/ib",
        label: "IB curriculum map",
        match: (pathname) =>
          pathname.startsWith("/curriculum/ib") || pathname.startsWith("/topic") || pathname.startsWith("/lesson"),
      });
    }

    if (role === "teacher" || role === "admin") {
      const dashboards = ensureSection("dashboards", "Dashboards");
      dashboards.items.push({
        id: "teacher-dashboard",
        to: "/dashboard",
        label: "Teacher dashboard",
        match: (pathname) => pathname.startsWith("/dashboard"),
      });
    }

    if (role === "student") {
      const studentSection = ensureSection("student", "My learning");
      studentSection.items.push({
        id: "student-space",
        to: "/student",
        label: "Student space",
        match: (pathname) => pathname.startsWith("/student"),
      });
    }

    if (role === "admin") {
      const adminSection = ensureSection("admin", "Admin");
      adminSection.items.push({
        id: "admin-panel",
        to: "/admin",
        label: "Admin panel",
        match: (pathname) => pathname.startsWith("/admin"),
      });
    }

    return Array.from(sections.values()).filter((section) => section.items.length > 0);
  }, [role, studentTrack, session?.user?.yearGroup]);

  const handleSignOut = useCallback(() => {
    clear();
    setMenuOpen(false);
    setSidebarMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [clear, navigate, location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setSidebarMobileOpen(false);
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
    <div
      className={`layout-root${sidebarCollapsed ? " layout-root--collapsed" : ""}${sidebarMobileOpen ? " layout-root--nav-open" : ""}`}
    >
      {isAuthenticated && (
        <>
          <aside className="layout-sidebar" aria-label="Primary navigation">
            <div className="layout-sidebar__header">
              <Link to="/curriculum" className="layout-brand" aria-label="Computer Science Department home">
                <img src={logo} alt="School crest" className="layout-brand__mark" />
                <div className="layout-brand__text">
                  <span className="layout-brand__title">Computer Science Department</span>
                  <small className="layout-brand__subtitle">St Georges British International Schools Group Germany</small>
                </div>
              </Link>
              <button
                type="button"
                className="layout-sidebar__collapse"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-pressed={sidebarCollapsed}
                aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              >
                <span aria-hidden="true" />
              </button>
            </div>
            <div className="layout-sidebar__sections">
              {navSections.map((section) => (
                <div key={section.id} className="layout-sidebar__section">
                  <p className="layout-sidebar__section-title">{section.title}</p>
                  <nav>
                    {section.items.map((item) => {
                      const isActive = item.match ? item.match(location.pathname) : location.pathname === item.to;
                      return (
                        <Link
                          key={item.id}
                          to={item.to}
                          className={`layout-sidebar__nav-item ${isActive ? "is-active" : ""}`}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setSidebarMobileOpen(false)}
                        >
                          <span className="layout-sidebar__nav-bullet" aria-hidden="true">
                            {item.label.charAt(0)}
                          </span>
                          <span className="layout-sidebar__nav-text">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
            <div className="layout-sidebar__footer">
              <div className="layout-sidebar__user">
                <span className="layout-sidebar__avatar" aria-hidden="true">
                  {initials}
                </span>
                <div className="layout-sidebar__user-meta">
                  <strong>{displayName || "Account"}</strong>
                  <span className="text-muted">{role ?? ""}</span>
                </div>
              </div>
              <button type="button" className="layout-sidebar__signout" onClick={handleSignOut}>
                Log out
              </button>
            </div>
          </aside>
          <button
            type="button"
            className="layout-sidebar__scrim"
            aria-hidden={!sidebarMobileOpen}
            onClick={() => setSidebarMobileOpen(false)}
          />
        </>
      )}

      <div className="layout-scaffold">
        <header className="layout-topbar">
          <div className="layout-topbar__left">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="layout-topbar__nav-toggle show-mobile"
                  onClick={() => setSidebarMobileOpen((prev) => !prev)}
                  aria-label={sidebarMobileOpen ? "Close navigation" : "Open navigation"}
                  aria-pressed={sidebarMobileOpen}
                >
                  <span />
                  <span />
                  <span />
                </button>
                <span className="layout-topbar__title">Computer Science Department</span>
              </>
            ) : (
              <Link to="/" className="layout-brand layout-brand--inline" aria-label="Computer Science Department home">
                <img src={logo} alt="School crest" className="layout-brand__mark" />
                <div className="layout-brand__text">
                  <span className="layout-brand__title">Computer Science Department</span>
                  <small className="layout-brand__subtitle">St Georges British International Schools Group Germany</small>
                </div>
              </Link>
            )}
          </div>

          <div className="layout-topbar__actions">
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
        </header>

        <main className="layout-main">{children}</main>

        <footer className="layout-footer">
          <small>© {new Date().getFullYear()} Computer Science Department · All curriculum in progress.</small>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
