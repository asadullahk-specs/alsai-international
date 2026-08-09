import { createContext, useContext, useEffect, useState } from 'react';
import adminAxios from '../api/adminAxios';
import { setAdminAccessToken } from '../api/tokenStore';
import useSessionGuard from '../hooks/useSessionGuard';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Security: unlike the customer site, the admin panel does NOT restore a
    // session on page load. Any full page load - including a manual refresh
    // or reopening the tab - invalidates the previous session server-side
    // and requires the admin to sign in again. In-app navigation (React
    // Router) never remounts this provider, so normal use is unaffected.
    adminAxios
      .post('/auth/logout')
      .catch(() => {})
      .finally(() => {
        setAdminAccessToken(null);
        setAdmin(null);
        setLoading(false);
      });
  }, []);

  const login = async (email, password, rememberMe) => {
    const { data } = await adminAxios.post('/auth/login', { email, password, rememberMe });
    setAdminAccessToken(data.data.accessToken);
    setAdmin(data.data.admin);
    return data;
  };

  const logout = async () => {
    try {
      await adminAxios.post('/auth/logout');
    } finally {
      setAdminAccessToken(null);
      setAdmin(null);
    }
  };

  const forgotPassword = async (email) => {
    const { data } = await adminAxios.post('/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (token, password, confirmPassword) => {
    const { data } = await adminAxios.post(`/auth/reset-password/${token}`, { password, confirmPassword });
    return data;
  };

  // Security: admin sessions auto-logout after 10 minutes of inactivity (on
  // top of the refresh/reload logout enforced above). Switching tabs does
  // not by itself log the admin out - only real inactivity does.
  useSessionGuard({ isAuthenticated: !!admin, onLogout: logout, inactivityMinutes: 10 });

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, forgotPassword, resetPassword }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
