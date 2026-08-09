import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import adminAxios from '../api/adminAxios';
import { useAdminAuth } from './AdminAuthContext';

const AdminNotificationContext = createContext(null);

const POLL_INTERVAL_MS = 30000;

export const AdminNotificationProvider = ({ children }) => {
  const { admin } = useAdminAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState([]);

  const refresh = useCallback(async () => {
    if (!admin) return;
    try {
      const { data } = await adminAxios.get('/notifications', { params: { limit: 6 } });
      setUnreadCount(data.data.unreadCount);
      setLatest(data.data.notifications);
    } catch {
      // Silently skip - the header bell just won't update this cycle.
    }
  }, [admin]);

  useEffect(() => {
    if (!admin) {
      setUnreadCount(0);
      setLatest([]);
      return undefined;
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [admin, refresh]);

  return (
    <AdminNotificationContext.Provider value={{ unreadCount, latest, refresh }}>
      {children}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = () => useContext(AdminNotificationContext);
