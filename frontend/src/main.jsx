import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { SessionProvider } from "./hooks/useSession.js";
import { GamificationProvider } from "./context/GamificationContext.jsx";
import "./styles/global.css";

const basename = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SessionProvider>
      <GamificationProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </GamificationProvider>
    </SessionProvider>
  </React.StrictMode>,
);
