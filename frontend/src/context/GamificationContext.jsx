import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";

const LEGACY_STORAGE_KEY = "ibcs.gamification";

function sanitizeProfile(value) {
  if (!value) return "anonymous";
  return String(value).toLowerCase().replace(/[^a-z0-9.-]/g, "-") || "anonymous";
}

function storageKey(profileKey) {
  const safe = sanitizeProfile(profileKey);
  return `${LEGACY_STORAGE_KEY}.${safe}`;
}

function readStoredState(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to read gamification state", key, error);
  }
  return null;
}
const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  streak: 0,
  spritesUnlocked: [],
  totalCorrect: 0,
  totalAttempts: 0,
  lastUpdated: null,
};

const GamificationContext = createContext({
  state: DEFAULT_STATE,
  awardXp: () => {},
  resetStreak: () => {},
  updateFromRemote: () => {},
});

function computeLevel(xp) {
  if (!Number.isFinite(xp)) return 1;
  // Simple levelling curve: Level up every 150 XP, with diminishing returns.
  return Math.max(1, Math.floor(xp / 150) + 1);
}

function reducer(state, action) {
  switch (action.type) {
    case "hydrate": {
      const merged = { ...state, ...(action.payload || {}) };
      return {
        ...merged,
        level: computeLevel(merged.xp ?? 0),
      };
    }
    case "award": {
      const { xpGained, correct, attempts, spriteUnlocks = [] } = action.payload;
      const totalCorrect = (state.totalCorrect ?? 0) + (correct ?? 0);
      const totalAttempts = (state.totalAttempts ?? 0) + (attempts ?? 0);
      const xp = (state.xp ?? 0) + xpGained;
      const level = computeLevel(xp);
      const streak = xpGained > 0 && correct === attempts ? (state.streak ?? 0) + 1 : 0;
      const spritesUnlocked = Array.from(
        new Set([...(state.spritesUnlocked ?? []), ...spriteUnlocks.filter(Boolean)]),
      );
      return {
        xp,
        level,
        streak,
        spritesUnlocked,
        totalCorrect,
        totalAttempts,
        lastUpdated: Date.now(),
      };
    }
    case "reset-streak":
      return { ...state, streak: 0, lastUpdated: Date.now() };
    default:
      return state;
  }
}

export function GamificationProvider({ children, initialState, profileKey = "anonymous" }) {
  const normalizedProfile = sanitizeProfile(profileKey);

  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE, (defaultState) => {
    if (initialState) {
      return reducer(defaultState, { type: "hydrate", payload: initialState });
    }
    const stored = readStoredState(storageKey(normalizedProfile)) ?? readStoredState(LEGACY_STORAGE_KEY);
    if (stored) {
      return reducer(defaultState, { type: "hydrate", payload: stored });
    }
    return defaultState;
  });

  const profileRef = useRef(normalizedProfile);

  useEffect(() => {
    if (profileRef.current === normalizedProfile) {
      return;
    }
    const stored = readStoredState(storageKey(normalizedProfile)) ?? readStoredState(LEGACY_STORAGE_KEY);
    if (stored) {
      dispatch({ type: "hydrate", payload: stored });
    } else {
      dispatch({ type: "hydrate", payload: DEFAULT_STATE });
    }
    profileRef.current = normalizedProfile;
  }, [normalizedProfile]);

  useEffect(() => {
    const targetKey = storageKey(normalizedProfile);
    profileRef.current = normalizedProfile;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(targetKey, JSON.stringify(state));
        if (targetKey !== LEGACY_STORAGE_KEY) {
          window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      } catch (error) {
        console.warn("Failed to persist gamification state", error);
      }
    }
  }, [state, normalizedProfile]);

  const awardXp = useCallback((payload) => {
    dispatch({ type: "award", payload });
  }, []);

  const resetStreak = useCallback(() => {
    dispatch({ type: "reset-streak" });
  }, []);

  const updateFromRemote = useCallback((payload) => {
    dispatch({ type: "hydrate", payload });
  }, []);

  const value = useMemo(
    () => ({
      state,
      awardXp,
      resetStreak,
      updateFromRemote,
    }),
    [state, awardXp, resetStreak, updateFromRemote],
  );

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamification() {
  return useContext(GamificationContext);
}

