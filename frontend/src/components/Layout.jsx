import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession.js';
import logo from '../assets/logo.svg';
import './Layout.css';

function Layout({ children }) {
  const { session, ready, clear } = useSession();
  const navigate = useNavigate();
  const role = session?.user?.role ?? null;
  const displayName = (session?.user?.displayName || session?.user?.username || '').trim();
  const initials = useMemo(() => {
    if (!displayName) return 'CS';
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'CS';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  const handleSignOut = () => {
    clear();
    navigate('/', { replace: true });
  };

  const dashboardLink = role === 'teacher' ? '/dashboard' : role === 'admin' ? '/admin' : '/';

  return (
    <div className="layout-root">
      <header className="layout-topbar">
        <div className="layout-topbar__container">
          <Link to={dashboardLink} className="layout-brand" aria-label="IBCS home">
            <img src={logo} alt="School crest" className="layout-brand__mark" />
            <div className="layout-brand__text">
              <strong className="layout-brand__title">Computer Science Department</strong>
              <span className="layout-brand__subtitle">St. George&apos;s British International School</span>
            </div>
          </Link>
          <div className="layout-topbar__actions">
            {ready && !role && (
              <Link to="/" className="layout-login-link">
                LOG IN
              </Link>
            )}
            {ready && role && (
              <div className="layout-account">
                <span className="layout-account__avatar" aria-hidden="true">
                  {initials}
                </span>
                <div className="layout-account__details">
                  <span>{displayName || 'Signed in'}</span>
                  <small>{role === 'admin' ? 'Admin' : 'Teacher'}</small>
                </div>
                <button type="button" className="layout-account__logout" onClick={handleSignOut}>
                  LOG OUT
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        <div className="layout-footer__container">
        <small>© {new Date().getFullYear()} St. George&apos;s British International School - Computer Science Department</small>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
