import { driveImg } from '../utils/driveImg';
import { Link } from 'react-router-dom';

// Full-bleed hero banner with dark background overlay used by static & policy pages,
// matching the exact height, overlay, and breadcrumb layout used across main pages (About, Shop, Gift Sets).
const StaticPageHero = ({ heading, description, image, eyebrow = null, breadcrumb }) => (
  <section className="relative bg-cream-100 overflow-hidden h-[532px] sm:h-[616px] md:h-[672px] flex items-center">
    {image && (
      <img src={driveImg(image)} alt="" className="absolute inset-0 w-full h-full object-cover" />
    )}
    <div className="absolute inset-0 bg-black/40" />
    <div className="max-w-7xl mx-auto px-4 relative w-full z-10">
      <p className="text-xs text-cream-100/80 mb-3">
        <Link to="/" className="hover:text-gold">Home</Link> / {breadcrumb || heading}
      </p>
      {eyebrow && <p className="text-xs tracking-widest text-gold mb-2 uppercase">{eyebrow}</p>}
      <h1 className="font-serif text-3xl sm:text-4xl max-480:text-2xl text-white">{heading}</h1>
      {description && (
        <p className="text-sm sm:text-base text-cream-100/90 mt-2 max-w-xl leading-relaxed">{description}</p>
      )}
    </div>
  </section>
);

export default StaticPageHero;
