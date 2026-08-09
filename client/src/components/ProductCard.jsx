import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import customerAxios from '../api/customerAxios';
import { formatPrice } from '../utils/formatPrice';
import { driveImg } from '../utils/driveImg';

const ProductCard = ({ product, mediaMode = 'image' }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const productHref = `/product/${product.slug}`;
  const [selectedSize] = useState(product.sizes?.[0]);
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!selectedSize) return null;

  const discount = selectedSize.salePrice ? Math.round((1 - selectedSize.salePrice / selectedSize.price) * 100) : 0;
  const badge = product.isBestSeller ? 'BEST SELLER' : product.isNewArrival ? 'NEW' : discount > 0 ? `${discount}% OFF` : null;
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
      <div className="relative aspect-[3/4] bg-cream-100 overflow-hidden mb-3">
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
      </div>

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

      <div className="flex items-center gap-2 mb-2 max-480:flex-col max-480:items-start max-480:gap-0.5">
        <span className="text-sm font-medium text-ink max-480:order-1">
          {formatPrice(selectedSize.salePrice || selectedSize.price)}
        </span>
        {selectedSize.salePrice ? (
          <span className="text-xs text-muted line-through max-480:order-2">{formatPrice(selectedSize.price)}</span>
        ) : (
          <span className="hidden max-480:block max-480:order-2 text-xs leading-4">&nbsp;</span>
        )}
        <span className="text-xs text-muted max-480:order-3">{selectedSize.size}</span>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={outOfStock}
        className="w-full border border-brand text-brand text-xs tracking-wide py-2 rounded-md hover:bg-brand hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand"
      >
        {outOfStock ? 'OUT OF STOCK' : justAdded ? 'ADDED ✓' : 'ADD TO CART'}
      </button>
    </div>
  );
};

export default ProductCard;
