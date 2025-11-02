import { useCallback, useEffect, useState } from "react";
import { verify } from "../lib/api.js";

const STORAGE_KEY = "ibcs.session";

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

export function useSession() {
  const [session, setSessionState] = useState(() => readSession());
  const [ready, setReady] = useState(false);

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
            const nextSession = {
              token: prev.token,
              user: {
                username: data.user.username ?? prev.user?.username,
                role: data.user.role ?? prev.user?.role,
                classId: data.user.classId ?? prev.user?.classId ?? null,
                displayName: data.user.displayName ?? prev.user?.displayName ?? null,
              },
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
  }, [session?.token]);

  const setSession = useCallback((value) => {
    writeSession(value);
    setSessionState(value);
  }, []);

  const clear = useCallback(() => {
    writeSession(null);
    setSessionState(null);
  }, []);

  return { session, setSession, clear, ready };
}
