import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!getToken()) {
      setUser(null);
      setBusiness(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api("/auth/me");
      setUser(data.user);
      setBusiness(data.business);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email, password, extraParams = {}) {
    const data = await api("/auth/login", { method: "POST", body: { email, password, ...extraParams } });
    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
    return data.user;
  }

  async function register(payload) {
    const data = await api("/auth/register", { method: "POST", body: payload });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    setBusiness(null);
  }

  return (
    <AuthContext.Provider value={{ user, business, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
