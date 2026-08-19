import { FiCalendar, FiMapPin, FiUser, FiShoppingBag, FiLock } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatPrice';

const STATUS_LABELS = {
  pending: 'Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// The printable bill - laid out to match the client's reference receipt
// design exactly: header, order/status row, shipping address, order details,
// a product table, totals, and a thank-you footer. It is completely responsive
// on mobile and small screen sizes.
const OrderReceipt = ({ order }) => {
  const statusLabel = STATUS_LABELS[order.orderStatus] || order.orderStatus;

  return (
    <div className="bg-white border border-cream-200 rounded-md p-4 sm:p-10 max-w-3xl mx-auto shadow-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl sm:text-4xl tracking-wide text-ink">AL SA'I</h1>
        <p className="text-[9px] sm:text-xs tracking-[0.35em] text-muted mt-1">INTERNATIONAL</p>
      </div>

      {/* Order number + status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <h2 className="font-serif text-lg sm:text-2xl text-ink">Order #{order.orderNumber}</h2>
        <span className="flex-shrink-0 border border-gold/50 bg-gold/10 text-xs px-3 py-1 rounded-md text-ink font-medium">
          Status: <span className="font-semibold text-gold">{statusLabel}</span>
        </span>
      </div>
      <p className="flex items-center gap-1.5 text-xs sm:text-sm text-muted mb-5">
        <FiCalendar size={13} className="flex-shrink-0" />
        <span>
          Order Placed At:{' '}
          {new Date(order.createdAt).toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
      </p>

      <hr className="border-cream-200 mb-5" />

      {/* Shipping address */}
      <div className="mb-6">
        <p className="flex items-center gap-1.5 text-xs tracking-widest text-gold font-medium mb-2">
          <FiMapPin size={13} /> SHIPPING ADDRESS
        </p>
        <div className="text-xs sm:text-sm text-ink space-y-0.5">
          <p className="font-medium">{order.shippingAddress.fullName}</p>
          <p className="break-words">{order.shippingAddress.addressLine}</p>
          <p>
            {order.shippingAddress.city}
            {order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ''}
          </p>
          <p>{order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Order details box */}
      <div className="border border-cream-200 rounded-md p-4 sm:p-5 mb-6">
        <p className="flex items-center gap-1.5 text-xs tracking-widest text-gold font-medium mb-3">
          <FiUser size={13} /> ORDER DETAILS
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm">
          <div className="flex justify-between sm:justify-start sm:gap-3">
            <span className="text-muted flex-shrink-0">Full Name</span>
            <span className="text-ink font-medium text-right sm:text-left">{order.shippingAddress.fullName}</span>
          </div>
          <div className="flex justify-between sm:justify-start sm:gap-3">
            <span className="text-muted flex-shrink-0">CNIC</span>
            <span className="text-ink text-right sm:text-left">{order.shippingAddress.cnic}</span>
          </div>
          <div className="flex justify-between sm:justify-start sm:gap-3">
            <span className="text-muted flex-shrink-0">Email</span>
            <span className="text-ink truncate max-w-[180px] sm:max-w-none text-right sm:text-left">{order.shippingAddress.email}</span>
          </div>
          <div className="flex justify-between sm:justify-start sm:gap-3">
            <span className="text-muted flex-shrink-0">Payment Method</span>
            <span className="text-ink capitalize text-right sm:text-left">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between sm:justify-start sm:gap-3">
            <span className="text-muted flex-shrink-0">Phone</span>
            <span className="text-ink text-right sm:text-left">{order.shippingAddress.phone}</span>
          </div>
        </div>
      </div>

      {/* Product details box */}
      <div className="border border-cream-200 rounded-md p-4 sm:p-5 mb-6">
        <p className="flex items-center gap-1.5 text-xs tracking-widest text-gold font-medium mb-3">
          <FiShoppingBag size={13} /> PRODUCT DETAILS
        </p>

        {/* Mobile items view (< sm) */}
        <div className="block sm:hidden space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="pb-3 border-b border-cream-100 last:border-0 space-y-1">
              <div className="flex justify-between items-start gap-2">
                <span className="font-medium text-xs text-ink">
                  {item.name}
                  {item.size ? <span className="text-muted font-normal"> ({item.size})</span> : ''}
                </span>
                <span className="text-xs font-semibold text-ink flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-muted">
                <span>SKU: {item.sku || 'N/A'}</span>
                <span>
                  {item.quantity} x {formatPrice(item.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop items table (>= sm) */}
        <div className="hidden sm:block overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-charcoal text-cream-100 text-xs tracking-wide">
                <th className="text-left font-normal py-2.5 px-3">PRODUCT</th>
                <th className="text-left font-normal py-2.5 px-3">SKU</th>
                <th className="text-left font-normal py-2.5 px-3">QTY</th>
                <th className="text-right font-normal py-2.5 px-3">UNIT PRICE</th>
                <th className="text-right font-normal py-2.5 px-3">TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-cream-100 last:border-0">
                  <td className="py-3 px-3 text-ink">
                    {item.name}
                    {item.size ? <span className="text-muted"> ({item.size})</span> : ''}
                  </td>
                  <td className="py-3 px-3 text-muted">{item.sku}</td>
                  <td className="py-3 px-3 text-ink">{item.quantity}</td>
                  <td className="py-3 px-3 text-ink text-right">{formatPrice(item.price)}</td>
                  <td className="py-3 px-3 text-ink text-right">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-1.5 text-xs sm:text-sm sm:max-w-xs ml-auto mt-4 pt-4 border-t border-cream-200">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span className="text-ink">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-gold">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted">
            <span>Shipping Charges</span>
            <span className="text-ink">{order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge)}</span>
          </div>
          {order.codFee > 0 && (
            <div className="flex justify-between text-muted">
              <span>Cash on Delivery Fee</span>
              <span className="text-ink">{formatPrice(order.codFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm sm:text-base font-semibold pt-2 border-t border-cream-200">
            <span className="text-ink">TOTAL</span>
            <span className="text-gold">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Thank you footer */}
      <div className="border border-dashed border-gold/50 rounded-md py-5 px-4 text-center">
        <FiLock size={18} className="text-gold mx-auto mb-2" />
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="h-px w-6 sm:w-12 bg-gold/40" />
          <h3 className="font-serif text-base sm:text-xl text-ink">Thank You For Your Order!</h3>
          <span className="h-px w-6 sm:w-12 bg-gold/40" />
        </div>
        <p className="text-xs sm:text-sm text-muted">We appreciate your trust in AL SA'I.</p>
        <p className="text-xs sm:text-sm text-muted">Your satisfaction is our priority.</p>
      </div>
    </div>
  );
};

export default OrderReceipt;
