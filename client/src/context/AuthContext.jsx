
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "token";

const AuthCtx = createContext(null);

export function useAuth() {
  return useContext(AuthCtx);
}

export default function AuthProvider({ children }) {

  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [initializing, setInitializing] = useState(true);

  
  useEffect(() => {
    setInitializing(false);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setToken(e.newValue || "");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (t) => {
    setToken(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem(STORAGE_KEY);
  };


  const authHeader = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const value = useMemo(
    () => ({ token, login, logout, initializing, authHeader }),
    [token, initializing]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
