import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { SessionProvider, useSession } from "./hooks/useSession.js";
import { GamificationProvider } from "./context/GamificationContext.jsx";
import "./styles/global.css";

const basename = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function SessionAwareGamification({ children }) {
  const { session } = useSession();
  const profileKey = session?.user?.username?.toLowerCase() || "anonymous";
  return <GamificationProvider profileKey={profileKey}>{children}</GamificationProvider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SessionProvider>
      <SessionAwareGamification>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </SessionAwareGamification>
    </SessionProvider>
  </React.StrictMode>,
);
