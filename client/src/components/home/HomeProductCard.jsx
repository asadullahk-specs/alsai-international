import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import customerAxios from '../../api/customerAxios';
import { formatPrice } from '../../utils/formatPrice';
import { driveImg } from '../../utils/driveImg';

// The homepage keeps product cards deliberately clean per the client's request:
// no size selector, no add-to-cart button, no sale-price strike-through - just
// the visual, the name, a rating if there is one, and the 50ml price (or the
// first available size if a product has no 50ml option).
const HomeProductCard = ({ product, mediaMode = 'image' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const displaySize = product.sizes?.find((s) => s.size === '50ml') || product.sizes?.[0];
  if (!displaySize) return null;

  const badge = product.isBestSeller ? 'BEST SELLER' : product.isNewArrival ? 'NEW' : null;

  const handleToggleWishlist = () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${product.slug}` } });
      return;
    }
    const next = !wishlisted;
    setWishlisted(next);
    const request = next
      ? customerAxios.post(`/wishlist/${product._id}`)
      : customerAxios.delete(`/wishlist/${product._id}`);
    request.catch(() => setWishlisted(!next));
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-cream-100 overflow-hidden mb-3">
        {mediaMode === 'video' && product.video ? (
          <video src={driveImg(product.video)} className="w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <>
            {product.mainImage && (
              <img
                src={driveImg(product.mainImage)}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  hovered && product.hoverImage ? 'opacity-0' : 'opacity-100'
                }`}
              />
            )}
            {product.hoverImage && (
              <img
                src={driveImg(product.hoverImage)}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  hovered ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </>
        )}

        {badge && (
          <span className="absolute top-3 left-3 z-10 bg-charcoal text-white text-[10px] tracking-wide px-2 py-1">{badge}</span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleToggleWishlist();
          }}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-muted hover:text-brand transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart size={14} className={wishlisted ? 'fill-brand text-brand' : ''} />
        </button>
      </div>

      <h3 className="font-serif text-ink text-base mb-0.5 truncate">{product.name}</h3>

      {product.ratingCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-gold mb-1.5">
          <FiStar size={12} className="fill-gold" />
          <span className="text-ink">{product.ratingAverage.toFixed(1)}</span>
          <span className="text-muted">({product.ratingCount})</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">{displaySize.size}</span>
        <span className="text-sm font-medium text-ink">{formatPrice(displaySize.price)}</span>
      </div>
    </Link>
  );
};

export default HomeProductCard;
