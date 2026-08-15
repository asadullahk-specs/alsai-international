import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiTruck } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';
import { formatPrice } from '../../../utils/formatPrice';

const TABS = [
  { key: 'all', label: 'All Suppliers' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const emptyForm = { name: '', company: '', phone: '', email: '', address: '', notes: '', status: 'active' };

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/suppliers', { params: { status, search: search || undefined, page, limit: 10 } })
      .then(({ data }) => {
        setSuppliers(data.data.suppliers);
        setCounts(data.data.counts);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, search, page]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (form.id) await adminAxios.put(`/suppliers/${form.id}`, form);
      else await adminAxios.post('/suppliers', form);
      setForm(null);
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save this supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier? This cannot be undone.')) return;
    try {
      await adminAxios.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Unable to delete this supplier.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between max-480:flex-col max-480:items-stretch mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Suppliers</h1>
          <p className="text-xs text-muted">Dashboard &gt; Suppliers</p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...emptyForm, id: null })}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 rounded-md transition-colors max-480:w-full max-480:justify-center"
        >
          <FiPlus size={14} /> ADD SUPPLIER
        </button>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon={FiTruck} label="All Suppliers" value={counts.all ?? 0} tone="ink" />
        <StatCard label="Active" value={counts.active ?? 0} tone="brand" />
        <StatCard label="Inactive" value={counts.inactive ?? 0} tone="gold" />
      </div>

      <div className="bg-white border border-cream-200 rounded-md">
        <FilterTabs breakpoint={640} tabs={TABS} active={status} onChange={(key) => { setStatus(key); setPage(1); }} />

        <div className="p-4 border-b border-cream-200">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, company, phone, or email..."
            className="w-full sm:max-w-xs px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : suppliers.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No suppliers found.</p>
        ) : (
          <StackTable
            breakpoint={1400}
            rows={suppliers}
            rowKey={(s) => s._id}
            columns={[
              { key: 'name', label: 'Supplier Name', render: (s) => <span className="text-ink font-medium whitespace-nowrap">{s.name}</span> },
              { key: 'company', label: 'Company', render: (s) => s.company || '—' },
              { key: 'phone', label: 'Phone', render: (s) => s.phone || '—' },
              { key: 'email', label: 'Email', render: (s) => s.email || '—' },
              { key: 'totalPurchases', label: 'Total Purchases', render: (s) => s.totalPurchases },
              { key: 'amountPaid', label: 'Amount Paid', render: (s) => formatPrice(s.amountPaid) },
              { key: 'outstandingAmount', label: 'Outstanding', render: (s) => formatPrice(s.outstandingAmount) },
              { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s.status} /> },
              { key: 'lastPurchaseDate', label: 'Last Purchase', render: (s) => (s.lastPurchaseDate ? new Date(s.lastPurchaseDate).toLocaleDateString() : '—') },
            ]}
            actions={(s) => (
              <>
                <Link to={`/admin/suppliers/${s._id}`} className="hover:text-brand" title="View">
                  <FiEye size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setForm({ id: s._id, name: s.name, company: s.company, phone: s.phone, email: s.email, address: s.address, notes: s.notes, status: s.status })}
                  className="hover:text-brand"
                  title="Edit"
                >
                  <FiEdit2 size={15} />
                </button>
                <button type="button" onClick={() => handleDelete(s._id)} className="hover:text-charcoal" title="Delete">
                  <FiTrash2 size={15} />
                </button>
              </>
            )}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-md p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-lg text-ink">{form.id ? 'Edit Supplier' : 'Add Supplier'}</h2>
            {error && <p className="text-sm text-charcoal">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs tracking-widest text-muted block mb-1.5">SUPPLIER NAME</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs tracking-widest text-muted block mb-1.5">COMPANY NAME</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs tracking-widest text-muted block mb-1.5">PHONE</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs tracking-widest text-muted block mb-1.5">EMAIL</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="col-span-2">
                <label className="text-xs tracking-widest text-muted block mb-1.5">ADDRESS</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="col-span-2">
                <label className="text-xs tracking-widest text-muted block mb-1.5">NOTES</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs tracking-widest text-muted block mb-1.5">STATUS</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2 max-480:flex-col">
              <button type="button" onClick={() => setForm(null)} className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-3 rounded-md hover:border-ink">
                CANCEL
              </button>
              <button type="submit" disabled={submitting} className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 rounded-md disabled:opacity-60">
                {submitting ? 'SAVING...' : 'SAVE SUPPLIER'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SuppliersList;