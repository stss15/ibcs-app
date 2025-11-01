const STORAGE_KEY = "ibcs.session";

/**
 * @typedef {"teacher" | "student"} Role
 */

/**
 * @typedef {Object} Session
 * @property {Role} role
 * @property {string} token
 * @property {number=} expiresAt
 */

/**
 * @param {Session} session
 */
export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn("Failed to persist session", error);
  }
}

/**
 * @returns {Session | null}
 */
export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse session", error);
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear session", error);
  }
}
