import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiRotateCcw } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';
import { formatPrice } from '../../../utils/formatPrice';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'Requested', label: 'Requested' },
  { key: 'Under Review', label: 'Under Review' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Return In Transit', label: 'In Transit' },
  { key: 'Received', label: 'Received' },
  { key: 'Refund Pending', label: 'Refund Pending' },
  { key: 'Refunded', label: 'Refunded' },
  { key: 'Exchange Completed', label: 'Exchange Completed' },
  { key: 'Rejected', label: 'Rejected' },
  { key: 'Closed', label: 'Closed' },
];

const statusKey = (s) => s.toLowerCase().replace(/ /g, '_');

const ReturnsList = () => {
  const [returns, setReturns] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReturns = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/returns', { params: { status, search: search || undefined, page, limit: 10 } })
      .then(({ data }) => {
        setReturns(data.data.returns);
        setCounts(data.data.counts);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, search, page]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-ink">Returns &amp; Refunds</h1>
        <p className="text-xs text-muted">Dashboard &gt; Orders &gt; Returns &amp; Refunds</p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={FiRotateCcw} label="All Returns" value={counts.all ?? 0} tone="ink" />
        <StatCard label="Requested" value={counts.Requested ?? 0} tone="gold" />
        <StatCard label="In Progress" value={(counts['Under Review'] || 0) + (counts.Approved || 0) + (counts['Return In Transit'] || 0) + (counts.Received || 0) + (counts['Refund Pending'] || 0)} tone="brand" />
        <StatCard label="Refunded" value={counts.Refunded ?? 0} tone="charcoal" />
      </div>

      <div className="bg-white border border-cream-200 rounded-md">
        <FilterTabs breakpoint={1600} tabs={TABS} active={status} onChange={(key) => { setStatus(key); setPage(1); }} />

        <div className="p-4 border-b border-cream-200">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search return ID or order number..."
            className="w-full sm:max-w-xs px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : returns.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No return requests found.</p>
        ) : (
          <StackTable
            breakpoint={1180}
            rows={returns}
            rowKey={(r) => r._id}
            columns={[
              { key: 'returnId', label: 'Return ID', render: (r) => <span className="text-ink font-medium whitespace-nowrap">{r.returnId}</span> },
              { key: 'orderNumber', label: 'Order ID', render: (r) => `#${r.orderNumber}` },
              { key: 'customer', label: 'Customer', render: (r) => r.customer?.fullName || '—' },
              { key: 'productName', label: 'Product', render: (r) => r.productName },
              { key: 'quantity', label: 'Quantity', render: (r) => r.quantity },
              { key: 'reason', label: 'Reason', render: (r) => <span className="truncate block max-w-[160px]">{r.reason}</span> },
              { key: 'requestedDate', label: 'Requested Date', render: (r) => new Date(r.requestedDate).toLocaleDateString() },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={statusKey(r.status)} /> },
              { key: 'refundAmount', label: 'Refund Amount', render: (r) => formatPrice(r.refundAmount) },
            ]}
            actions={(r) => (
              <Link to={`/admin/returns/${r._id}`} className="hover:text-brand" title="View">
                <FiEye size={15} />
              </Link>
            )}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default ReturnsList;