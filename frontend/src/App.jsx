import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import TeacherDashboardPage from "./pages/TeacherDashboardPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";
import CurriculumMapPage from "./pages/CurriculumMapPage.jsx";
import IBCurriculumPage from "./pages/IBCurriculumPage.jsx";
import TopicPage from "./pages/TopicPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import Layout from "./components/Layout.jsx";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher" element={<Navigate to="/dashboard" replace />} />
        <Route path="/student" element={<StudentDashboardPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/curriculum" element={<CurriculumMapPage />} />
        <Route path="/curriculum/ib" element={<IBCurriculumPage />} />
        <Route path="/topic/:id" element={<TopicPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
