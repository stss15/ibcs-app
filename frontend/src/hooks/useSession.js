import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { verify } from "../lib/api.js";

const STORAGE_KEY = "ibcs.session";
const SessionContext = createContext(null);

function readSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.token && parsed.user) {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to read session", error);
  }
  return null;
}

function writeSession(value) {
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Failed to persist session", error);
  }
}

export function SessionProvider({ children }) {
  const [session, setSessionState] = useState(() => readSession());
  const [ready, setReady] = useState(false);

  const mergeUsers = useCallback((prevUser = {}, nextUser = {}) => {
    return {
      ...prevUser,
      ...nextUser,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      if (!session?.token) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const data = await verify(session.token);
        if (cancelled) return;
        if (data?.valid && data.user) {
          setSessionState((prev) => {
            if (!prev) return prev;
            const mergedUser = mergeUsers(prev.user, data.user);
            const nextSession = {
              token: prev.token,
              user: mergedUser,
            };
            writeSession(nextSession);
            return nextSession;
          });
        } else {
          writeSession(null);
          setSessionState(null);
        }
      } catch (error) {
        console.warn("Session verification failed", error);
        if (!cancelled) {
          writeSession(null);
          setSessionState(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [mergeUsers, session?.token]);

  const setSession = useCallback(
    (value) => {
      if (value && value.user) {
        value = {
          token: value.token,
          user: { ...value.user },
        };
      }
      writeSession(value);
      setSessionState(value);
    },
    [setSessionState],
  );

  const clear = useCallback(() => {
    writeSession(null);
    setSessionState(null);
  }, [setSessionState]);

  const contextValue = useMemo(
    () => ({
      session,
      setSession,
      clear,
      ready,
    }),
    [session, setSession, clear, ready],
  );

  return createElement(SessionContext.Provider, { value: contextValue }, children);
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
