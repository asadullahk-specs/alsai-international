import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import customerAxios from '../api/customerAxios';
import { formatPrice } from '../utils/formatPrice';
import { driveImg } from '../utils/driveImg';

const ProductCard = ({ product, mediaMode = 'image', forceDiscountBadge = false }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const productHref = `/product/${product.slug}`;
  const [selectedSize] = useState(product.sizes?.[0]);
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!selectedSize) return null;

  const hasSale = selectedSize.salePrice && Number(selectedSize.salePrice) < Number(selectedSize.price);
  const discount = hasSale ? Math.round((1 - selectedSize.salePrice / selectedSize.price) * 100) : 0;
  // On pages that specifically surface discounted items (Promotions), a
  // product's sale badge should win out over Best Seller/New so shoppers
  // immediately see the offer they came for, rather than a generic tag.
  const badge =
    forceDiscountBadge && discount > 0
      ? `${discount}% OFF`
      : product.isBestSeller
        ? 'BEST SELLER'
        : product.isNewArrival
          ? 'NEW'
          : discount > 0
            ? `${discount}% OFF`
            : null;
  const outOfStock = selectedSize.stock === 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem(product, selectedSize, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleToggleWishlist = () => {
    if (!user) {
      navigate('/login', { state: { from: productHref } });
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
    <div className="group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative aspect-square bg-cream-100 overflow-hidden mb-3">
        <Link to={productHref} className="absolute inset-0 block">
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
        </Link>

        {badge && (
          <span className="absolute top-3 left-3 z-10 bg-charcoal text-white text-[10px] tracking-wide px-2 py-1 rounded">
            {badge}
          </span>
        )}

        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-muted hover:text-brand transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart size={14} className={wishlisted ? 'fill-brand text-brand' : ''} />
        </button>

        {/* Size (e.g. "50ml") lives on the image itself, bottom-right - high contrast luxury theme tag */}
        <span className="absolute bottom-3 right-3 z-10 bg-charcoal/85 text-cream-100 backdrop-blur-sm border border-gold/40 text-[10px] font-medium tracking-widest px-2.5 py-1 rounded-sm shadow-md">
          {selectedSize.size}
        </span>

        {/* Desktop (>=1024px, Tailwind's lg): Add to Cart is a hover-revealed overlay */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`hidden lg:block absolute bottom-0 left-0 right-0 z-10 bg-brand text-white text-xs tracking-wide py-2.5 transition-all duration-300 hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 ${
            outOfStock ? 'bg-charcoal/70' : ''
          }`}
        >
          {outOfStock ? 'OUT OF STOCK' : justAdded ? 'ADDED ✓' : 'ADD TO CART'}
        </button>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={outOfStock}
        className="lg:hidden w-full border border-brand text-brand text-xs tracking-wide py-2 rounded-md hover:bg-brand hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-3"
      >
        {outOfStock ? 'OUT OF STOCK' : justAdded ? 'ADDED ✓' : 'ADD TO CART'}
      </button>

      <Link to={productHref} className="block">
        <h3 className="font-serif text-ink text-base mb-0.5 truncate">{product.name}</h3>
        {product.shortDescription && <p className="text-xs text-muted mb-1 truncate">{product.shortDescription}</p>}
      </Link>

      {product.ratingCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-gold mb-1.5">
          <FiStar size={12} className="fill-gold" />
          <span className="text-ink">{product.ratingAverage.toFixed(1)}</span>
          <span className="text-muted">({product.ratingCount})</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ink">{formatPrice(hasSale ? selectedSize.salePrice : selectedSize.price)}</span>
        {hasSale && <span className="text-xs text-muted line-through">{formatPrice(selectedSize.price)}</span>}
      </div>
    </div>
  );
};

export default ProductCard;
