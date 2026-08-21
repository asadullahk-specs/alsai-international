import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { driveImg } from '../../utils/driveImg';
import SliderProgress from '../SliderProgress';

const FeaturedCollections = ({ collections = [] }) => {
  const scrollRef = useRef(null);

  if (collections.length === 0) return null;

  const next = () => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector(':scope > a');
      const step = card ? card.offsetWidth + 16 : 240;
      scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const prev = () => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector(':scope > a');
      const step = card ? card.offsetWidth + 16 : 240;
      scrollRef.current.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs tracking-widest text-ink">— FEATURED COLLECTIONS —</h2>
        <div className="flex items-center gap-4">
          <Link to="/shop" className="text-xs text-brand hover:underline">
            VIEW ALL →
          </Link>
          {collections.length > 4 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous collection"
                className="w-8 h-8 border border-cream-200 flex items-center justify-center text-ink hover:border-brand transition-colors"
              >
                <FiChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next collection"
                className="w-8 h-8 border border-cream-200 flex items-center justify-center text-ink hover:border-brand transition-colors"
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none scroll-smooth"
      >
        {collections.map((col) => (
          <Link
            key={col._id}
            to={`/shop?featuredCollection=${col._id}`}
            className="group flex-shrink-0 w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2.5rem)/3)] md:w-[calc((100%-3.75rem)/4)] lg:w-[calc((100%-5rem)/5)] snap-start block"
          >
            <div className="aspect-[3/4] overflow-hidden bg-cream-100 mb-2 rounded-md">
              {col.image && (
                <img
                  src={driveImg(col.image)}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <p className="text-sm font-medium text-ink truncate">{col.name}</p>
            {col.description && <p className="text-xs text-muted truncate">{col.description}</p>}
            <span className="text-xs text-brand">Explore →</span>
          </Link>
        ))}
      </div>
      <SliderProgress scrollRef={scrollRef} total={collections.length} itemLabel="products" />
    </section>
  );
};

export default FeaturedCollections;