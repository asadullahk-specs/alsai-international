import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { driveImg } from '../../utils/driveImg';

// Every slide renders inside the same fixed-height frame regardless of its
// own image's native dimensions. Text sits in a flex column with room
// reserved below the heading so a 2-line heading never gets clipped by the
// frame, and shrinks on small screens so it never overflows there either.
const FRAME_HEIGHT = 'h-[532px] sm:h-[616px] md:h-[672px]';

const HeroSlider = ({ slides = [] }) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[current];

  return (
    <section className={`relative bg-cream-100 overflow-hidden ${FRAME_HEIGHT}`}>
      {/* All slide images are mounted at once (stacked, toggled via opacity) so
          every image is fetched and cached up front. This avoids the visible
          "loading late" flash that happens when a fresh <img> is mounted only
          when its slide becomes active. */}
      {slides.map((s, i) =>
        s.backgroundImage ? (
          <img
            key={s._id || i}
            src={driveImg(s.backgroundImage)}
            alt={s.heading}
            loading={i === 0 ? 'eager' : undefined}
            fetchpriority={i === 0 ? 'high' : undefined}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        ) : null
      )}
      <div className="absolute inset-0 bg-black/25" />

      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-lg">
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl text-white leading-snug md:leading-tight line-clamp-2">
            {slide.heading}
          </h1>
          {slide.description && (
            <p className="text-cream-100 text-xs sm:text-sm md:text-base mt-4 mb-6 md:mb-7 line-clamp-2">{slide.description}</p>
          )}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {slide.buttonText && (
              <Link
                to={slide.buttonUrl || '/shop'}
                className="bg-brand hover:bg-brand-dark text-white text-[11px] sm:text-xs tracking-widest px-5 sm:px-7 py-2.5 sm:py-3 transition-colors"
              >
                {slide.buttonText.toUpperCase()}
              </Link>
            )}
            {slide.secondaryButtonText && (
              <Link
                to={slide.secondaryButtonUrl || '/about'}
                className="border border-white/60 text-white text-[11px] sm:text-xs tracking-widest px-5 sm:px-7 py-2.5 sm:py-3 hover:border-white transition-colors"
              >
                {slide.secondaryButtonText.toUpperCase()}
              </Link>
            )}
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSlider;
