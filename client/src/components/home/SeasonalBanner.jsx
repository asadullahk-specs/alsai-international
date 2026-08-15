import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { driveImg } from '../../utils/driveImg';

// Mirrors HeroSlider's fixed frame so both sections read as the same visual
// language. A single campaign renders statically; more than one becomes an
// auto-rotating slider, same as the hero.
const FRAME_HEIGHT = 'h-[420px] md:h-[480px]';

const SeasonalBanner = ({ campaigns = [] }) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % campaigns.length), [campaigns.length]);

  useEffect(() => {
    if (campaigns.length < 2) return undefined;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next, campaigns.length]);

  if (campaigns.length === 0) return null;
  const campaign = campaigns[current];

  return (
    <section id="promotions" className="max-w-7xl mx-auto px-4 py-14 scroll-mt-20">
      <div className={`relative overflow-hidden bg-cream-100 ${FRAME_HEIGHT}`}>
        {/* All campaign banner images are mounted up front (stacked, toggled
            via opacity) so switching slides never has to wait on a fresh
            image fetch - mirrors the same fix applied to the Hero Slider. */}
        {campaigns.map((c, i) =>
          c.banner ? (
            <img
              key={c._id || i}
              src={driveImg(c.banner)}
              alt={c.name}
              loading={i === 0 ? 'eager' : undefined}
              fetchpriority={i === 0 ? 'high' : undefined}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />
          ) : null
        )}
        <div className="absolute inset-0 bg-black/20 flex flex-col justify-center px-8 sm:px-14">
          <p className="text-white/80 text-xs tracking-[0.25em] mb-2">LIMITED TIME OFFERS</p>
          <h2 className="font-serif text-white text-2xl sm:text-4xl mb-2 line-clamp-2">{campaign.name}</h2>
          <p className="text-white/90 text-sm mb-5 max-w-sm">Exclusive seasonal discounts on selected perfumes.</p>
          <Link
            to="/promotions"
            className="self-start bg-white text-ink text-xs tracking-widest px-6 py-3 hover:bg-cream-100 transition-colors"
          >
            SHOP THE OFFER
          </Link>
        </div>
        <div className="absolute top-16 right-6 bg-brand text-white text-center rounded-full w-16 h-16 flex flex-col items-center justify-center leading-none">
          <span className="text-[10px]">UP TO</span>
          <span className="text-lg font-semibold">{campaign.discountPercent}%</span>
          <span className="text-[9px]">OFF</span>
        </div>
      </div>
    </section>
  );
};

export default SeasonalBanner;