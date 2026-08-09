import { useState, useEffect, useCallback } from 'react';
import { FiBell, FiShoppingBag, FiAlertTriangle, FiStar, FiShield, FiCheck, FiTrash2 } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import Pagination from '../../components/common/Pagination';
import { useAdminNotifications } from '../../../context/AdminNotificationContext';

const TABS = [
  { key: 'all', label: 'All Notifications' },
  { key: 'unread', label: 'Unread', status: 'unread' },
];

const TYPE_META = {
  new_order: { icon: FiShoppingBag, label: 'New Order' },
  order_cancelled: { icon: FiShoppingBag, label: 'Order Cancelled' },
  low_stock: { icon: FiAlertTriangle, label: 'Low Stock' },
  out_of_stock: { icon: FiAlertTriangle, label: 'Out of Stock' },
  new_review: { icon: FiStar, label: 'New Review' },
  contact_message: { icon: FiBell, label: 'Contact Message' },
  new_registration: { icon: FiShield, label: 'New Registration' },
};

const NotificationsPage = () => {
  const { refresh } = useAdminNotifications();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (filter === 'unread') params.status = 'unread';
    adminAxios
      .get('/notifications', { params })
      .then(({ data }) => {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [filter, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    await adminAxios.put(`/notifications/${id}/read`);
    fetchNotifications();
    refresh();
  };

  const markAllRead = async () => {
    await adminAxios.put('/notifications/mark-all-read');
    fetchNotifications();
    refresh();
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all notifications? This cannot be undone.')) return;
    await adminAxios.delete('/notifications/clear-all');
    fetchNotifications();
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between max-640:flex-col max-640:items-stretch mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-2xl text-ink">Notifications</h1>
        <div className="flex items-center gap-2 max-640:flex-col max-640:items-stretch max-640:w-full">
          <button type="button" onClick={markAllRead} className="flex items-center gap-1.5 border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 hover:border-ink max-640:justify-center">
            <FiCheck size={14} /> MARK ALL AS READ
          </button>
          <button type="button" onClick={clearAll} className="flex items-center gap-1.5 border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 hover:border-ink max-640:justify-center">
            <FiTrash2 size={14} /> CLEAR ALL
          </button>
        </div>
      </div>

      <div className="mb-6 max-w-xs">
        <StatCard icon={FiBell} label="Unread" value={unreadCount} tone="brand" />
      </div>

      <div className="bg-white border border-cream-200">
        <div className="flex items-center gap-2 px-4 pt-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setFilter(t.key);
                setPage(1);
              }}
              className={`px-3 py-2 text-xs tracking-wide whitespace-nowrap border-b-2 transition-colors ${
                filter === t.key ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No notifications.</p>
        ) : (
          <div className="divide-y divide-cream-100">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || { icon: FiBell, label: n.type };
              const Icon = meta.icon;
              return (
                <button
                  type="button"
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`w-full text-left flex items-start gap-3 p-4 hover:bg-cream-50 ${!n.isRead ? 'bg-brand/5' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-brand flex-shrink-0">
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm ${!n.isRead ? 'text-ink font-medium' : 'text-muted'}`}>{n.title}</p>
                      <span className="text-xs text-muted flex-shrink-0">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{n.message}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-2" />}
                </button>
              );
            })}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default NotificationsPage;
