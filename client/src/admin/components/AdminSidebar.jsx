import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiLayers,
  FiTag,
  FiDroplet,
  FiGift,
  FiUsers,
  FiStar,
  FiMail,
  FiPercent,
  FiTrendingUp,
  FiPackage,
  FiUserCheck,
  FiSettings,
  FiDollarSign,
  FiTruck,
  FiShield,
  FiBell,
  FiFileText,
  FiMessageSquare,
  FiHome,
  FiClipboard,
} from 'react-icons/fi';
import BrandMark from '../../components/BrandMark';
import { useAdminNotifications } from '../../context/AdminNotificationContext';

const useSections = (unreadCount) => [
  { items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid, ready: true }] },
  {
    title: 'Products',
    items: [
      { to: '/admin/products', label: 'Products', icon: FiBox, ready: true },
      { to: '/admin/collections', label: 'Collections', icon: FiLayers, ready: true },
      { to: '/admin/featured-collections', label: 'Featured Collections', icon: FiStar, ready: true },
      { to: '/admin/categories', label: 'Categories', icon: FiTag, ready: true },
      { to: '/admin/fragrance-families', label: 'Fragrance Families', icon: FiDroplet, ready: true },
      { to: '/admin/gift-sets', label: 'Gift Sets', icon: FiGift, ready: true },
    ],
  },
  {
    title: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: FiClipboard, ready: true },
      { to: '/admin/customers', label: 'Customers', icon: FiUsers, ready: true },
      { to: '/admin/reviews', label: 'Reviews', icon: FiStar, ready: true },
      { to: '/admin/messages', label: 'Messages', icon: FiMessageSquare, ready: true },
      { to: '/admin/newsletter', label: 'Newsletter', icon: FiMail, ready: true },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/homepage-manager', label: 'Homepage Manager', icon: FiHome, ready: true },
      { to: '/admin/website-content', label: 'Website Content', icon: FiFileText, ready: true },
    ],
  },
  {
    title: 'Marketing',
    items: [{ to: '/admin/promotions', label: 'Promotions', icon: FiPercent, ready: true }],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/inventory', label: 'Inventory', icon: FiPackage, ready: true },
      { to: '/admin/reports', label: 'Reports', icon: FiTrendingUp, ready: true },
      { to: '/admin/notifications', label: 'Notifications', icon: FiBell, ready: true, badge: unreadCount },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: FiSettings, ready: true },
      { to: '/admin/activity-logs', label: 'Activity Logs', icon: FiUserCheck, ready: true },
      { to: '/admin/backup-restore', label: 'Backup & Restore', icon: FiTruck, ready: true },
      { to: '/admin/users-roles', label: 'Users & Roles', icon: FiShield, ready: true },
    ],
  },
];

const AdminSidebar = ({ onNavigate }) => {
  const { unreadCount } = useAdminNotifications();
  const SECTIONS = useSections(unreadCount);

  return (
    <div className="h-full bg-charcoal text-cream-200 flex flex-col overflow-y-auto scrollbar-dark">
      <div className="flex flex-col items-center py-7 border-b border-white/10 flex-shrink-0">
        <BrandMark className="w-7 h-7 mb-2" color="#C9A15A" />
        <span className="font-serif text-xl tracking-wide text-white">AL SA'I</span>
        <span className="text-[9px] tracking-[0.3em] text-cream-200/60 mt-0.5">EXTRAIT DE PARFUM</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-5">
        {SECTIONS.map((section, i) => (
          <div key={section.title || `section-${i}`}>
            {section.title && <p className="text-[10px] tracking-widest text-gold/80 px-3 mb-2">{section.title.toUpperCase()}</p>}
            <div className="space-y-0.5">
              {section.items.map((item) =>
                item.ready ? (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                        isActive ? 'bg-brand text-white' : 'text-cream-200/80 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={16} />
                    <span className="flex-1">{item.label}</span>
                    {!!item.badge && (
                      <span className="bg-gold text-charcoal text-[10px] font-medium min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                ) : (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-cream-200/30 cursor-not-allowed select-none"
                    title="Coming in a later phase"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
