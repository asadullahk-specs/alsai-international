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

const Footer = ({ websiteContent }) => {
  const footer = websiteContent?.footer;
  const socialLinks = websiteContent?.socialLinks || [];

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

        {(footer?.columns || []).map((col) => (
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
