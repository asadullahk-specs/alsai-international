import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch,
  FiHeart,
  FiUser,
  FiUserCheck,
  FiShoppingBag,
  FiChevronDown,
  FiMapPin,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import SearchModal from './SearchModal';

const Navbar = ({ collections = [], fragranceFamilies = [], announcementText, storeMapUrl }) => {
  const { itemCount, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Pages with a full-bleed hero banner starting at the very top get the
  // navbar overlaid transparently on top of it; everything else (product
  // pages, cart, account, checkout...) gets a normal solid header, since
  // there's no hero image behind it to show through.
  const HERO_ROUTES = ['/', '/shop', '/gift-sets', '/promotions', '/about', '/faqs', '/contact'];
  const isHeroRoute = HERO_ROUTES.includes(location.pathname) || location.pathname.startsWith('/policies');
  const transparent = isHeroRoute && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Re-check on route change - navigating to a short page shouldn't leave
  // the header stuck in whatever scroll state the previous page was in.
  useEffect(() => {
    setScrolled(window.scrollY > 60);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  // Navigate away from whatever page we're on FIRST, then log out. Doing it
  // in the other order (log out, then navigate) briefly leaves a protected
  // page (e.g. Profile) mounted with user=null, which makes it redirect to
  // /login with a "please login to continue" message before the navigate('/')
  // below ever runs. Going to '/' first sidesteps that race entirely.
  const handleLogout = async () => {
    closeMenu();
    navigate('/');
    await logout();
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${transparent ? 'bg-transparent' : 'bg-cream shadow-sm'}`}>
        {/* Top strip: shows whenever there's an announcement OR a Store
          Location link (set by the admin in the Homepage Manager) - the
          Store Location link is always right-aligned here regardless of
          whether an announcement message is present. */}
        {(announcementText || storeMapUrl) && (
          <div
            className={`bg-charcoal text-cream-100 overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-0' : 'max-h-9'
              }`}
          >
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-center sm:justify-between h-9 text-[11px]">
              <span className="tracking-wide truncate text-center sm:text-left">{announcementText}</span>
              <div className="hidden sm:flex items-center gap-5 text-cream-200/80 flex-shrink-0 ml-auto">
                {storeMapUrl && (
                  <a href={storeMapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <FiMapPin size={13} /> Store Location
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className={`transition-colors duration-300 ${transparent ? 'border-b border-white/20' : 'border-b border-cream-200'}`}>
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4 relative">
            {/* Desktop nav links - visible from xl (1280px) up only */}
            <div className={`hidden xl:flex items-center gap-8 h-full text-xs tracking-widest flex-1 transition-colors duration-300 ${transparent ? 'text-white' : 'text-ink'}`}>
              <NavLink to="/shop" className={({ isActive }) => `nav-underline${isActive ? ' nav-underline-active' : ''}`}>
                SHOP
              </NavLink>

              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <button type="button" className="nav-underline flex items-center gap-1">
                  COLLECTIONS <FiChevronDown size={12} />
                </button>
                {collectionsOpen && collections.length > 0 && (
                  <div className="absolute top-full left-0 pt-2">
                    <div className="flex gap-8 bg-white border border-cream-200 shadow-lg p-6 w-max max-w-[85vw]">
                      {collections.map((col) => {
                        // Each collection (Perfumes / Attars) shows only the
                        // fragrance families assigned to it, not a shared list.
                        const famsForCollection = fragranceFamilies.filter(
                          (fam) => !fam.belongsTo || fam.belongsTo === 'Both' || fam.belongsTo === col.name || (fam.collection?._id || fam.collection) === col._id
                        );
                        return (
                          <div key={col._id} className="min-w-[120px] flex-shrink-0">
                            <Link
                              to={`/shop?collection=${col._id}`}
                              className="font-serif text-sm font-medium text-ink hover:text-brand block mb-3 pb-1 border-b border-cream-200 normal-case tracking-normal whitespace-nowrap"
                            >
                              {col.name}
                            </Link>
                            <ul className="space-y-2">
                              {famsForCollection.map((fam) => (
                                <li key={fam._id}>
                                  <Link
                                    to={`/shop?collection=${col._id}&fragranceFamily=${fam._id}`}
                                    className="text-xs text-muted hover:text-brand normal-case tracking-normal whitespace-nowrap block"
                                  >
                                    {fam.name}
                                  </Link>
                                </li>
                              ))}
                              {famsForCollection.length === 0 && (
                                <li className="text-xs text-muted/60 normal-case tracking-normal whitespace-nowrap">No families yet</li>
                              )}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <NavLink to="/promotions" className={({ isActive }) => `nav-underline${isActive ? ' nav-underline-active' : ''}`}>
                PROMOTIONS
              </NavLink>
              <NavLink to="/gift-sets" className={({ isActive }) => `nav-underline${isActive ? ' nav-underline-active' : ''}`}>
                GIFT SETS
              </NavLink>
            </div>

            {/* Logo: centered at xl+, pinned left below xl */}
            <Link to="/" className="flex flex-col items-start xl:items-center flex-shrink-0">
              <span className={`font-serif text-xl sm:text-2xl tracking-wide transition-colors duration-300 ${transparent ? 'text-white' : 'text-ink'}`}>AL SA'I</span>
              <span className={`text-[8px] sm:text-[9px] tracking-[0.3em] transition-colors duration-300 ${transparent ? 'text-white/70' : 'text-muted'}`}>INTERNATIONAL</span>
            </Link>

            {/* Right-side icons - always visible on all screen sizes */}
            <div className={`flex items-center justify-end gap-4 h-full flex-1 transition-colors duration-300 ${transparent ? 'text-white' : 'text-ink'}`}>
              <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className="flex items-center justify-center hover:text-brand transition-colors">
                <FiSearch size={18} />
              </button>
              <Link to="/wishlist" aria-label="Wishlist" className="hidden sm:flex items-center justify-center hover:text-brand transition-colors">
                <FiHeart size={18} />
              </Link>

              {/* Notifications - opens a small dropdown panel right here, never
                navigates to a page. Logged out: a friendly message inside the
                panel. Logged in: real order-status notifications with an
                unread badge. */}
              <NotificationBell />

              {/* Account - logged out: login page. Logged in: a flat "my orders" page - no panel/dashboard. */}
              <Link to={user ? '/orders' : '/login'} aria-label="Orders" className="flex items-center justify-center hover:text-brand transition-colors">
                <FiUser size={18} />
              </Link>

              {/* Profile - only appears once logged in, desktop only to save space */}
              {user && (
                <Link to="/profile" aria-label="Profile" className="hidden md:flex items-center justify-center hover:text-brand transition-colors">
                  <FiUserCheck size={18} />
                </Link>
              )}

              {user && (
                <button type="button" onClick={handleLogout} aria-label="Logout" className="hidden md:flex items-center justify-center hover:text-brand transition-colors">
                  <FiLogOut size={18} />
                </button>
              )}

              <button
                type="button"
                onClick={toggleCart}
                className="relative flex items-center justify-center hover:text-brand transition-colors"
                aria-label="Cart"
              >
                <FiShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Burger trigger - visible below xl (1280px) */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className={`xl:hidden flex-shrink-0 transition-colors duration-300 ${transparent ? 'text-white' : 'text-ink'}`}
              >
                <FiMenu size={22} />
              </button>
            </div>
          </div>
        </nav>

        {/* Slide-in mobile/tablet menu, smooth open/close */}
        <div
          className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={closeMenu}
            className="absolute inset-0 bg-charcoal/40"
          />
          <div
            className={`absolute top-0 left-0 w-full max-h-full bg-cream shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${menuOpen ? 'translate-y-0' : '-translate-y-full'
              }`}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-cream-200">
              <span className="font-serif text-lg text-ink">Menu</span>
              <button type="button" onClick={closeMenu} aria-label="Close menu" className="text-ink">
                <FiX size={22} />
              </button>
            </div>

            <nav className="p-5 space-y-1 text-sm text-ink">
              <Link to="/shop" onClick={closeMenu} className="block py-2.5 tracking-wide hover:text-brand transition-colors">
                SHOP
              </Link>
              <Link to="/shop" onClick={closeMenu} className="block py-2.5 tracking-wide hover:text-brand transition-colors">
                COLLECTIONS
              </Link>
              <Link to="/promotions" onClick={closeMenu} className="block py-2.5 tracking-wide hover:text-brand transition-colors">
                PROMOTIONS
              </Link>
              <Link to="/gift-sets" onClick={closeMenu} className="block py-2.5 tracking-wide hover:text-brand transition-colors">
                GIFT SETS
              </Link>
              <Link to="/wishlist" onClick={closeMenu} className="block py-2.5 tracking-wide hover:text-brand transition-colors">
                WISHLIST
              </Link>

              {user && (
                <>
                  <Link to="/profile" onClick={closeMenu} className="md:hidden block py-2.5 tracking-wide hover:text-brand transition-colors">
                    PROFILE
                  </Link>
                  <button type="button" onClick={handleLogout} className="md:hidden block py-2.5 tracking-wide w-full text-left hover:text-brand transition-colors">
                    LOGOUT
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;