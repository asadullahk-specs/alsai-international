import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEye, FiX, FiCreditCard } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';
import { formatPrice } from '../../../utils/formatPrice';

const TYPE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'Customer Payment', label: 'Customer' },
  { key: 'Supplier Payment', label: 'Supplier' },
  { key: 'Expense Payment', label: 'Expense' },
  { key: 'Refund', label: 'Refund' },
  { key: 'Other', label: 'Other' },
];

const statusKey = (s) => s.toLowerCase().replace(/ /g, '_');

const emptyForm = { date: new Date().toISOString().slice(0, 10), type: 'Customer Payment', amount: '', method: '', status: 'Paid', reference: '', notes: '', customer: '', supplier: '' };

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [counts, setCounts] = useState({});
  const [byType, setByType] = useState({});
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [methods, setMethods] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/payments', { params: { type, search: search || undefined, page, limit: 10 } })
      .then(({ data }) => {
        setPayments(data.data.payments);
        setCounts(data.data.counts);
        setByType(data.data.byType);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [type, search, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const openForm = () => {
    setError('');
    setForm(emptyForm);
    adminAxios.get('/payments/methods').then(({ data }) => setMethods(data.data.methods));
    adminAxios.get('/suppliers/all').then(({ data }) => setSuppliers(data.data.suppliers));
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await adminAxios.post('/payments', form);
      setShowForm(false);
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record this payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalRevenue = (byType['Customer Payment'] || 0) - (byType['Refund'] || 0);

  return (
    <div>
      <div className="flex items-center justify-between max-480:flex-col max-480:items-stretch mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Payments</h1>
          <p className="text-xs text-muted">Dashboard &gt; Payments</p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 rounded-md transition-colors max-480:w-full max-480:justify-center"
        >
          <FiPlus size={14} /> RECORD PAYMENT
        </button>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={FiCreditCard} label="All Payments" value={(counts.Paid || 0) + (counts.Pending || 0) + (counts.Failed || 0) + (counts.Refunded || 0) + (counts['Partially Refunded'] || 0)} tone="ink" />
        <StatCard label="Customer Payments" value={formatPrice(byType['Customer Payment'] || 0)} tone="brand" />
        <StatCard label="Supplier Payments" value={formatPrice(byType['Supplier Payment'] || 0)} tone="gold" />
        <StatCard label="Refunds" value={formatPrice(byType['Refund'] || 0)} tone="charcoal" />
      </div>

      <div className="bg-white border border-cream-200 rounded-md">
        <FilterTabs breakpoint={900} tabs={TYPE_TABS} active={type} onChange={(key) => { setType(key); setPage(1); }} />

        <div className="p-4 border-b border-cream-200">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search payment ID, reference, customer, or supplier..."
            className="w-full sm:max-w-xs px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No payments found.</p>
        ) : (
          <StackTable
            breakpoint={1180}
            rows={payments}
            rowKey={(p) => p._id}
            columns={[
              { key: 'paymentId', label: 'Payment ID', render: (p) => <span className="text-ink font-medium whitespace-nowrap">{p.paymentId}</span> },
              { key: 'date', label: 'Date', render: (p) => new Date(p.date).toLocaleDateString() },
              { key: 'type', label: 'Type', render: (p) => p.type },
              { key: 'party', label: 'Customer/Supplier', render: (p) => p.customerName || p.supplierName || '—' },
              { key: 'related', label: 'Related Order/Purchase/Expense', render: (p) => p.relatedLabel || '—' },
              { key: 'amount', label: 'Amount', render: (p) => formatPrice(p.amount) },
              { key: 'method', label: 'Payment Method', render: (p) => p.method },
              { key: 'status', label: 'Status', render: (p) => <StatusBadge status={statusKey(p.status)} /> },
              { key: 'reference', label: 'Reference', render: (p) => p.reference || '—' },
            ]}
            actions={(p) => (
              <span className="text-muted" title={p.notes || 'No notes'}>
                <FiEye size={15} />
              </span>
            )}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-md p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-ink">Record Payment</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-ink">
                <FiX size={18} />
              </button>
            </div>
            {error && <p className="text-sm text-charcoal">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">DATE</label>
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">TYPE</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, supplier: '', customer: '' })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                  <option>Customer Payment</option>
                  <option>Supplier Payment</option>
                  <option>Expense Payment</option>
                  <option>Refund</option>
                  <option>Other</option>
                </select>
              </div>
              {form.type === 'Supplier Payment' && (
                <div className="col-span-2">
                  <label className="text-xs tracking-widest text-muted block mb-1.5">SUPPLIER</label>
                  <select required value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">AMOUNT</label>
                <input type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">PAYMENT METHOD</label>
                <select required value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                  <option value="">Select method</option>
                  {methods.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">STATUS</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Failed</option>
                  <option>Refunded</option>
                  <option>Partially Refunded</option>
                </select>
              </div>
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">REFERENCE</label>
                <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="col-span-2">
                <label className="text-xs tracking-widest text-muted block mb-1.5">NOTES</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2 max-480:flex-col">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-3 rounded-md hover:border-ink">
                CANCEL
              </button>
              <button type="submit" disabled={submitting} className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 rounded-md disabled:opacity-60">
                {submitting ? 'SAVING...' : 'RECORD PAYMENT'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;