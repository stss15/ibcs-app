import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import logo from "../assets/logo.svg";
import "./Layout.css";

function Layout({ children }) {
  const { session, clear } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const role = session?.user?.role ?? null;
  const firstName = session?.user?.firstName ?? null;
  const displayName = session?.user?.displayName ?? session?.user?.username ?? "";
  const greetingName = firstName || displayName;

  let navItems = [
    { to: "/", label: "Login" },
    { to: "/dashboard", label: "Teacher dashboard" },
    { to: "/student", label: "Student dashboard" },
    { to: "/curriculum", label: "Curriculum map" },
  ];

  if (role === "teacher") {
    navItems = [
      { to: "/dashboard", label: "Teacher dashboard" },
      { to: "/curriculum", label: "Curriculum map" },
    ];
  } else if (role === "student") {
    navItems = [
      { to: "/student", label: "Student dashboard" },
      { to: "/curriculum", label: "Curriculum map" },
    ];
  } else if (role === "admin") {
    navItems = [
      { to: "/admin", label: "Admin dashboard" },
      { to: "/curriculum", label: "Curriculum map" },
    ];
  }

  const handleSignOut = () => {
    clear();
    if (location.pathname !== "/") {
      navigate("/", { replace: true });
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
            {role && (
              <>
                <Link to="/account">My account</Link>
                <button type="button" className="layout-nav__logout" onClick={handleSignOut}>
                  Log out
                </button>
              </>
            )}
          </nav>

          {role && (
            <div className="layout-greeting">
              <span className="layout-greeting__hello">Hi{greetingName ? "," : ""}</span>
              {greetingName && <strong className="layout-greeting__name">{greetingName}</strong>}
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
