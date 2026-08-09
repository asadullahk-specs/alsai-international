import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { useCustomerNotifications } from '../../context/CustomerNotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications = [], refresh, markAsRead, markAllAsRead } = useCustomerNotifications() || {};

  useEffect(() => {
    refresh?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleOpen = async (n) => {
    if (!n.isRead) {
      await markAsRead(n._id);
    }
    if (n.link) navigate(n.link);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between max-480:flex-col max-480:items-start mb-6 gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">Notifications</h1>
          <p className="text-sm text-muted">Stay updated on your orders and account activity.</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs text-brand hover:underline flex items-center gap-1 flex-shrink-0 max-480:self-end"
          >
            <FiCheck size={13} /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-muted py-10 text-center">You're all caught up.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              type="button"
              key={n._id}
              onClick={() => handleOpen(n)}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-md border transition-colors ${
                n.isRead ? 'border-cream-200 bg-white' : 'border-brand/30 bg-brand/5'
              }`}
            >
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand mt-1.5 flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-sm text-ink">{n.title}</p>
                {n.message && <p className="text-xs text-muted mt-0.5">{n.message}</p>}
                <p className="text-xs text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
