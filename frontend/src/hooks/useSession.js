import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ibcs.token";

export function useSession() {
  const [token, setToken] = useState(() => window.localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [token]);

  const clear = useCallback(() => setToken(null), []);

  return { token, setToken, clear };
}
