import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FiMenu, FiSearch, FiBell, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminNotifications } from '../../context/AdminNotificationContext';
import adminAxios from '../../api/adminAxios';

// Every admin list page that has its own search box lives under one of these
// section paths. The header search is just a shortcut into whichever one of
// these the admin is currently viewing - it never sends you to a different
// tab than the one you're already on, and there's nothing to show at all on
// pages (like the Dashboard) that have no search-able list of their own.
const SEARCHABLE_SECTIONS = [
  '/admin/orders',
  '/admin/products',
  '/admin/customers',
  '/admin/purchases',
  '/admin/suppliers',
  '/admin/payments',
  '/admin/expenses',
  '/admin/returns',
  '/admin/inventory',
  '/admin/newsletter',
];

const AdminHeader = ({ onMenuClick }) => {
  const { admin, logout } = useAdminAuth();
  const { unreadCount, latest, refresh } = useAdminNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setUrlParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState('');

  const currentSection = SEARCHABLE_SECTIONS.find((section) => location.pathname.startsWith(section));

  // The box always clears itself when navigating to a different tab, so it
  // never shows last tab's leftover query against this tab's data.
  useEffect(() => {
    setSearch('');
  }, [currentSection]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const openNotification = async (n) => {
    if (!n.isRead) {
      await adminAxios.put(`/notifications/${n._id}/read`).catch(() => { });
      refresh();
    }
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  };

  // Catches the query as the admin types - no Enter needed - and applies it
  // to whichever tab is currently open by updating that tab's own `search`
  // URL param, which each list page listens for. Nothing happens if the
  // current page isn't one of the searchable sections.
  const handleSearchChange = (value) => {
    setSearch(value);
    if (!currentSection) return;
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('search', value);
      else next.delete('search');
      return next;
    }, { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-cream-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button type="button" onClick={onMenuClick} className="lg:hidden text-ink" aria-label="Toggle menu">
          <FiMenu size={20} />
        </button>
        {/* No search bar on the Dashboard, or on any page without a
            searchable list of its own - there's nothing for it to do there. */}
        {currentSection && (
          <div className="relative hidden sm:block max-w-xs w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search this section..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className="relative text-ink flex items-center justify-center hover:text-brand transition-colors"
            aria-label="Notifications"
          >
            <FiBell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[10px] font-medium min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white border border-cream-200 rounded-md shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-cream-100">
                <p className="text-sm text-ink font-medium">Notifications</p>
                {unreadCount > 0 && <span className="text-xs text-brand">{unreadCount} unread</span>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {(!latest || latest.length === 0) && <p className="text-sm text-muted px-4 py-6 text-center">No notifications yet.</p>}
                {latest?.map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => openNotification(n)}
                    className={`w-full text-left px-4 py-3 border-b border-cream-50 last:border-0 hover:bg-cream-50 transition-colors ${!n.isRead ? 'bg-cream-50/60' : ''}`}
                  >
                    <p className="text-sm text-ink">{n.title}</p>
                    {n.message && <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>}
                    <p className="text-[10px] text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(false);
                  navigate('/admin/notifications');
                }}
                className="w-full text-center text-xs tracking-widest text-brand py-2.5 border-t border-cream-100 hover:bg-cream-50"
              >
                VIEW ALL
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button type="button" onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-cream-200 flex items-center justify-center text-ink text-sm font-medium flex-shrink-0">
              {admin?.fullName?.[0] || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm text-ink leading-tight">{admin?.fullName}</p>
              <p className="text-xs text-muted leading-tight">{admin?.role?.name}</p>
            </div>
            <FiChevronDown size={14} className="text-muted hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-cream-200 rounded-md shadow-lg py-1 z-50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal hover:bg-charcoal/10"
              >
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;