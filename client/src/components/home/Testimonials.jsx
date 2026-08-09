import { useState, useEffect, useCallback } from 'react';
import { FiStar, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';
import { driveImg } from '../../utils/driveImg';

// Cards per page follows the breakpoint (4 desktop / 2 tablet / 1 mobile) but
// always slides through the full set rather than ever wrapping extra cards
// onto a second row - that's what keeps the section height constant.
const usePerPage = () => {
  const getPerPage = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 4;
  };
  const [perPage, setPerPage] = useState(getPerPage);

  useEffect(() => {
    const handleResize = () => setPerPage(getPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return perPage;
};

// Cards always render at the same height regardless of whether a review image
// is present - the image slot is always reserved (blank/placeholder if unused)
// so a page of mixed cards never looks jagged.
const Testimonials = ({ testimonials = [] }) => {
  const perPage = usePerPage();
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(testimonials.length / perPage);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(pageCount - 1, 0)));
  }, [pageCount]);

  const next = useCallback(() => setPage((p) => (p + 1) % pageCount), [pageCount]);

  useEffect(() => {
    if (pageCount < 2) return undefined;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, pageCount]);

  if (testimonials.length === 0) return null;

  const avgRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);
  const gridCols = { 1: 'grid-cols-1', 2: 'grid-cols-2', 4: 'grid-cols-4' }[perPage];

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl text-ink">What Our Customers Say</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
            <span className="text-gold font-medium">{avgRating}</span>
            <FiStar size={12} className="fill-gold text-gold" />
            <span>{testimonials.length} reviews</span>
          </div>
        </div>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)}
              aria-label="Previous reviews"
              className="w-8 h-8 border border-cream-200 flex items-center justify-center text-ink hover:border-brand transition-colors"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next reviews"
              className="w-8 h-8 border border-cream-200 flex items-center justify-center text-ink hover:border-brand transition-colors"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className={`grid ${gridCols} gap-5`}>
        {visible.map((t) => (
          <div key={t._id} className="bg-white border border-cream-200 p-5 h-[300px] flex flex-col">
            <div className="flex gap-0.5 text-gold mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} size={12} className={i < t.rating ? 'fill-gold' : 'opacity-25'} />
              ))}
            </div>

            <div className="w-full h-24 bg-cream-100 mb-3 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {t.reviewImage ? (
                <img src={driveImg(t.reviewImage)} alt="" className="w-full h-full object-cover" />
              ) : (
                <FiImage size={20} className="text-cream-200" />
              )}
            </div>

            <p className="text-sm text-ink leading-snug flex-1 overflow-hidden">{t.message}</p>

            <div className="flex items-center gap-2 mt-3 flex-shrink-0">
              {t.customerImage ? (
                <img src={driveImg(t.customerImage)} alt={t.customerName} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-cream-200 flex items-center justify-center text-xs text-muted">
                  {t.customerName?.[0]}
                </div>
              )}
              <span className="text-xs text-ink">{t.customerName}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
