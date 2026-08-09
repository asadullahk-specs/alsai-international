import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import customerAxios from '../../api/customerAxios';
import { formatPrice } from '../../utils/formatPrice';
import OrderStatusBadge from '../../components/account/OrderStatusBadge';

const TABS = ['all', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrdersList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('status') || 'all';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = activeTab === 'all' ? '' : `?status=${activeTab}`;
    customerAxios
      .get(`/orders${query}`)
      .then(({ data }) => setOrders(data.data.orders))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-serif text-2xl text-ink mb-1">My Orders</h1>
      <p className="text-sm text-muted mb-6">View your order history and current status.</p>

      <div className="flex gap-1 border-b border-cream-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setSearchParams(tab === 'all' ? {} : { status: tab })}
            className={`px-4 py-2.5 max-520:px-2.5 max-520:py-2 text-xs max-520:text-[10px] tracking-wide capitalize border-b-2 flex-shrink-0 transition-colors ${
              activeTab === tab ? 'border-brand text-ink' : 'border-transparent text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted py-10 text-center">No orders here yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-cream-200 rounded-md p-4 hover:border-brand transition-colors"
            >
              <div>
                <p className="text-sm text-ink font-medium">#{o.orderNumber}</p>
                <p className="text-xs text-muted">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-ink">{formatPrice(o.total)}</span>
                <OrderStatusBadge status={o.orderStatus} />
                <span className="text-muted">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersList;
