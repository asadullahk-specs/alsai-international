import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { driveImg } from '../utils/driveImg';

const FREE_SHIPPING_THRESHOLD = 10000;
const FLAT_SHIPPING_CHARGE = 250;

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shippingCharge = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_CHARGE;
  const total = subtotal + shippingCharge;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl text-ink mb-3">Your Cart is Empty</h1>
        <p className="text-muted text-sm mb-8">Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="inline-block bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-8 py-3 rounded-md transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl text-ink mb-1">Your Cart</h1>
      <p className="text-xs text-muted mb-8">
        <Link to="/" className="hover:text-brand">
          Home
        </Link>{' '}
        &gt; Cart
      </p>

      <div className="grid grid-cols-1 min-1281:grid-cols-3 gap-10">
        <div className="min-1281:col-span-2">
          {/* Desktop / tablet: table-style row (sm and up) */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 text-xs tracking-widest text-muted pb-3 border-b border-cream-200">
            <span>PRODUCT</span>
            <span>PRICE</span>
            <span>QUANTITY</span>
            <span>TOTAL</span>
            <span />
          </div>

          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="border-b border-cream-200 py-5">
              {/* Mobile: each field stacked on its own row */}
              <div className="sm:hidden space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted flex-shrink-0">Product</span>
                  <Link to={`/product/${item.slug}`} className="flex items-center gap-3 min-w-0 justify-end text-right">
                    <span className="text-sm text-ink truncate">{item.name}{item.size ? ` (${item.size})` : ''}</span>
                    {item.image && <img src={driveImg(item.image)} alt={item.name} className="w-10 h-10 object-cover bg-cream-100 flex-shrink-0" />}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Price</span>
                  <span className="text-sm text-ink">{formatPrice(item.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Quantity</span>
                  <div className="flex items-center border border-cream-200 w-fit">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="w-7 h-8 text-ink hover:text-brand"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, Math.min(item.maxStock || 99, item.quantity + 1))}
                      className="w-7 h-8 text-ink hover:text-brand"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Total</span>
                  <span className="text-sm font-medium text-ink">{formatPrice(item.price * item.quantity)}</span>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-muted hover:text-charcoal transition-colors"
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Tablet / desktop: single row grid */}
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center">
                <Link to={`/product/${item.slug}`} className="flex items-center gap-3 min-w-0">
                  {item.image && (
                    <img src={driveImg(item.image)} alt={item.name} className="w-16 h-16 object-cover bg-cream-100 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{item.name}</p>
                    <p className="text-xs text-muted">{item.size}</p>
                  </div>
                </Link>
                <span className="text-sm text-ink">{formatPrice(item.price)}</span>
                <div className="flex items-center border border-cream-200 w-fit">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                    className="w-7 h-8 text-ink hover:text-brand"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.size, Math.min(item.maxStock || 99, item.quantity + 1))}
                    className="w-7 h-8 text-ink hover:text-brand"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-medium text-ink">{formatPrice(item.price * item.quantity)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-muted hover:text-charcoal transition-colors"
                  aria-label="Remove item"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={clearCart} className="text-xs text-muted hover:text-charcoal mt-4">
            Clear Cart
          </button>
        </div>

        <div>
          <div className="bg-cream-100 rounded-md p-6">
            <h2 className="font-serif text-lg text-ink mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({items.length} items)</span>
                <span className="text-ink">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-ink">{shippingCharge === 0 ? 'Free' : formatPrice(shippingCharge)}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-3 border-t border-cream-200 mt-3">
                <span className="text-ink">Total</span>
                <span className="text-brand">{formatPrice(total)}</span>
              </div>
            </div>

            {amountToFreeShipping > 0 && (
              <p className="text-xs text-muted bg-white rounded-md p-3 mt-4">
                You are {formatPrice(amountToFreeShipping)} away from <span className="text-brand font-medium">FREE shipping</span>
              </p>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 rounded-md transition-colors mt-5"
            >
              PROCEED TO CHECKOUT
            </button>
            <Link to="/shop" className="block text-center text-xs text-muted hover:text-brand mt-3">
              ← Continue Shopping
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-cream-200 text-xs text-muted">
              <p>Complimentary Shipping on orders over PKR 10,000</p>
              <p>Secure Payments, 100% secure and encrypted</p>
              <p>Easy Returns, 7-day return policy</p>
              <p>Customer Support, we're here to help</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
