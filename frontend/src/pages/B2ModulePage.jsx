import { useLocation } from "react-router-dom";
import GamifiedModulePage from "../components/GamifiedModulePage.jsx";
import { GamificationProvider } from "../context/GamificationContext.jsx";
import unit from "../content/b2ProgrammingFundamentals.jsx";
import "./B2ModulePage.css";

function B2ModulePage() {
  const location = useLocation();
  const classId = location.state?.classId;
  return (
    <GamificationProvider>
      <GamifiedModulePage unit={unit} classId={classId} />
    </GamificationProvider>
  );
}

export default B2ModulePage;


