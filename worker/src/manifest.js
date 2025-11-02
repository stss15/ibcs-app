let manifest;

const isNodeRuntime =
  typeof process !== "undefined" && process.release?.name === "node" && typeof WebSocketPair === "undefined";

if (isNodeRuntime) {
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const manifestPath = resolve(currentDir, "../../curriculum/manifest.json");
  manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
} else {
  const data = await import("../../curriculum/manifest.json", {
    assert: { type: "json" },
  });
  manifest = data.default ?? data;
}

export default manifest;

