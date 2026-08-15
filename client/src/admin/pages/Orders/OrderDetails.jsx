import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { FiPrinter, FiArrowLeft, FiX } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatusBadge from '../../components/common/StatusBadge';
import { formatPrice } from '../../../utils/formatPrice';
import { driveImg } from '../../../utils/driveImg';
import OrderReceipt from '../../../components/account/OrderReceipt';

const ORDER_FLOW = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const OrderDetails = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [customerTotalOrders, setCustomerTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrder = useCallback(() => {
    adminAxios.get(`/orders/${id}`).then(({ data }) => {
      setOrder(data.data.order);
      setCustomerTotalOrders(data.data.customerTotalOrders);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!loading && order && searchParams.get('print') === '1') {
      // Wait a tick so the receipt block has actually painted before
      // the browser's print dialog captures the page.
      const timer = setTimeout(() => {
        window.print();
        searchParams.delete('print');
        setSearchParams(searchParams, { replace: true });
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, order, searchParams, setSearchParams]);

  const handleStatusChange = async (orderStatus) => {
    setSaving(true);
    try {
      await adminAxios.put(`/orders/${id}/status`, { orderStatus });
      fetchOrder();
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentStatusChange = async (paymentStatus) => {
    setSaving(true);
    try {
      await adminAxios.put(`/orders/${id}/payment-status`, { paymentStatus });
      fetchOrder();
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await adminAxios.post(`/orders/${id}/notes`, { text: noteText.trim() });
      setNoteText('');
      fetchOrder();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order and restore stock? This cannot be undone.')) return;
    setSaving(true);
    try {
      await adminAxios.post(`/orders/${id}/cancel`);
      fetchOrder();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return <p className="text-sm text-muted">Order not found.</p>;

  const currentStepIndex = ORDER_FLOW.indexOf(order.orderStatus);

  return (
    <div>
      {/* Everything below is the admin's working view - hidden entirely when
          printing. The actual receipt lives in the hidden block further
          down and is the only thing visibility:visible targets (see the
          #order-receipt-print print rules in index.css), which is what was
          missing here before: this page never rendered anything with that
          id, so "Print Receipt" produced a blank page. */}
      <div className="no-print">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <Link to="/admin/orders" className="text-xs text-muted hover:text-brand flex items-center gap-1 mb-2">
            <FiArrowLeft size={12} /> Back to Orders
          </Link>
          <h1 className="font-serif text-2xl text-ink">Order Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 hover:border-ink"
          >
            <FiPrinter size={14} /> PRINT RECEIPT
          </button>
          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1.5 bg-charcoal hover:bg-charcoal-light text-white text-xs tracking-widest px-4 py-2.5 disabled:opacity-50"
            >
              <FiX size={14} /> CANCEL ORDER
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-cream-200 p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-serif text-lg text-ink">Order #{order.orderNumber}</p>
          <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          <span className="font-serif text-xl text-ink">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-cream-200 p-5">
          <p className="text-xs tracking-widest text-muted mb-3">CUSTOMER DETAILS</p>
          <p className="text-sm text-ink font-medium">{order.customer?.fullName}</p>
          <p className="text-xs text-muted">{order.customer?.email}</p>
          <p className="text-xs text-muted">{order.customer?.phone}</p>
          <p className="text-xs text-muted mt-2">Customer Since {order.customer?.createdAt ? new Date(order.customer.createdAt).toLocaleDateString() : '-'}</p>
          <p className="text-xs text-muted">Total Orders: {customerTotalOrders}</p>
        </div>

        <div className="bg-white border border-cream-200 p-5">
          <p className="text-xs tracking-widest text-muted mb-3">SHIPPING ADDRESS</p>
          <p className="text-sm text-ink">{order.shippingAddress?.fullName}</p>
          <p className="text-xs text-muted">{order.shippingAddress?.addressLine}</p>
          <p className="text-xs text-muted">
            {order.shippingAddress?.city}, {order.shippingAddress?.province}, {order.shippingAddress?.country}
          </p>
          <p className="text-xs text-muted mt-2">Phone: {order.shippingAddress?.phone}</p>
        </div>

        <div className="bg-white border border-cream-200 p-5">
          <p className="text-xs tracking-widest text-muted mb-3">PAYMENT METHOD</p>
          <p className="text-sm text-ink uppercase">{order.paymentMethod}</p>
          <div className="mt-2">
            <label className="text-xs text-muted block mb-1">Payment Status</label>
            <select
              value={order.paymentStatus}
              disabled={saving}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              className="text-sm border border-cream-200 px-3 py-2 bg-white w-full focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white border border-cream-200 p-5">
          <p className="text-xs tracking-widest text-muted mb-4">ORDERED PRODUCTS ({order.items.length})</p>
          <div className="space-y-3 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b border-cream-100 last:border-0">
                {item.image && <img src={driveImg(item.image)} alt={item.name} className="w-12 h-12 object-cover bg-cream-100 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{item.name}</p>
                  <p className="text-xs text-muted">
                    Size: {item.size} · SKU: {item.sku}
                  </p>
                </div>
                <p className="text-sm text-muted">{formatPrice(item.price)}</p>
                <p className="text-sm text-muted">×{item.quantity}</p>
                <p className="text-sm text-ink font-medium w-24 text-right">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-sm pt-3 border-t border-cream-200">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping Charge</span>
              <span>{formatPrice(order.shippingCharge)}</span>
            </div>
            <div className="flex justify-between text-ink font-medium text-base pt-2 border-t border-cream-200">
              <span>Total Amount</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-cream-200">
            <p className="text-xs tracking-widest text-muted mb-3">ORDER NOTES</p>
            <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a note about this order..."
                className="flex-1 border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button
                type="submit"
                disabled={saving || !noteText.trim()}
                className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 disabled:opacity-40"
              >
                ADD NOTE
              </button>
            </form>
            {order.notes?.length > 0 && (
              <div className="space-y-3">
                {[...order.notes].reverse().map((n, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-ink">{n.text}</p>
                    <p className="text-xs text-muted">
                      {n.adminName} · {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-cream-200 p-5">
          <p className="text-xs tracking-widest text-muted mb-4">ORDER TIMELINE</p>
          {order.orderStatus === 'cancelled' ? (
            <p className="text-sm text-charcoal">This order was cancelled{order.cancelledBy ? ` by ${order.cancelledBy}` : ''}.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {ORDER_FLOW.map((step, i) => {
                const entry = order.statusTimeline.find((t) => t.status === step);
                const reached = i <= currentStepIndex;
                return (
                  <div key={step} className="flex gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${reached ? 'bg-brand' : 'bg-cream-200'}`} />
                    <div>
                      <p className={`text-sm capitalize ${reached ? 'text-ink' : 'text-muted'}`}>{step}</p>
                      <p className="text-xs text-muted">{entry ? new Date(entry.timestamp).toLocaleString() : 'Pending'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
            <div>
              <label className="text-xs text-muted block mb-1">Update Status</label>
              <select
                value={order.orderStatus}
                disabled={saving}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm border border-cream-200 px-3 py-2 bg-white w-full focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {ORDER_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      </div>

      <div id="order-receipt-print" className="hidden print:block">
        <OrderReceipt order={order} />
      </div>
    </div>
  );
};

export default OrderDetails;
