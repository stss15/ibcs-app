const LEGACY_SUFFIX = ".progress";

function sanitize(value, fallback) {
  if (!value) return fallback;
  return String(value).toLowerCase().replace(/[^a-z0-9.-]/g, "-") || fallback;
}

export function progressStorageKey(unitId, username) {
  const safeUnit = sanitize(unitId, "unit");
  const safeUser = sanitize(username, "guest");
  return `ibcs.${safeUnit}.${safeUser}${LEGACY_SUFFIX}`;
}

export function legacyProgressKey(unitId) {
  const safeUnit = sanitize(unitId, "unit");
  return `ibcs.${safeUnit}${LEGACY_SUFFIX}`;
}

export function readUnitProgress(unitId, username) {
  if (typeof window === "undefined") return { data: null, key: null, migrated: false };
  const scopedKey = progressStorageKey(unitId, username);
  try {
    const raw = window.localStorage.getItem(scopedKey);
    if (raw) {
      return { data: JSON.parse(raw), key: scopedKey, migrated: true };
    }
  } catch (error) {
    console.warn("Unable to parse scoped progress", scopedKey, error);
  }

  const legacyKey = legacyProgressKey(unitId);
  try {
    const legacyRaw = window.localStorage.getItem(legacyKey);
    if (legacyRaw) {
      return { data: JSON.parse(legacyRaw), key: legacyKey, migrated: false };
    }
  } catch (error) {
    console.warn("Unable to parse legacy progress", legacyKey, error);
  }

  return { data: null, key: scopedKey, migrated: true };
}

export function writeUnitProgress(unitId, username, state) {
  if (typeof window === "undefined") return;
  const key = progressStorageKey(unitId, username);
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn("Unable to persist progress", key, error);
  }

  // const legacyKey = legacyProgressKey(unitId);
  // if (legacyKey !== key) {
  //   try {
  //     window.localStorage.removeItem(legacyKey);
  //   } catch {
  //     // ignore removal failures
  //   }
  // }
}

export function clearUnitProgress(unitId, username) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(progressStorageKey(unitId, username));
  } catch {
    // ignore removal failures
  }
}

