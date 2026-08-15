import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCustomerNotifications } from '../context/CustomerNotificationContext';

// A small dropdown panel, opened right below the bell icon - the same
// pattern YouTube uses. It never navigates to the login page: logged out it
// just shows a friendly message inside the panel, and logged in it shows the
// real notification list right there without leaving the current page.
//
// variant="icon" (default) - icon-only trigger, used in the desktop header row.
// variant="row" - a full-width labelled row, used inside the mobile slide-in
// menu, where an icon-only absolute dropdown wouldn't read well.
const NotificationBell = ({ variant = 'icon' }) => {
  const { user } = useAuth();
  const { unreadCount, notifications, refresh, markAsRead, markAllAsRead } = useCustomerNotifications() || {};
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next && user) refresh?.();
      return next;
    });
  };

  const handleOpenNotification = async (n) => {
    if (!n.isRead) await markAsRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const isRow = variant === 'row';

  return (
    <div className={isRow ? 'relative' : 'relative h-full flex items-center'} ref={wrapperRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className={
          isRow
            ? 'flex items-center gap-3 py-2.5 tracking-wide w-full text-left'
            : 'relative flex items-center justify-center hover:text-brand transition-colors'
        }
      >
        <FiBell size={isRow ? 16 : 18} />
        {isRow && 'NOTIFICATIONS'}
        {user && unreadCount > 0 && (
          <span
            className={
              isRow
                ? 'bg-brand text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1'
                : 'absolute -top-2 -right-2 bg-brand text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center'
            }
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`${isRow ? 'relative mt-2 w-full' : 'absolute right-0 top-full'
            } max-w-[90vw] bg-white border border-cream-200 rounded-md shadow-xl z-50 overflow-hidden ${isRow ? '' : 'w-80'}`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200">
            <span className="text-sm font-medium text-ink">Notifications</span>
            {user && notifications?.some((n) => !n.isRead) && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs text-brand hover:underline flex items-center gap-1"
              >
                <FiCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!user ? (
              <p className="text-sm text-muted text-center py-8 px-4">
                Log in to your account to see your notifications.
              </p>
            ) : (notifications?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted text-center py-8 px-4">You're all caught up.</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  type="button"
                  key={n._id}
                  onClick={() => handleOpenNotification(n)}
                  className={`w-full text-left flex items-start gap-2.5 px-4 py-3 border-b border-cream-100 last:border-0 hover:bg-cream-50 transition-colors ${n.isRead ? '' : 'bg-brand/5'
                    }`}
                >
                  {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{n.title}</p>
                    {n.message && <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>}
                    <p className="text-[11px] text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {user && (notifications?.length ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="block w-full text-center text-xs text-brand hover:underline py-3 border-t border-cream-200"
            >
              View All
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;