import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPrinter } from 'react-icons/fi';
import customerAxios from '../../api/customerAxios';
import OrderReceipt from '../../components/account/OrderReceipt';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchOrder = () => {
    customerAxios
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data.order))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      await customerAxios.patch(`/orders/${id}/cancel`);
      fetchOrder();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Unable to cancel this order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!order) return <p className="max-w-4xl mx-auto px-4 py-10 text-sm text-muted">Order not found.</p>;

  const canCancel =
    !['delivered', 'cancelled', 'shipped'].includes(order.orderStatus) && new Date() < new Date(order.cancellableUntil);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* This row and everything below the bill is hidden on print - only the
          receipt itself (#order-receipt-print) is sent to the printer. */}
      <div className="no-print flex items-center justify-between mb-4">
        <p className="text-xs text-muted">
          <Link to="/orders" className="hover:text-brand">
            My Orders
          </Link>{' '}
          &gt; Bill
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-brand"
        >
          <FiPrinter size={13} /> Print Receipt
        </button>
      </div>

      <div id="order-receipt-print">
        <OrderReceipt order={order} />
      </div>

      {canCancel && (
        <div className="no-print mt-6 bg-gold/15 border border-gold/40 rounded-md p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-gold">
            You can cancel this order until {new Date(order.cancellableUntil).toLocaleTimeString()}.
          </p>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="border border-charcoal/30 text-charcoal text-xs tracking-widest px-5 py-2.5 rounded-md hover:bg-charcoal/10 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {cancelling ? 'CANCELLING...' : 'CANCEL ORDER'}
          </button>
        </div>
      )}
      {cancelError && <p className="no-print text-sm text-charcoal mt-3">{cancelError}</p>}
    </div>
  );
};

export default OrderDetails;
