/**
 * Global configuration consumed by the static frontend.
 * Replace placeholder values before deploying.
 */
export const CONFIG = {
  instantAppId: "fa61cd0c-d77e-44e5-919d-90a90ead7039",
  workerBaseUrl: "https://ibcs-auth.stevengstewart25.workers.dev",
};

/**
 * Returns a fully qualified Worker endpoint for the provided path.
 * @param {string} path
 */
export function getWorkerUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${CONFIG.workerBaseUrl}${normalized}`;
}
