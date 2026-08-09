import { useState, useEffect } from 'react';
import publicAxios from '../api/publicAxios';
import { formatPrice } from '../utils/formatPrice';
import { driveImg } from '../utils/driveImg';
import { Link } from 'react-router-dom';

const GiftSets = () => {
  const [giftSets, setGiftSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAxios
      .get('/gift-sets?limit=50')
      .then(({ data }) => setGiftSets(data.data.giftSets))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-cream-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs tracking-widest text-brand mb-1">CURATED SETS</p>
          <h1 className="font-serif text-3xl max-480:text-2xl text-ink">Gift Sets</h1>
          <p className="text-sm text-muted mt-1 max-w-lg">
            Thoughtfully paired fragrances, presented in signature AL SA&apos;I packaging - the perfect gift for every occasion.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : giftSets.length === 0 ? (
          <p className="text-sm text-muted text-center py-24">No gift sets available right now - check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-480:gap-3">
            {giftSets.map((g) => (
              <Link key={g._id} to={`/gift-sets/${g.slug}`} className="group block">
                <div className="aspect-square rounded-md overflow-hidden bg-cream-100 mb-3">
                  {g.mainImage && (
                    <img
                      src={driveImg(g.mainImage)}
                      alt={g.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <p className="text-sm text-ink">{g.name}</p>
                {g.includedProducts?.length > 0 && (
                  <p className="text-xs text-muted mb-1">
                    {g.includedProducts.length} x {g.includedProducts[0].size}
                  </p>
                )}
                <p className="text-sm text-ink font-medium">{formatPrice(g.price)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftSets;
