import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ibcs.session";

function readSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to read session", error);
    return null;
  }
}

export function useSession() {
  const [session, setSessionState] = useState(() => readSession());

  useEffect(() => {
    try {
      if (session) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn("Failed to persist session", error);
    }
  }, [session]);

  const setSession = useCallback((value) => {
    setSessionState(value);
  }, []);

  const clear = useCallback(() => setSessionState(null), []);

  return { session, setSession, clear };
}
