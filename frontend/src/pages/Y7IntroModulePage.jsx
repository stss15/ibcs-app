import { useLocation } from "react-router-dom";
import GamifiedModulePage from "../components/GamifiedModulePage.jsx";
import { GamificationProvider } from "../context/GamificationContext.jsx";
import unit from "../content/y7IntroductionComputing.jsx";

function Y7IntroModulePage() {
  const location = useLocation();
  const classId = location.state?.classId;

  return (
    <GamificationProvider>
      <GamifiedModulePage unit={unit} classId={classId} />
    </GamificationProvider>
  );
}

export default Y7IntroModulePage;


