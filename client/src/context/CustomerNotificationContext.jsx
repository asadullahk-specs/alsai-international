import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import customerAxios from '../api/customerAxios';
import { useAuth } from './AuthContext';

const CustomerNotificationContext = createContext(null);

const POLL_INTERVAL_MS = 30000;

export const CustomerNotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Shared by the notification bell dropdown and the full "My Notifications"
  // page, so both stay in sync off a single fetch instead of polling twice.
  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await customerAxios.get('/notifications');
      setUnreadCount(data.data.unreadCount);
      setNotifications(data.data.notifications);
    } catch {
      // Silently skip - the bell badge just won't update this cycle.
    }
  }, [user]);

  const markAsRead = useCallback(
    async (id) => {
      await customerAxios.patch(`/notifications/${id}/read`);
      await refresh();
    },
    [refresh]
  );

  const markAllAsRead = useCallback(async () => {
    await customerAxios.patch('/notifications/read-all');
    await refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return undefined;
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, refresh]);

  return (
    <CustomerNotificationContext.Provider
      value={{ unreadCount, notifications, refresh, markAsRead, markAllAsRead }}
    >
      {children}
    </CustomerNotificationContext.Provider>
  );
};

export const useCustomerNotifications = () => useContext(CustomerNotificationContext);
