import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../lib/api.js';
import { useSession } from '../hooks/useSession.js';
import FeedbackPanel from '../components/ui/FeedbackPanel.jsx';
import logo from '../assets/logo.svg';
import './LoginPage.css';

const initialState = { status: 'idle', message: '' };
const ROLES = [
  { id: 'teacher', label: 'Teacher' },
  { id: 'admin', label: 'Admin' },
];

function LoginPage() {
  const [role, setRole] = useState('teacher');
  const [status, setStatus] = useState(initialState);
  const { setSession } = useSession();
  const navigate = useNavigate();

  const roleLabel = ROLES.find((option) => option.id === role)?.label ?? 'Teacher';

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
      setStatus({ status: 'error', message: 'Enter username and password.' });
      return;
    }

    setStatus({ status: 'loading', message: `Signing in as ${roleLabel}…` });

    try {
      const response = await loginRequest({ role, username, password });
      if (!response?.token || !response?.user) {
        throw new Error('Unexpected login response');
      }
      setSession({ token: response.token, user: response.user });
      setStatus({ status: 'success', message: 'Signed in.' });
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (error) {
      setStatus({ status: 'error', message: error.message || 'Login failed' });
    }
  };

  return (
    <div className="login-container">
      <section className="login-card">
        <header className="login-card__header">
          <img src={logo} alt="School crest" className="login-card__logo" />
          <div>
            <h1>Computer Science Department</h1>
            <p className="muted">Admin console for teachers and site staff.</p>
          </div>
        </header>

        <div className="login-role">
          <span>Sign in as</span>
          <div className="login-role__toggle" role="group" aria-label="Choose account type">
            {ROLES.map((option) => (
              <button
                key={option.id}
                type="button"
                className={role === option.id ? 'active' : ''}
                onClick={() => {
                  setRole(option.id);
                  setStatus(initialState);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>Username</span>
            <input name="username" required autoComplete="username" />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button type="submit" className="login-submit" disabled={status.status === 'loading'}>
            {status.status === 'loading' ? 'Working…' : `Log in as ${roleLabel}`}
          </button>
          {status.message && (
            <FeedbackPanel tone={status.status === 'error' ? 'error' : status.status === 'success' ? 'success' : 'info'}>
              {status.message}
            </FeedbackPanel>
          )}
        </form>

        <footer className="login-footnote">
          <p className="muted">
            Admins manage teachers. Teachers create classes, add students, and unlock content when ready.
          </p>
        </footer>
      </section>
    </div>
  );
}

export default LoginPage;
