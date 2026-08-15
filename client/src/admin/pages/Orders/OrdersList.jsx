import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiDownload, FiEye, FiPrinter, FiMail, FiRefreshCw, FiBox } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';
import { formatPrice } from '../../../utils/formatPrice';

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const OrdersList = () => {
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState(urlParams.get('search') || '');
  // Keeps this tab's own search box in sync with the header search bar - the
  // header only ever updates the URL for whichever tab is currently open, so
  // this effect is what actually applies that query to this page's data.
  useEffect(() => {
    const fromUrl = urlParams.get('search') || '';
    setSearch((current) => (current === fromUrl ? current : fromUrl));
  }, [urlParams]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/orders', { params: { status, search: search || undefined, page, limit: 10 } })
      .then(({ data }) => {
        setOrders(data.data.orders);
        setCounts(data.data.counts);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, search, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <div className="flex items-center justify-between max-480:flex-col max-480:items-stretch mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Orders</h1>
          <p className="text-xs text-muted">Dashboard &gt; Orders</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const rows = [['Order Number', 'Customer', 'Payment', 'Amount', 'Status', 'Date']];
            orders.forEach((o) =>
              rows.push([
                o.orderNumber,
                o.customer?.fullName || o.shippingAddress?.fullName,
                o.paymentMethod,
                o.total,
                o.orderStatus,
                new Date(o.createdAt).toISOString().slice(0, 10),
              ])
            );
            const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'orders.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-1.5 border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 rounded-md hover:border-ink max-480:w-full max-480:justify-center"
        >
          <FiDownload size={14} /> EXPORT
        </button>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 min-1471:grid-cols-7 gap-3 mb-6">
        <StatCard icon={FiBox} label="All Orders" value={counts.all ?? 0} tone="ink" />
        <StatCard label="Pending" value={counts.pending ?? 0} tone="gold" />
        <StatCard label="Confirmed" value={counts.confirmed ?? 0} tone="green" />
        <StatCard label="Processing" value={counts.processing ?? 0} tone="brand" />
        <StatCard label="Packed" value={counts.packed ?? 0} tone="ink" />
        <StatCard label="Shipped" value={counts.shipped ?? 0} tone="green" />
        <StatCard label="Delivered" value={counts.delivered ?? 0} tone="green" />
      </div>

      <div className="bg-white border border-cream-200 rounded-md">
        <FilterTabs breakpoint={820} tabs={TABS} active={status} onChange={(key) => { setStatus(key); setPage(1); }} />

        <div className="p-4 border-b border-cream-200 flex flex-col max-820:flex-col min-821:flex-row gap-3 max-820:items-stretch min-821:items-center min-821:justify-between">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              setUrlParams((prev) => {
                const next = new URLSearchParams(prev);
                if (e.target.value) next.set('search', e.target.value);
                else next.delete('search');
                return next;
              }, { replace: true });
            }}
            placeholder="Search order #, customer name, or phone..."
            className="w-full sm:max-w-xs px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <p className="text-xs text-muted flex-shrink-0">Orders older than 50 days are automatically archived from this view.</p>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No orders found.</p>
        ) : (
          <StackTable
            breakpoint={1180}
            rows={orders}
            rowKey={(o) => o._id}
            columns={[
              { key: 'orderNumber', label: 'Order Number', render: (o) => <span className="text-ink font-medium whitespace-nowrap">#{o.orderNumber}</span> },
              { key: 'customer', label: 'Customer', render: (o) => o.customer?.fullName || o.shippingAddress?.fullName },
              { key: 'payment', label: 'Payment', render: (o) => <span className="uppercase text-xs">{o.paymentMethod}</span> },
              { key: 'amount', label: 'Amount', render: (o) => formatPrice(o.total) },
              { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.orderStatus} /> },
              { key: 'date', label: 'Date', render: (o) => new Date(o.createdAt).toLocaleDateString() },
            ]}
            actions={(o) => (
              <>
                <Link to={`/admin/orders/${o._id}`} className="hover:text-brand" title="View">
                  <FiEye size={15} />
                </Link>
                <button type="button" onClick={() => navigate(`/admin/orders/${o._id}?print=1`)} className="hover:text-brand" title="Print">
                  <FiPrinter size={15} />
                </button>
                <a href={`mailto:${o.customer?.email || ''}`} className="hover:text-brand" title="Email customer">
                  <FiMail size={15} />
                </a>
                <button type="button" onClick={fetchOrders} className="hover:text-brand" title="Refresh">
                  <FiRefreshCw size={15} />
                </button>
              </>
            )}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default OrdersList;