import { useState, useEffect, useCallback } from 'react';
import publicAxios from '../api/publicAxios';
import ProductCard from '../components/ProductCard';
import { driveImg } from '../utils/driveImg';

// Same fixed-height frame convention as the homepage Hero Slider, so this
// page reads as consistent with every other page's top banner (Shop, Gift
// Sets) instead of standing out as the one page with no hero section.
const FRAME_HEIGHT = 'h-[220px] sm:h-[300px] md:h-[340px]';

const SeasonalCuts = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    publicAxios
      .get('/seasonal-collections')
      .then(({ data }) => setCampaigns(data.data.campaigns))
      .finally(() => setLoading(false));
  }, []);

  const banners = campaigns.filter((c) => c.banner);
  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    // Matches the homepage Seasonal Cuts slider's own 2.5s cadence, so the
    // "as a slider like Hero" behaviour is consistent everywhere it appears.
    const timer = setInterval(next, 2500);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  return (
    <div className="bg-cream min-h-screen">
      {/* One unified banner instead of a static heading strip PLUS a separate
          promo slider underneath it - that combination read as two banners
          stacked on top of each other. The heading/text stays fixed while the
          background cycles through every active campaign's banner image, the
          same up-front-preload approach used by the Hero Slider so slides
          never look like they're "not changing" or loading late. */}
      <section className={`relative bg-cream-100 overflow-hidden ${FRAME_HEIGHT}`}>
        {banners.map((c, i) => (
          <img
            key={c._id}
            src={driveImg(c.banner)}
            alt=""
            loading={i === 0 ? 'eager' : undefined}
            fetchpriority={i === 0 ? 'high' : undefined}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/35" />
        {/* Extra bottom padding keeps the sub-line clear of the frame's
            bottom edge on every screen size instead of sitting flush against
            it. */}
        <div className="absolute inset-0 flex flex-col justify-center px-4 pb-8 sm:pb-10">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-xs tracking-widest text-cream-100/90 mb-2">LIMITED TIME OFFERS</p>
            <h1 className="font-serif text-3xl max-480:text-2xl text-white mb-2">Promotions</h1>
            <p className="text-sm text-cream-100/90 max-w-lg">Exclusive seasonal discounts on selected perfumes.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-muted text-center py-24">No seasonal offers are running right now - check back soon.</p>
        ) : (
          campaigns.map((c) => (
            <section key={c._id} className="mb-14 last:mb-0">
              <div className="flex items-baseline justify-between mb-6 border-b border-cream-200 pb-3">
                <h2 className="font-serif text-xl text-ink">{c.name}</h2>
                <p className="text-brand text-sm">Up to {c.discountPercent}% off</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-480:gap-3">
                {c.products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default SeasonalCuts;
