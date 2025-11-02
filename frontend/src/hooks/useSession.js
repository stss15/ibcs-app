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

export function useSession() {
  const [session, setSessionState] = useState(() => readSession());
  const [ready, setReady] = useState(false);

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
            return {
              token: prev.token,
              user: {
                username: data.user.username ?? prev.user?.username,
                role: data.user.role ?? prev.user?.role,
                classId: data.user.classId ?? prev.user?.classId ?? null,
                displayName: data.user.displayName ?? prev.user?.displayName ?? null,
              },
            };
          });
        } else {
          setSessionState(null);
        }
      } catch (error) {
        console.warn("Session verification failed", error);
        if (!cancelled) setSessionState(null);
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
    setSessionState(value);
  }, []);

  const clear = useCallback(() => setSessionState(null), []);

  return { session, setSession, clear, ready };
}
