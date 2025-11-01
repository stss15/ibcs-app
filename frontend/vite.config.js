import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    base: "/ibcs-app/",
    plugins: [react()],
    define: {
      __WORKER_BASE__: JSON.stringify(env.WORKER_BASE || ""),
      __INSTANT_APP_ID__: JSON.stringify(env.INSTANT_APP_ID || ""),
    },
    server: {
      port: 5173,
      open: true,
    },
  });
};
