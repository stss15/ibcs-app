const CONFIG_URL = `${import.meta.env.BASE_URL}app-config.json`;

let configPromise;

export async function loadConfig() {
  const inline = (import.meta.env.VITE_API_BASE || "").trim();
  if (inline) {
    return { apiBase: inline.replace(/\/$/, "") };
  }

  if (!configPromise) {
    configPromise = fetch(CONFIG_URL, { mode: "cors" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load app configuration");
        }
        return response.json();
      })
      .then((data) => {
        if (!data?.API_BASE) {
          throw new Error("Configuration missing API_BASE");
        }
        return {
          apiBase: data.API_BASE.replace(/\/$/, ""),
        };
      });
  }
  return configPromise;
}


