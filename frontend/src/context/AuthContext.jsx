import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/authApi.js';
import { tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get())); // persistent login: restore session on load

  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi
      .me()
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => { tokenStore.clear(); setUser(null); };
    window.addEventListener('we:unauthorized', onUnauthorized);
    return () => window.removeEventListener('we:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (identifier, password) => {
    const d = await authApi.login(identifier, password);
    tokenStore.set(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async (payload) => {
    const d = await authApi.register(payload);
    tokenStore.set(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* token is discarded either way */ }
    tokenStore.clear();
    setUser(null);
  }, []);

  // Re-read XP / streak after any learning activity.
  const refreshUser = useCallback(async () => {
    try { setUser((await authApi.me()).user); } catch { /* ignore */ }
  }, []);

  const value = useMemo(() => ({ user, setUser, loading, login, register, logout, refreshUser }), [user, loading, login, register, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
