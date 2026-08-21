import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { driveImg } from '../../utils/driveImg';

// "Our Specialities" shows the core catalog collections (Perfumes and Attars).
// On screens below 480px, it displays 1 card at a time with smooth sliding and
// dot indicators below. On screens above 480px, it displays 2 cards side by side
// with no dot indicators.
const OurSpecialities = ({ collections = [] }) => {
  const perfumes = collections.find((c) => c.slug === 'perfumes');
  const attars = collections.find((c) => c.slug === 'attars');
  const cards = [perfumes, attars].filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || cards.length === 0) return;
    const el = scrollRef.current;
    const firstCard = el.querySelector(':scope > a');
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const style = window.getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    const step = cardWidth + gap;

    if (step <= 0) return;
    const index = Math.round(el.scrollLeft / step);
    setActiveIndex(Math.min(cards.length - 1, Math.max(0, index)));
  }, [cards.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    handleScroll();

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  const scrollToCard = (index) => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const firstCard = el.querySelector(':scope > a');
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const style = window.getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    const step = cardWidth + gap;

    el.scrollTo({
      left: index * step,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  if (cards.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <h2 className="text-xs tracking-widest text-ink mb-6">— OUR SPECIALITIES —</h2>
      <div
        ref={scrollRef}
        className="grid grid-cols-2 gap-2 sm:gap-4 max-480:flex max-480:gap-0 max-480:overflow-x-auto max-480:snap-x max-480:snap-mandatory max-480:pb-2 scrollbar-none scroll-smooth"
      >
        {cards.map((c) => (
          <Link
            key={c._id}
            to={`/shop?collection=${c._id}`}
            className="relative overflow-hidden aspect-[4/3] sm:aspect-[16/10] group bg-cream-100 max-480:flex-shrink-0 max-480:w-full max-480:snap-start"
          >
            {c.video ? (
              <video
                src={driveImg(c.video)}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              c.image && (
                <img
                  src={driveImg(c.image)}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )
            )}
            <div className="absolute inset-0 bg-black/25 flex flex-col justify-end p-3 sm:p-6">
              <h3 className="font-serif text-white text-sm max-480:text-xs sm:text-2xl mb-1">{c.name}</h3>
              <span className="text-white text-[10px] max-480:text-[8px] sm:text-xs tracking-widest">SHOP NOW →</span>
            </div>
          </Link>
        ))}
      </div>

      {cards.length > 1 && (
        <div className="max-480:flex hidden justify-center items-center gap-2 mt-4 select-none">
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToCard(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-6 bg-brand'
                  : 'w-2 bg-cream-200 hover:bg-cream-300'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default OurSpecialities;