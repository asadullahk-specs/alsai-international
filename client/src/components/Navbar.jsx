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

  const HERO_ROUTES = ['/', '/shop', '/gift-sets', '/promotions', '/about', '/faqs', '/contact'];
  const isHeroRoute = HERO_ROUTES.includes(location.pathname) || location.pathname.startsWith('/policies');
  const transparent = isHeroRoute && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > 60);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    navigate('/');
    logout();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Announcement Bar */}
        {announcementText && (
          <div className="bg-charcoal text-cream-100 text-[11px] tracking-widest text-center py-2 px-4 uppercase flex items-center justify-center gap-4">
            <span>{announcementText}</span>
            {storeMapUrl && (
              <a
                href={storeMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gold hover:text-gold-light transition-colors normal-case"
              >
                <FiMapPin size={12} /> Store Locator
              </a>
            )}
          </div>
        )}

        <nav
          className={`transition-all duration-300 ${
            transparent
              ? 'bg-gradient-to-b from-black/60 via-black/30 to-transparent'
              : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-cream-200'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
            {/* Logo - Centered alignment */}
            <div className="flex-1 flex items-center justify-start">
              <Link to="/" className="flex flex-col items-start group">
                <span
                  className={`font-serif text-xl sm:text-2xl tracking-wider font-semibold transition-colors duration-300 ${
                    transparent ? 'text-white' : 'text-ink'
                  }`}
                >
                  AL SA&apos;I
                </span>
                <span
                  className={`text-[9px] tracking-[0.25em] font-light transition-colors duration-300 ${
                    transparent ? 'text-cream-100/80' : 'text-muted'
                  }`}
                >
                  INTERNATIONAL
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center justify-center gap-8 h-full">
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `nav-underline text-xs tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? 'nav-underline-active font-medium' : ''
                  } ${transparent ? 'text-white' : 'text-ink'}`
                }
              >
                Shop
              </NavLink>

              {/* Collections Dropdown */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setCollectionsOpen((o) => !o)}
                  className={`nav-underline text-xs tracking-widest uppercase flex items-center gap-1 transition-colors duration-300 ${
                    transparent ? 'text-white' : 'text-ink'
                  }`}
                >
                  Collections <FiChevronDown size={12} />
                </button>

                {collectionsOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-cream-200 py-3 z-50 animate-[fadeIn_0.15s_ease-out]">
                    <div className="px-4 py-1 text-[10px] font-semibold tracking-widest text-muted uppercase">
                      By Category
                    </div>
                    {collections.map((col) => (
                      <Link
                        key={col._id}
                        to={`/shop?collection=${col.slug}`}
                        onClick={() => setCollectionsOpen(false)}
                        className="block px-4 py-2 text-xs text-ink hover:bg-cream-100 hover:text-brand transition-colors"
                      >
                        {col.name}
                      </Link>
                    ))}
                    {fragranceFamilies.length > 0 && (
                      <>
                        <div className="border-t border-cream-200 my-2" />
                        <div className="px-4 py-1 text-[10px] font-semibold tracking-widest text-muted uppercase">
                          Fragrance Families
                        </div>
                        {fragranceFamilies.map((family) => (
                          <Link
                            key={family._id}
                            to={`/shop?family=${family.slug}`}
                            onClick={() => setCollectionsOpen(false)}
                            className="block px-4 py-2 text-xs text-ink hover:bg-cream-100 hover:text-brand transition-colors"
                          >
                            {family.name}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <NavLink
                to="/promotions"
                className={({ isActive }) =>
                  `nav-underline text-xs tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? 'nav-underline-active font-medium' : ''
                  } ${transparent ? 'text-white' : 'text-ink'}`
                }
              >
                Promotions
              </NavLink>

              <NavLink
                to="/gift-sets"
                className={({ isActive }) =>
                  `nav-underline text-xs tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? 'nav-underline-active font-medium' : ''
                  } ${transparent ? 'text-white' : 'text-ink'}`
                }
              >
                Gift Sets
              </NavLink>
            </div>

            {/* Right-side icons - visible from md (768px) up */}
            <div
              className={`hidden md:flex items-center justify-end gap-5 h-full flex-1 transition-colors duration-300 ${
                transparent ? 'text-white' : 'text-ink'
              }`}
            >
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="flex items-center justify-center hover:text-brand transition-colors"
              >
                <FiSearch size={18} />
              </button>
              <Link to="/wishlist" aria-label="Wishlist" className="flex items-center justify-center hover:text-brand transition-colors">
                <FiHeart size={18} />
              </Link>

              <NotificationBell />

              <Link
                to={user ? '/orders' : '/login'}
                aria-label="Orders"
                className="flex items-center justify-center hover:text-brand transition-colors"
              >
                <FiUser size={18} />
              </Link>

              {user && (
                <Link to="/profile" aria-label="Profile" className="flex items-center justify-center hover:text-brand transition-colors">
                  <FiUserCheck size={18} />
                </Link>
              )}

              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="flex items-center justify-center hover:text-brand transition-colors"
                >
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
                  <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile & Tablet Header Triggers (below md/xl) */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={toggleCart}
                className={`relative flex items-center justify-center p-1.5 transition-colors duration-300 ${
                  transparent ? 'text-white' : 'text-ink'
                }`}
                aria-label="Cart"
              >
                <FiShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className={`flex-shrink-0 ml-1 transition-colors duration-300 ${transparent ? 'text-white' : 'text-ink'}`}
              >
                <FiMenu size={22} />
              </button>
            </div>
          </div>
        </nav>

        {/* Slide-in mobile/tablet menu */}
        <div
          className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={closeMenu}
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
          />

          <div
            className={`absolute top-0 right-0 h-full w-4/5 max-w-xs bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
              menuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-5 flex items-center justify-between border-b border-cream-200">
              <span className="font-serif text-lg tracking-wider font-semibold text-ink">AL SA&apos;I</span>
              <button type="button" onClick={closeMenu} aria-label="Close menu" className="text-muted hover:text-ink">
                <FiX size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-5 text-xs text-ink space-y-4">
              <Link to="/shop" onClick={closeMenu} className="block tracking-widest font-medium uppercase py-1">
                Shop
              </Link>
              <Link to="/promotions" onClick={closeMenu} className="block tracking-widest font-medium uppercase py-1">
                Promotions
              </Link>
              <Link to="/gift-sets" onClick={closeMenu} className="block tracking-widest font-medium uppercase py-1">
                Gift Sets
              </Link>

              <div className="border-t border-cream-200 pt-4 mt-4 space-y-3">
                <div className="text-[10px] font-semibold tracking-widest text-muted uppercase">Collections</div>
                {collections.map((c) => (
                  <Link
                    key={c._id}
                    to={`/shop?collection=${c.slug}`}
                    onClick={closeMenu}
                    className="block text-muted hover:text-ink transition-colors pl-2"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>

              {fragranceFamilies.length > 0 && (
                <div className="border-t border-cream-200 pt-4 space-y-3">
                  <div className="text-[10px] font-semibold tracking-widest text-muted uppercase">Fragrance Families</div>
                  {fragranceFamilies.map((family) => (
                    <Link
                      key={family._id}
                      to={`/shop?family=${family.slug}`}
                      onClick={closeMenu}
                      className="block text-muted hover:text-ink transition-colors pl-2"
                    >
                      {family.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="border-t border-cream-200 pt-4 space-y-2 text-ink font-medium">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setSearchOpen(true);
                  }}
                  className="flex items-center gap-3 py-2.5 tracking-wide w-full text-left"
                >
                  <FiSearch size={16} /> SEARCH
                </button>
                <Link to="/wishlist" onClick={closeMenu} className="flex items-center gap-3 py-2.5 tracking-wide">
                  <FiHeart size={16} /> WISHLIST
                </Link>
                <NotificationBell variant="row" />
                <Link to={user ? '/orders' : '/login'} onClick={closeMenu} className="flex items-center gap-3 py-2.5 tracking-wide">
                  <FiUser size={16} /> {user ? 'MY ORDERS' : 'ACCOUNT'}
                </Link>
                {user && (
                  <Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 py-2.5 tracking-wide">
                    <FiUserCheck size={16} /> PROFILE
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    toggleCart();
                  }}
                  className="flex items-center gap-3 py-2.5 tracking-wide w-full text-left"
                >
                  <FiShoppingBag size={16} /> CART {itemCount > 0 && `(${itemCount})`}
                </button>
                {user && (
                  <button type="button" onClick={handleLogout} className="flex items-center gap-3 py-2.5 tracking-wide w-full text-left">
                    <FiLogOut size={16} /> LOGOUT
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;