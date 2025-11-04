import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import TeacherDashboardPage from "./pages/TeacherDashboardPage.jsx";
import TeacherStudentDashboardPage from "./pages/TeacherStudentDashboardPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";
import CurriculumMapPage from "./pages/CurriculumMapPage.jsx";
import IBCurriculumPage from "./pages/IBCurriculumPage.jsx";
import IGCSECurriculumPage from "./pages/IGCSECurriculumPage.jsx";
import TopicPage from "./pages/TopicPage.jsx";
import LessonPage from "./pages/LessonPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import Layout from "./components/Layout.jsx";
import B1ModulePage from "./pages/B1ModulePage.jsx";
import B2ModulePage from "./pages/B2ModulePage.jsx";
import Year7MapPage from "./pages/Year7MapPage.jsx";
import Year7LiveSessionPage from "./pages/Year7LiveSessionPage.jsx";
import { useSession } from "./hooks/useSession.js";
import { TeacherModeProvider } from "./context/TeacherModeContext.jsx";

function roleToHome(role) {
  if (role === "teacher") return "/dashboard";
  if (role === "student") return "/student";
  if (role === "admin") return "/admin";
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

  if (!ready) {
    return null;
  }

  const role = session?.user?.role ?? null;

  if (!role) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(role)) {
    const fallback = roleToHome(role) ?? "/";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

function App() {
  return (
    <Layout>
      <TeacherModeProvider>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth roles={["teacher"]}>
                <TeacherDashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/student/:studentId"
            element={
              <RequireAuth roles={["teacher"]}>
                <TeacherStudentDashboardPage />
              </RequireAuth>
            }
          />
          <Route path="/teacher" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/student"
            element={
              <RequireAuth roles={["student"]}>
                <StudentDashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth roles={["admin"]}>
                <AdminDashboardPage />
              </RequireAuth>
            }
          />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            }
          />
          <Route
            path="/curriculum"
            element={
              <RequireAuth>
                <CurriculumMapPage />
              </RequireAuth>
            }
          />
          <Route
            path="/curriculum/ib"
            element={
              <RequireAuth>
                <IBCurriculumPage />
              </RequireAuth>
            }
          />
          <Route
            path="/curriculum/igcse"
            element={
              <RequireAuth>
                <IGCSECurriculumPage />
              </RequireAuth>
            }
          />
          <Route
            path="/curriculum/year7"
            element={
              <RequireAuth>
                <Year7MapPage />
              </RequireAuth>
            }
          />
          <Route
            path="/curriculum/year7/live"
            element={
              <RequireAuth>
                <Year7LiveSessionPage />
              </RequireAuth>
            }
          />
          <Route
            path="/curriculum/ib/b1"
            element={
              <RequireAuth>
                <B1ModulePage />
              </RequireAuth>
            }
          />
          <Route
            path="/curriculum/ib/b2"
            element={
              <RequireAuth>
                <B2ModulePage />
              </RequireAuth>
            }
          />
          <Route
            path="/topic/:id"
            element={
              <RequireAuth>
                <TopicPage />
              </RequireAuth>
            }
          />
          <Route
            path="/lesson/:lessonId"
            element={
              <RequireAuth>
                <LessonPage />
              </RequireAuth>
            }
          />
        </Routes>
      </TeacherModeProvider>
    </Layout>
  );
}

export default App;
