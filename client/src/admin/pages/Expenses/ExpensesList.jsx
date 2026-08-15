import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTrendingDown } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';
import { formatPrice } from '../../../utils/formatPrice';

const CATEGORIES = ['Packaging', 'Rent', 'Electricity', 'Salaries', 'Transportation', 'Courier', 'Software', 'Maintenance', 'Office', 'Miscellaneous'];
const TABS = [{ key: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ key: c, label: c }))];
const statusKey = (s) => s.toLowerCase();

const emptyForm = { date: new Date().toISOString().slice(0, 10), category: 'Packaging', title: '', description: '', amount: '', paymentMethod: '', reference: '', attachment: '', notes: '', status: 'Paid' };

const ExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/expenses', { params: { category, search: search || undefined, page, limit: 10 } })
      .then(({ data }) => {
        setExpenses(data.data.expenses);
        setTotalAmount(data.data.totalAmount);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [category, search, page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (form.id) await adminAxios.put(`/expenses/${form.id}`, form);
      else await adminAxios.post('/expenses', form);
      setForm(null);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save this expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return;
    await adminAxios.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  return (
    <div>
      <div className="flex items-center justify-between max-480:flex-col max-480:items-stretch mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Expenses</h1>
          <p className="text-xs text-muted">Dashboard &gt; Expenses</p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...emptyForm, id: null })}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 rounded-md transition-colors max-480:w-full max-480:justify-center"
        >
          <FiPlus size={14} /> ADD EXPENSE
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <StatCard icon={FiTrendingDown} label="Total Expenses (this page's filter)" value={formatPrice(totalAmount)} tone="charcoal" />
      </div>

      <div className="bg-white border border-cream-200 rounded-md">
        <FilterTabs breakpoint={1400} tabs={TABS} active={category} onChange={(key) => { setCategory(key); setPage(1); }} />

        <div className="p-4 border-b border-cream-200">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search expense ID or title..."
            className="w-full sm:max-w-xs px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No expenses found.</p>
        ) : (
          <StackTable
            breakpoint={1180}
            rows={expenses}
            rowKey={(e) => e._id}
            columns={[
              { key: 'expenseId', label: 'Expense ID', render: (e) => <span className="text-ink font-medium whitespace-nowrap">{e.expenseId}</span> },
              { key: 'date', label: 'Date', render: (e) => new Date(e.date).toLocaleDateString() },
              { key: 'category', label: 'Category', render: (e) => e.category },
              { key: 'title', label: 'Title', render: (e) => e.title },
              { key: 'amount', label: 'Amount', render: (e) => formatPrice(e.amount) },
              { key: 'paymentMethod', label: 'Payment Method', render: (e) => e.paymentMethod || '—' },
              { key: 'status', label: 'Status', render: (e) => <StatusBadge status={statusKey(e.status)} /> },
              { key: 'createdBy', label: 'Created By', render: (e) => e.createdByName || '—' },
            ]}
            actions={(e) => (
              <>
                <button
                  type="button"
                  onClick={() => setForm({ id: e._id, date: new Date(e.date).toISOString().slice(0, 10), category: e.category, title: e.title, description: e.description, amount: e.amount, paymentMethod: e.paymentMethod, reference: e.reference, attachment: e.attachment, notes: e.notes, status: e.status })}
                  className="hover:text-brand"
                  title="Edit"
                >
                  <FiEdit2 size={15} />
                </button>
                <button type="button" onClick={() => handleDelete(e._id)} className="hover:text-charcoal" title="Delete">
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
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-ink">{form.id ? 'Edit Expense' : 'Add Expense'}</h2>
              <button type="button" onClick={() => setForm(null)} className="text-muted hover:text-ink">
                <FiX size={18} />
              </button>
            </div>
            {error && <p className="text-sm text-charcoal">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">EXPENSE DATE</label>
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">CATEGORY</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs tracking-widest text-muted block mb-1.5">TITLE</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="col-span-2">
                <label className="text-xs tracking-widest text-muted block mb-1.5">DESCRIPTION</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none" />
              </div>
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">AMOUNT</label>
                <input type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">PAYMENT METHOD</label>
                <input value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">REFERENCE</label>
                <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">STATUS</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                  <option>Paid</option>
                  <option>Pending</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs tracking-widest text-muted block mb-1.5">RECEIPT / ATTACHMENT (DRIVE LINK)</label>
                <input value={form.attachment} onChange={(e) => setForm({ ...form, attachment: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="col-span-2">
                <label className="text-xs tracking-widest text-muted block mb-1.5">NOTES</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2 max-480:flex-col">
              <button type="button" onClick={() => setForm(null)} className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-3 rounded-md hover:border-ink">
                CANCEL
              </button>
              <button type="submit" disabled={submitting} className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 rounded-md disabled:opacity-60">
                {submitting ? 'SAVING...' : 'SAVE EXPENSE'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExpensesList;
