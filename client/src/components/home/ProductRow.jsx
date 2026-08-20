import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../ProductCard';
import SliderProgress from '../SliderProgress';

const ProductRow = ({ title, products = [], viewAllLink, mediaMode = 'image' }) => {
  const scrollRef = useRef(null);

  if (products.length === 0) return null;

  const next = () => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector(':scope > div');
      const step = card ? card.offsetWidth + 16 : 240;
      scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const prev = () => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector(':scope > div');
      const step = card ? card.offsetWidth + 16 : 240;
      scrollRef.current.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs tracking-widest text-ink">{title}</h2>
        <div className="flex items-center gap-4">
          {viewAllLink && (
            <Link to={viewAllLink} className="text-xs text-brand hover:underline">
              VIEW ALL →
            </Link>
          )}
          {products.length > 4 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous products"
                className="w-8 h-8 border border-cream-200 flex items-center justify-center text-ink hover:border-brand transition-colors"
              >
                <FiChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next products"
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
        className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none scroll-smooth"
      >
        {products.map((p) => (
          <div
            key={p._id}
            className="flex-shrink-0 w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2.5rem)/3)] md:w-[calc((100%-3.75rem)/4)] lg:w-[calc((100%-5rem)/5)] snap-start"
          >
            <ProductCard product={p} mediaMode={mediaMode} />
          </div>
        ))}
      </div>
      <SliderProgress scrollRef={scrollRef} total={products.length} itemLabel="cards" />
    </section>
  );
};

export default ProductRow;