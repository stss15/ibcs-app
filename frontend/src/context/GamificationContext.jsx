import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

const STORAGE_KEY = "ibcs.gamification";
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

export function GamificationProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE, (defaultState) => {
    if (initialState) {
      return reducer(defaultState, { type: "hydrate", payload: initialState });
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState;
      const parsed = JSON.parse(raw);
      return reducer(defaultState, { type: "hydrate", payload: parsed });
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage failures.
    }
  }, [state]);

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

