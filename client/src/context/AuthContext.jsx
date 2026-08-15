import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import customerAxios from '../api/customerAxios';
import { setCustomerAccessToken } from '../api/tokenStore';
import useSessionGuard from '../hooks/useSessionGuard';
import { useAuthTransition } from './AuthTransitionContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { runWithAuthLoader } = useAuthTransition() || {};

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await customerAxios.get('/auth/me');
      setUser(data.data.customer);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const runner = runWithAuthLoader || ((fn) => fn());
    return runner(async () => {
      const { data } = await customerAxios.post('/auth/login', { email, password });
      setCustomerAccessToken(data.data.accessToken);
      setUser(data.data.customer);
      return data;
    });
  };

  const register = async (payload) => {
    const runner = runWithAuthLoader || ((fn) => fn());
    return runner(async () => {
      const { data } = await customerAxios.post('/auth/register', payload);
      setCustomerAccessToken(data.data.accessToken);
      setUser(data.data.customer);
      return data;
    });
  };

  const logout = async () => {
    const runner = runWithAuthLoader || ((fn) => fn());
    return runner(async () => {
      try {
        await customerAxios.post('/auth/logout');
      } finally {
        setCustomerAccessToken(null);
        setUser(null);
      }
    });
  };

  const forgotPassword = async (email) => {
    const { data } = await customerAxios.post('/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (token, password, confirmPassword) => {
    const { data } = await customerAxios.post(`/auth/reset-password/${token}`, { password, confirmPassword });
    return data;
  };

  const updateUser = (patch) => setUser((prev) => (prev ? { ...prev, ...patch } : prev));

  // Security: auto-logout after 10 minutes of inactivity, or shortly after
  // the tab is minimized/backgrounded and stays that way. A page refresh
  // does NOT log the customer out - the session persists via the httpOnly
  // refresh cookie, restored by fetchMe() above.
  useSessionGuard({ isAuthenticated: !!user, onLogout: logout, inactivityMinutes: 10 });

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, resetPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
