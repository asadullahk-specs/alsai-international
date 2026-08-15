import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { driveImg } from '../utils/driveImg';

// A quick "what did I just add" preview, opened when the cart icon is
// clicked. Slides in from the right edge of the screen as a full-height
// sidebar (with a dimmed backdrop behind it) rather than a small dropdown -
// lets the shopper glance at their selection before committing to the full
// Cart page, rather than being dropped straight onto it every time.
const CartPreview = ({ onClose }) => {
  const { items, subtotal, removeItem } = useCart();
  const navigate = useNavigate();

  // Prevents the page behind the sidebar from scrolling while it's open.
  // (The `scrollbar-gutter: stable` rule on <html> means hiding overflow
  // here never changes the viewport width, so nothing shifts.)
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const goToCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close cart preview"
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/40"
      />

      <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col animate-[cartSlideIn_0.3s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 flex-shrink-0">
          <span className="text-sm font-medium text-ink">Your Bag ({items.length})</span>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink">
            <FiX size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted text-center py-10 px-5">Your bag is empty.</p>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 px-5 py-4 border-b border-cream-100 last:border-0">
                <div className="w-16 h-16 bg-cream-100 flex-shrink-0 overflow-hidden">
                  {item.image && <img src={driveImg(item.image)} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{item.name}</p>
                  <p className="text-xs text-muted">{item.size} · Qty {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-ink">{formatPrice(item.price * item.quantity)}</p>
                  <button type="button" onClick={() => removeItem(item.productId, item.size)} className="text-[11px] text-muted hover:text-charcoal">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="p-5 border-t border-cream-200 flex-shrink-0">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted">Subtotal</span>
              <span className="text-ink font-medium">{formatPrice(subtotal)}</span>
            </div>
            <button type="button" onClick={goToCart} className="w-full bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3.5 transition-colors">
              GO TO CART
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPreview;