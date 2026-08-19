import { useState, useEffect } from 'react';
import publicAxios from '../api/publicAxios';
import { formatPrice } from '../utils/formatPrice';
import { driveImg } from '../utils/driveImg';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import BrandSpinner from '../components/BrandSpinner';

const GiftSets = () => {
  usePageTitle('GiftSets');
  const [giftSets, setGiftSets] = useState([]);
  const [bannerImage, setBannerImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([publicAxios.get('/gift-sets?limit=50'), publicAxios.get('/layout')])
      .then(([giftSetsRes, layoutRes]) => {
        setGiftSets(giftSetsRes.data.data.giftSets);
        setBannerImage(layoutRes.data.data.websiteContent?.giftSetPage?.bannerImage || '');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      {/* Same fixed-height frame convention used across the site's other top
          banners (Shop, Promotions, About), with items vertically centered
          so the heading/breadcrumb never sits underneath the fixed navbar. */}
      <div className="bg-cream-100 relative overflow-hidden h-[532px] sm:h-[616px] md:h-[672px] flex items-center">
        {bannerImage && (
          <img src={driveImg(bannerImage)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Dark shade over the banner image - matches the homepage hero, and
            keeps the transparent navbar's white text/icons legible. */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="max-w-7xl mx-auto px-4 relative w-full">
          <p className="text-xs text-cream-100/80 mb-3">
            <Link to="/" className="hover:text-gold">Home</Link> / Gift Sets
          </p>
          {/* <p className="text-xs tracking-widest text-gold mb-1">CURATED SETS</p> */}
          <h1 className="font-serif text-3xl sm:text-4xl max-480:text-2xl text-white">Gift Sets</h1>
          <p className="text-sm text-cream-100/90 mt-2 max-w-lg">
            Thoughtfully paired fragrances, presented in signature AL SA&apos;I packaging - the perfect gift for every occasion.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <BrandSpinner />
          </div>
        ) : giftSets.length === 0 ? (
          <p className="text-sm text-muted text-center py-24">No gift sets available right now - check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-480:gap-3">
            {giftSets.map((g) => (
              <Link key={g._id} to={`/gift-sets/${g.slug}`} className="group block">
                <div className="aspect-square rounded-md overflow-hidden bg-cream-100 mb-3 relative">
                  {g.mainImage && (
                    <img
                      src={driveImg(g.mainImage)}
                      alt={g.name}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${
                        g.hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                      }`}
                    />
                  )}
                  {g.hoverImage && (
                    <img
                      src={driveImg(g.hoverImage)}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
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