import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import TeacherDashboardPage from "./pages/TeacherDashboardPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";
import TopicPage from "./pages/TopicPage.jsx";
import Layout from "./components/Layout.jsx";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/teacher" element={<TeacherDashboardPage />} />
        <Route path="/student" element={<StudentDashboardPage />} />
        <Route path="/topic/:id" element={<TopicPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
