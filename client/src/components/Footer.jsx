import { Link } from 'react-router-dom';
import { FiArrowUp } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import BrandMark from './BrandMark';

const SOCIAL_ICONS = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  twitter: FaXTwitter,
  x: FaXTwitter,
};

const DEFAULT_COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', url: '/shop' },
      { label: 'Best Sellers', url: '/shop?sort=popular' },
      { label: 'New Arrivals', url: '/shop?sort=newest' },
      { label: 'Promotions & Discounts', url: '/promotions' },
      { label: 'Gift Sets', url: '/gift-sets' },
    ],
  },
  {
    title: 'Customer Care',
    links: [
      { label: 'Shipping & Delivery', url: '/policies/shipping' },
      { label: 'Returns & Exchanges', url: '/policies/returns' },
      { label: 'FAQs', url: '/faqs' },
      { label: 'Contact Us', url: '/contact' },
      { label: 'Track Order', url: '/login' },
    ],
  },
  {
    title: 'About Us',
    links: [
      { label: 'Our Story', url: '/about' },
      { label: 'Collections', url: '/shop' },
    ],
  },
];

const formatFooterColumns = (columns) => {
  if (!columns || !columns.length) return DEFAULT_COLUMNS;

  return columns.map((col) => {
    const titleLower = col.title?.toLowerCase() || '';

    let updatedLinks = (col.links || []).map((link) => {
      if (link.label?.toLowerCase() === 'track order' || link.url === '/track-order') {
        return { ...link, url: '/login' };
      }
      return link;
    });

    if (titleLower.includes('about')) {
      const hasStory = updatedLinks.some((l) => l.label?.toLowerCase() === 'our story');
      const storyLink = hasStory
        ? updatedLinks.find((l) => l.label?.toLowerCase() === 'our story')
        : { label: 'Our Story', url: '/about' };

      return {
        ...col,
        links: [
          { label: 'Our Story', url: storyLink.url || '/about' },
          { label: 'Collections', url: '/shop' },
        ],
      };
    }

    if (titleLower.includes('shop')) {
      updatedLinks = updatedLinks.map((link) => {
        const labelLower = link.label?.toLowerCase() || '';
        if (labelLower === 'all perfumes') {
          return { label: 'All Products', url: '/shop' };
        }
        if (labelLower === 'seasonal cuts' || labelLower === 'promotions') {
          return { label: 'Promotions & Discounts', url: '/promotions' };
        }
        return link;
      });
    }

    return {
      ...col,
      links: updatedLinks,
    };
  });
};

const Footer = ({ websiteContent }) => {
  const footer = websiteContent?.footer;
  const socialLinks = websiteContent?.socialLinks || [];
  const columns = formatFooterColumns(footer?.columns);
  const storeMapUrl = websiteContent?.contactInfo?.storeMapUrl;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-charcoal text-cream-100">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <BrandMark className="w-5 h-5" color="#C9A15A" />
            <span className="font-serif text-lg tracking-wide">AL SA'I</span>
          </div>
          {footer?.description && <p className="text-xs text-cream-200/70 leading-relaxed mb-5">{footer.description}</p>}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform?.toLowerCase()];
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-cream-200/80 hover:text-gold hover:border-gold transition-colors"
                    aria-label={s.platform}
                  >
                    {Icon ? <Icon size={13} /> : s.platform?.[0]?.toUpperCase()}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-[11px] tracking-widest text-gold mb-4">{col.title.toUpperCase()}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.url} className="text-xs text-cream-200/75 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Privacy Policy, Terms & Conditions, and Store Locator sit in the
            bottom bar on larger screens, but that bar hides them below sm.
            Surface them here as their own footer section on phone view so
            they're not lost. */}
        <div className="sm:hidden">
          <h4 className="text-[11px] tracking-widest text-gold mb-4">MORE</h4>
          <ul className="space-y-2.5">
            <li>
              <Link to="/policies/privacy" className="text-xs text-cream-200/75 hover:text-gold transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/policies/terms" className="text-xs text-cream-200/75 hover:text-gold transition-colors">
                Terms &amp; Conditions
              </Link>
            </li>
            {storeMapUrl && (
              <li>
                <a
                  href={storeMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cream-200/75 hover:text-gold transition-colors"
                >
                  Store Locator
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between text-[11px] text-cream-200/55">
          <span>© {new Date().getFullYear()} AL SA'I. All Rights Reserved.</span>
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/policies/privacy" className="hover:text-gold">
              Privacy Policy
            </Link>
            <Link to="/policies/terms" className="hover:text-gold">
              Terms &amp; Conditions
            </Link>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors flex-shrink-0"
          >
            <FiArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;