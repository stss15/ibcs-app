import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const apiBase = env.VITE_API_BASE || env.API_BASE || "";
  return defineConfig({
    base: "/ibcs-app/",
    plugins: [react()],
    define: {
      __API_BASE__: JSON.stringify(apiBase),
      __INSTANT_APP_ID__: JSON.stringify(env.INSTANT_APP_ID || ""),
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            router: ["react-router-dom"],
            dndkit: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
            sandpack: ["@codesandbox/sandpack-react"],
            skulpt: ["skulpt"],
            motion: ["framer-motion"],
          },
        },
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  });
};
