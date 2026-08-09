import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import customerAxios from '../../api/customerAxios';
import { formatPrice } from '../../utils/formatPrice';
import { driveImg } from '../../utils/driveImg';
import SuccessStep from '../../components/checkout/SuccessStep';

const FREE_SHIPPING_THRESHOLD = 10000;
const FLAT_SHIPPING_CHARGE = 250;
const COD_FEE = 150;

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', description: 'Pay with cash when your order is delivered to your doorstep.' },
  { value: 'easypaisa', label: 'EasyPaisa', description: 'You will be redirected to EasyPaisa to complete your payment.' },
  { value: 'jazzcash', label: 'JazzCash', description: 'You will be redirected to JazzCash to complete your payment.' },
];

// A single simple form - name, phone, email, address, payment method - no
// multi-step wizard, no saved-address book, no coupon field. Placing the
// order shows the bill right there.
const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    cnic: user?.cnic || '',
    addressLine: '',
    city: '',
    province: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [order, setOrder] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_CHARGE;
  const codFee = paymentMethod === 'cod' ? COD_FEE : 0;
  const total = subtotal + shippingCharge + codFee;

  if (items.length === 0 && !order) {
    navigate('/cart', { replace: true });
    return null;
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const { data } = await customerAxios.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        ...form,
        paymentMethod,
      });
      setOrder(data.data.order);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong placing your order.');
    } finally {
      setPlacing(false);
    }
  };

  if (order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <SuccessStep order={order} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl text-ink mb-1">Checkout</h1>
      <p className="text-sm text-muted mb-8">Enter your details to place your order.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="fullName"
              required
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <input
              name="phone"
              required
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <input
              name="cnic"
              required
              placeholder="CNIC (12345-1234567-1)"
              pattern="\d{5}-\d{7}-\d{1}"
              title="Enter CNIC in the format 12345-1234567-1"
              value={form.cnic}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <input
            name="addressLine"
            required
            placeholder="Address"
            value={form.addressLine}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              name="city"
              required
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <input
              name="province"
              placeholder="State / Province (optional)"
              value={form.province}
              onChange={handleChange}
              className="px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="pt-2">
            <p className="text-xs tracking-widest text-muted mb-3">PAYMENT METHOD</p>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`block border rounded-md p-4 cursor-pointer transition-colors ${
                    paymentMethod === m.value ? 'border-brand' : 'border-cream-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)}
                      className="mt-1 text-brand focus:ring-brand/40"
                    />
                    <div>
                      <p className="text-sm text-ink font-medium">{m.label}</p>
                      <p className="text-xs text-muted">{m.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-charcoal">{error}</p>}

          <button
            type="submit"
            disabled={placing}
            className="w-full bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3.5 rounded-md transition-colors disabled:opacity-60"
          >
            {placing ? 'PLACING ORDER...' : 'PLACE ORDER'}
          </button>
        </form>

        <div className="bg-cream-100 rounded-md p-6 h-fit">
          <h2 className="font-serif text-lg text-ink mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 pb-3 border-b border-cream-200/70">
                {item.image && <img src={driveImg(item.image)} alt={item.name} className="w-12 h-12 rounded-md object-cover bg-white" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm text-ink flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span className="text-ink">{shippingCharge === 0 ? 'Free' : formatPrice(shippingCharge)}</span>
            </div>
            {codFee > 0 && (
              <div className="flex justify-between text-muted">
                <span>Cash on Delivery Fee</span>
                <span className="text-ink">{formatPrice(codFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-base pt-3 border-t border-cream-200">
              <span className="text-ink">Total</span>
              <span className="text-brand">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
