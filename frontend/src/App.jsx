import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import TeacherDashboardPage from "./pages/TeacherDashboardPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";
import TopicPage from "./pages/TopicPage.jsx";
import Layout from "./components/Layout.jsx";
import { runBootstrap } from "./lib/bootstrap.js";

function App() {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const seeded = await runBootstrap();
      if (seeded && !cancelled) {
        setNotice("Seeded demo teacher (MrStewart). Rotate token after demo.");
        setTimeout(() => {
          if (!cancelled) setNotice(null);
        }, 5000);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout notice={notice}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher" element={<Navigate to="/dashboard" replace />} />
        <Route path="/student" element={<StudentDashboardPage />} />
        <Route path="/topic/:id" element={<TopicPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
