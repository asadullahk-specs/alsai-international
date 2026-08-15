import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEye, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';
import { formatPrice } from '../../../utils/formatPrice';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'Draft', label: 'Draft' },
  { key: 'Ordered', label: 'Ordered' },
  { key: 'Partially Received', label: 'Partially Received' },
  { key: 'Received', label: 'Received' },
  { key: 'Cancelled', label: 'Cancelled' },
];

const statusKey = (s) => s.toLowerCase().replace(/ /g, '_');

const PurchasesList = () => {
  const [purchases, setPurchases] = useState([]);
  const [counts, setCounts] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/purchases', { params: { status, search: search || undefined, page, limit: 10 } })
      .then(({ data }) => {
        setPurchases(data.data.purchases);
        setCounts(data.data.counts);
        setTotalValue(data.data.totalValue);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, search, page]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase? This cannot be undone.')) return;
    try {
      await adminAxios.delete(`/purchases/${id}`);
      fetchPurchases();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Unable to delete this purchase.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between max-480:flex-col max-480:items-stretch mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Purchases</h1>
          <p className="text-xs text-muted">Dashboard &gt; Purchases</p>
        </div>
        <Link
          to="/admin/purchases/new"
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 rounded-md transition-colors max-480:w-full max-480:justify-center"
        >
          <FiPlus size={14} /> NEW PURCHASE
        </Link>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon={FiShoppingCart} label="All Purchases" value={counts.all ?? 0} tone="ink" />
        <StatCard label="Received" value={counts.Received ?? 0} tone="brand" />
        <StatCard label="Total Value" value={formatPrice(totalValue)} tone="gold" />
      </div>

      <div className="bg-white border border-cream-200 rounded-md">
        <FilterTabs breakpoint={900} tabs={TABS} active={status} onChange={(key) => { setStatus(key); setPage(1); }} />

        <div className="p-4 border-b border-cream-200">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search purchase ID or supplier reference..."
            className="w-full sm:max-w-xs px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : purchases.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No purchases found.</p>
        ) : (
          <StackTable
            breakpoint={1180}
            rows={purchases}
            rowKey={(p) => p._id}
            columns={[
              { key: 'purchaseId', label: 'Purchase ID', render: (p) => <span className="text-ink font-medium whitespace-nowrap">{p.purchaseId}</span> },
              { key: 'supplier', label: 'Supplier', render: (p) => p.supplier?.name || '—' },
              { key: 'date', label: 'Date', render: (p) => new Date(p.purchaseDate).toLocaleDateString() },
              { key: 'items', label: 'Items', render: (p) => p.items.length },
              { key: 'quantity', label: 'Quantity', render: (p) => p.items.reduce((s, it) => s + it.quantity, 0) },
              { key: 'total', label: 'Total Amount', render: (p) => formatPrice(p.total) },
              { key: 'paymentStatus', label: 'Payment Status', render: (p) => <StatusBadge status={statusKey(p.paymentStatus)} /> },
              { key: 'purchaseStatus', label: 'Purchase Status', render: (p) => <StatusBadge status={statusKey(p.purchaseStatus)} /> },
            ]}
            actions={(p) => (
              <>
                <Link to={`/admin/purchases/${p._id}`} className="hover:text-brand" title="View">
                  <FiEye size={15} />
                </Link>
                {p.purchaseStatus === 'Draft' && (
                  <button type="button" onClick={() => handleDelete(p._id)} className="hover:text-charcoal" title="Delete">
                    <FiTrash2 size={15} />
                  </button>
                )}
              </>
            )}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default PurchasesList;