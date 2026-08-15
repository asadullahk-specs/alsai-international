import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
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
  FiTruck,
  FiShield,
  FiBell,
  FiFileText,
  FiMessageSquare,
  FiHome,
  FiClipboard,
  FiChevronDown,
  FiShoppingCart,
  FiBriefcase,
  FiTrendingDown,
  FiRotateCcw,
} from 'react-icons/fi';
import BrandMark from '../../components/BrandMark';
import { useAdminNotifications } from '../../context/AdminNotificationContext';

// Products is the one item that expands into a submenu instead of linking
// straight to a page - everything else stays a flat NavLink, matching the
// existing sidebar's look exactly (no new visual pattern introduced).
const PRODUCTS_CHILDREN = [
  { to: '/admin/products', label: 'All Products', icon: FiBox },
  { to: '/admin/featured-collections', label: 'Featured Collections', icon: FiStar },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/fragrance-families', label: 'Fragrance Families', icon: FiDroplet },
  { to: '/admin/gift-sets', label: 'Gift Sets', icon: FiGift },
];

const useSections = (unreadCount) => [
  { title: 'Overview', items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid, ready: true }] },
  {
    title: 'Customers & Orders',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: FiClipboard, ready: true },
      { to: '/admin/customers', label: 'Customers', icon: FiUsers, ready: true },
      { to: '/admin/reviews', label: 'Reviews', icon: FiStar, ready: true },
      { to: '/admin/testimonials', label: 'Testimonials', icon: FiUserCheck, ready: true },
      { to: '/admin/messages', label: 'Messages', icon: FiMessageSquare, ready: true },
      { to: '/admin/newsletter', label: 'Newsletter', icon: FiMail, ready: true },
      { to: '/admin/returns', label: 'Returns & Refunds', icon: FiRotateCcw, ready: true },
    ],
  },
  {
    title: 'Business',
    items: [
      { to: '/admin/purchases', label: 'Purchases', icon: FiShoppingCart, ready: true },
      { to: '/admin/suppliers', label: 'Suppliers', icon: FiBriefcase, ready: true },
      { to: '/admin/inventory', label: 'Inventory', icon: FiPackage, ready: true },
      { to: '/admin/expenses', label: 'Expenses', icon: FiTrendingDown, ready: true },
    ],
  },
  {
    title: 'Website',
    items: [
      { to: '/admin/homepage-manager', label: 'Homepage Manager', icon: FiHome, ready: true },
      { to: '/admin/website-content', label: 'Website Content', icon: FiFileText, ready: true },
    ],
  },
  {
    title: 'Promotions',
    items: [{ to: '/admin/promotions', label: 'Promotions', icon: FiPercent, ready: true }],
  },
  {
    title: 'Analytics',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: FiTrendingUp, ready: true },
      { to: '/admin/notifications', label: 'Notifications', icon: FiBell, ready: true, badge: unreadCount },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: FiSettings, ready: true },
      { to: '/admin/users-roles', label: 'Users & Roles', icon: FiShield, ready: true },
      { to: '/admin/activity-logs', label: 'Activity Logs', icon: FiUserCheck, ready: true },
      { to: '/admin/backup-restore', label: 'Backup & Restore', icon: FiTruck, ready: true },
    ],
  },
];

const AdminSidebar = ({ onNavigate }) => {
  const { unreadCount } = useAdminNotifications();
  const SECTIONS = useSections(unreadCount);
  const location = useLocation();

  const isProductsChildActive = PRODUCTS_CHILDREN.some((c) => location.pathname.startsWith(c.to));
  const [productsOpen, setProductsOpen] = useState(isProductsChildActive);

  return (
    <div className="h-full bg-charcoal text-cream-200 flex flex-col overflow-y-auto scrollbar-dark">
      <div className="flex flex-col items-center py-7 border-b border-white/10 flex-shrink-0">
        <BrandMark className="w-7 h-7 mb-2" color="#C9A15A" />
        <span className="font-serif text-xl tracking-wide text-white">AL SA'I</span>
        <span className="text-[9px] tracking-[0.3em] text-cream-200/60 mt-0.5">EXTRAIT DE PARFUM</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-5">
        {SECTIONS.filter((s) => s.title === 'Overview').map((section) => (
          <div key={section.title}>
            <p className="text-[10px] tracking-widest text-gold/80 px-3 mb-2">{section.title.toUpperCase()}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink key={item.label} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="text-[10px] tracking-widest text-gold/80 px-3 mb-2">PRODUCTS</p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setProductsOpen((v) => !v)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isProductsChildActive ? 'bg-brand text-white' : 'text-cream-200/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FiBox size={16} />
              <span className="flex-1 text-left">Products</span>
              <FiChevronDown size={14} className={`transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            {productsOpen && (
              <div className="pl-4 space-y-0.5">
                {PRODUCTS_CHILDREN.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive ? 'bg-brand text-white' : 'text-cream-200/70 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <child.icon size={14} />
                    <span className="flex-1">{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>

        {SECTIONS.filter((s) => s.title !== 'Overview').map((section) => (
          <div key={section.title}>
            <p className="text-[10px] tracking-widest text-gold/80 px-3 mb-2">{section.title.toUpperCase()}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink key={item.label} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

const SidebarLink = ({ item, onNavigate }) =>
  item.ready ? (
    <NavLink
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
      className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-cream-200/30 cursor-not-allowed select-none"
      title="Coming in a later phase"
    >
      <item.icon size={16} />
      {item.label}
    </div>
  );

export default AdminSidebar;
