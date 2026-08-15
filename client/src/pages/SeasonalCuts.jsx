import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import publicAxios from '../api/publicAxios';
import ProductCard from '../components/ProductCard';
import { driveImg } from '../utils/driveImg';
import usePageTitle from '../hooks/usePageTitle';

const SeasonalCuts = () => {
  usePageTitle('Promotions');
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
    // Matches the homepage Seasonal Cuts slider's own 3s cadence, so the
    // slider behaves identically wherever it appears on the site.
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  const activeBanner = banners[current];

  // Flattens every campaign's products into one deduplicated list (a
  // product could technically belong to more than one active campaign) so
  // the page shows a single grid of discounted products instead of
  // grouping by campaign.
  const discountedProducts = Array.from(
    new Map(campaigns.flatMap((c) => c.products || []).map((p) => [p._id, p])).values()
  );

  return (
    <div className="bg-cream min-h-screen">
      {/* One unified banner instead of a static heading strip PLUS a separate
          promo slider underneath it - that combination read as two banners
          stacked on top of each other. The heading/text now cycles per
          campaign (name + discount), same as the homepage promotions
          section, so both places behave identically. The background cycles
          through every active campaign's banner image, the same up-front-
          preload approach used by the Hero Slider so slides never look like
          they're "not changing" or loading late. */}
      <section className="relative bg-cream-100 overflow-hidden h-[532px] sm:h-[616px] md:h-[672px]">
        {banners.map((c, i) => (
          <img
            key={c._id}
            src={driveImg(c.banner)}
            alt=""
            loading={i === 0 ? 'eager' : undefined}
            fetchpriority={i === 0 ? 'high' : undefined}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-4 pb-8 sm:pb-10">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-xs text-cream-100/80 mb-3">
              <Link to="/" className="hover:text-gold">Home</Link> / Promotions
            </p>
            <p className="text-xs tracking-widest text-cream-100/90 mb-2">LIMITED TIME OFFERS</p>
            <h1 className="font-serif text-3xl sm:text-4xl max-480:text-2xl text-white mb-2 line-clamp-2">
              {activeBanner ? activeBanner.name : 'Promotions'}
            </h1>
            <p className="text-sm text-cream-100/90 max-w-lg">Exclusive seasonal discounts on selected perfumes.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : discountedProducts.length === 0 ? (
          <p className="text-sm text-muted text-center py-24">No discounted products right now - check back soon.</p>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-6 border-b border-cream-200 pb-3">
              <h2 className="font-serif text-xl text-ink">Discounted Products</h2>
              <p className="text-brand text-sm">{discountedProducts.length} item{discountedProducts.length !== 1 ? 's' : ''} on offer</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-480:gap-3">
              {discountedProducts.map((p) => (
                <ProductCard key={p._id} product={p} forceDiscountBadge />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeasonalCuts;