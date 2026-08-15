import { useState, useEffect, useCallback } from 'react';
import { FiPackage, FiAlertTriangle, FiXCircle, FiDollarSign, FiEdit2, FiClock } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';
import { formatPrice } from '../../../utils/formatPrice';

const TABS = [
  { key: 'all', label: 'All Inventory' },
  { key: 'low_stock', label: 'Low Stock' },
  { key: 'out_of_stock', label: 'Out of Stock' },
];

const AdjustStockModal = ({ row, onClose, onSaved }) => {
  const [changeType, setChangeType] = useState('restock');
  const [quantityChange, setQuantityChange] = useState('');
  const [costPrice, setCostPrice] = useState(row.costPrice || '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const qty = changeType === 'restock' ? Math.abs(Number(quantityChange)) : -Math.abs(Number(quantityChange));
      await adminAxios.post('/inventory/adjust', {
        productId: row.productId,
        size: row.size,
        changeType,
        quantityChange: qty,
        costPrice: changeType === 'restock' ? costPrice : undefined,
        note,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6">
        <h2 className="font-serif text-lg text-ink mb-1">Adjust Stock</h2>
        <p className="text-xs text-muted mb-4">{row.productName} · {row.size}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-muted block mb-1">Type</label>
            <select value={changeType} onChange={(e) => setChangeType(e.target.value)} className="w-full border border-cream-200 px-3 py-2.5 text-sm">
              <option value="restock">Restock (add stock)</option>
              <option value="adjustment">Manual Adjustment (remove stock)</option>
              <option value="correction">Correction</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Quantity</label>
            <input
              required
              type="number"
              min="1"
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              className="w-full border border-cream-200 px-3 py-2.5 text-sm"
            />
          </div>
          {changeType === 'restock' && (
            <div>
              <label className="text-xs text-muted block mb-1">Cost Price per Unit (PKR)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full border border-cream-200 px-3 py-2.5 text-sm"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-muted block mb-1">Note (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-cream-200 px-3 py-2.5 text-sm" />
          </div>
          {error && <p className="text-xs text-charcoal">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-2.5">
              CANCEL
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-2.5 disabled:opacity-50">
              {saving ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(null);
  const [historyRow, setHistoryRow] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchInventory = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/inventory', { params: { status, search: search || undefined, page, limit: 10 } })
      .then(({ data }) => {
        setRows(data.data.rows);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, search, page]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const openHistory = async (row) => {
    setHistoryRow(row);
    const { data } = await adminAxios.get('/inventory/history', { params: { productId: row.productId, limit: 15 } });
    setHistory(data.data.history.filter((h) => h.size === row.size));
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-6">Inventory Management</h1>

      <div className="grid grid-cols-1 xs:grid-cols-2 min-1281:grid-cols-4 gap-3 mb-6">
        <StatCard icon={FiPackage} label="Total Stock Units" value={stats.totalStockUnits ?? 0} tone="ink" />
        <StatCard icon={FiAlertTriangle} label="Low Stock Items" value={stats.lowStockCount ?? 0} tone="gold" />
        <StatCard icon={FiXCircle} label="Out of Stock Items" value={stats.outOfStockCount ?? 0} tone="ink" />
        <StatCard icon={FiDollarSign} label="Total Stock Value" value={formatPrice(stats.totalStockValue)} tone="brand" />
      </div>

      <div className="bg-white border border-cream-200">
        <FilterTabs breakpoint={480} tabs={TABS} active={status} onChange={(key) => { setStatus(key); setPage(1); }} />

        <div className="p-4 border-b border-cream-200">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name or SKU..."
            className="w-full sm:max-w-xs px-4 py-2.5 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No inventory rows found.</p>
        ) : (
          <StackTable
            breakpoint={640}
            rows={rows}
            rowKey={(r) => `${r.productId}-${r.size}`}
            columns={[
              { key: 'product', label: 'Product', render: (r) => <span className="whitespace-nowrap">{r.productName}</span> },
              { key: 'sku', label: 'SKU', headClassName: 'max-1120:hidden', cellClassName: 'max-1120:hidden whitespace-nowrap', render: (r) => r.sku },
              { key: 'collection', label: 'Collection', headClassName: 'max-1120:hidden', cellClassName: 'max-1120:hidden whitespace-nowrap', render: (r) => r.collection },
              { key: 'size', label: 'Size', headClassName: 'max-1120:hidden', cellClassName: 'max-1120:hidden', render: (r) => r.size },
              { key: 'stock', label: 'Current Stock', headClassName: 'max-1120:hidden', cellClassName: 'max-1120:hidden', render: (r) => r.stock },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            actions={(r) => (
              <>
                <button type="button" onClick={() => setAdjusting(r)} className="hover:text-brand" title="Adjust stock">
                  <FiEdit2 size={15} />
                </button>
                <button type="button" onClick={() => openHistory(r)} className="hover:text-brand" title="Stock history">
                  <FiClock size={15} />
                </button>
              </>
            )}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {adjusting && (
        <AdjustStockModal
          row={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={() => {
            setAdjusting(null);
            fetchInventory();
          }}
        />
      )}

      {historyRow && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg text-ink">Stock History</h2>
              <button type="button" onClick={() => setHistoryRow(null)} className="text-muted hover:text-ink text-xs">CLOSE</button>
            </div>
            <p className="text-xs text-muted mb-4">{historyRow.productName} · {historyRow.size}</p>
            {history.length === 0 ? (
              <p className="text-sm text-muted">No history yet for this size.</p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h._id} className="text-sm border-b border-cream-100 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize text-ink">{h.changeType}</span>
                      <span className={h.quantityChange >= 0 ? 'text-brand' : 'text-charcoal'}>
                        {h.quantityChange >= 0 ? '+' : ''}{h.quantityChange}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {h.previousStock} → {h.newStock} · {h.adminName} · {new Date(h.createdAt).toLocaleString()}
                    </p>
                    {h.note && <p className="text-xs text-muted italic">{h.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;