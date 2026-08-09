import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StackTable from '../../components/common/StackTable';

const emptyForm = {
  name: '',
  discountPercent: '',
  startDate: '',
  endDate: '',
  banner: '',
  applicableProducts: 'all',
  selectedProducts: [],
  isActive: true,
};

const SeasonalCollectionsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = () => {
    setLoading(true);
    adminAxios
      .get('seasonal-collections')
      .then(({ data }) => setCampaigns(data.data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
    adminAxios.get('products', { params: { limit: 200 } }).then(({ data }) => setProducts(data.data.products));
  }, []);

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (c) => {
    setForm({
      name: c.name,
      discountPercent: c.discountPercent,
      startDate: c.startDate?.slice(0, 10) || '',
      endDate: c.endDate?.slice(0, 10) || '',
      banner: c.banner || '',
      applicableProducts: c.applicableProducts,
      selectedProducts: c.selectedProducts || [],
      isActive: c.isActive,
    });
    setEditingId(c._id);
    setError('');
    setShowForm(true);
  };

  const toggleProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(id)
        ? prev.selectedProducts.filter((p) => p !== id)
        : [...prev.selectedProducts, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, discountPercent: Number(form.discountPercent) };
      if (editingId) await adminAxios.put(`seasonal-collections/${editingId}`, payload);
      else await adminAxios.post('seasonal-collections', payload);
      setShowForm(false);
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this seasonal campaign?')) return;
    await adminAxios.delete(`seasonal-collections/${id}`);
    fetchCampaigns();
  };

  return (
    <div>
      <div className="flex flex-col min-769:flex-row min-769:items-center min-769:justify-between mb-6 gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">Promotions</h1>
          <p className="text-sm text-muted">Time-boxed discount campaigns shown as a banner on the homepage.</p>
        </div>
        <button
          type="button"
          onClick={openNewForm}
          className="flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 transition-colors flex-shrink-0"
        >
          <FiPlus size={14} /> CREATE SEASONAL CUT
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="bg-white p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-ink">{editingId ? 'Edit Seasonal Cut' : 'Create Seasonal Cut'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-ink">
                <FiX size={18} />
              </button>
            </div>
            {error && <p className="text-sm text-charcoal">{error}</p>}
            <input
              required
              placeholder="Campaign name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="number"
                min="0"
                max="100"
                placeholder="Discount %"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                className="px-4 py-3 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">Start Date</label>
                <input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-cream-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">End Date</label>
                <input
                  required
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-cream-200 text-sm"
                />
              </div>
            </div>
            <input
              required
              placeholder="Banner (Google Drive link)"
              value={form.banner}
              onChange={(e) => setForm({ ...form, banner: e.target.value })}
              className="w-full px-4 py-3 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <div>
              <label className="text-xs text-muted block mb-1">Applicable Products</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    checked={form.applicableProducts === 'all'}
                    onChange={() => setForm({ ...form, applicableProducts: 'all' })}
                  />
                  All Products
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    checked={form.applicableProducts === 'selected'}
                    onChange={() => setForm({ ...form, applicableProducts: 'selected' })}
                  />
                  Selected Products
                </label>
              </div>
              {form.applicableProducts === 'selected' && (
                <div className="border border-cream-200 max-h-40 overflow-y-auto">
                  {products.map((p) => (
                    <label key={p._id} className="flex items-center gap-2 px-3 py-2 text-sm border-b border-cream-100 last:border-0">
                      <input type="checkbox" checked={form.selectedProducts.includes(p._id)} onChange={() => toggleProduct(p._id)} />
                      {p.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 max-480:flex-col">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-3 hover:border-ink transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 transition-colors disabled:opacity-60"
              >
                {submitting ? 'SAVING...' : 'SAVE CAMPAIGN'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      ) : campaigns.length === 0 ? (
        <p className="text-sm text-muted py-10 text-center">No seasonal campaigns yet.</p>
      ) : (
        <div className="bg-white border border-cream-200">
          <StackTable
            breakpoint={768}
            rows={campaigns}
            rowKey={(c) => c._id}
            columns={[
              { key: 'name', label: 'Name', render: (c) => c.name },
              { key: 'discount', label: 'Discount', render: (c) => `${c.discountPercent}%` },
              {
                key: 'dates',
                label: 'Dates',
                render: (c) => (
                  <span className="whitespace-nowrap">
                    {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (c) => (
                  <span className={`text-[10px] tracking-wide px-2 py-1 ${c.isActive ? 'bg-brand/10 text-brand' : 'bg-cream-200 text-muted'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
            ]}
            actions={(c) => (
              <>
                <button type="button" onClick={() => openEditForm(c)} className="text-muted hover:text-brand">
                  <FiEdit2 size={15} />
                </button>
                <button type="button" onClick={() => handleDelete(c._id)} className="text-muted hover:text-charcoal">
                  <FiTrash2 size={15} />
                </button>
              </>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default SeasonalCollectionsPage;
