import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import TeacherDashboardPage from './pages/TeacherDashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import Layout from './components/Layout.jsx';
import { useSession } from './hooks/useSession.js';

function roleToHome(role) {
  if (role === 'teacher') return '/dashboard';
  if (role === 'admin') return '/admin';
  return null;
}

function LandingRoute() {
  const { session, ready } = useSession();
  if (!ready) return null;
  const role = session?.user?.role ?? null;
  const destination = roleToHome(role);
  if (destination) {
    return <Navigate to={destination} replace />;
  }
  return <LoginPage />;
}

function RequireAuth({ children, roles }) {
  const { session, ready } = useSession();
  const location = useLocation();
  if (!ready) return null;
  const role = session?.user?.role ?? null;
  if (!role) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(role)) {
    const fallback = roleToHome(role) ?? '/';
    return <Navigate to={fallback} replace />;
  }
  return children;
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth roles={[ 'teacher' ]}>
              <TeacherDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth roles={[ 'admin' ]}>
              <AdminDashboardPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
