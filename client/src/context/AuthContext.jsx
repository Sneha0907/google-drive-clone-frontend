import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);
export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const login = (t) => { setToken(t); localStorage.setItem("token", t); };
  const logout = () => { setToken(""); localStorage.removeItem("token"); };

  const value = useMemo(() => ({ token, login, logout }), [token]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
