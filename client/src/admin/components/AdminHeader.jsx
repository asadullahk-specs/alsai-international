import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiBell, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminHeader = ({ onMenuClick }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-cream-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button type="button" onClick={onMenuClick} className="lg:hidden text-ink" aria-label="Toggle menu">
          <FiMenu size={20} />
        </button>
        <div className="relative hidden sm:block max-w-xs w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input
            placeholder="Search anything..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" className="relative text-ink flex items-center justify-center hover:text-brand transition-colors" aria-label="Notifications">
          <FiBell size={19} />
        </button>

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
