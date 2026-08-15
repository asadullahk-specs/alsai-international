import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { formatPrice } from '../../../utils/formatPrice';

const emptyItem = { product: '', size: '', quantity: 1, unitCost: '', discount: 0, tax: 0 };
const emptyForm = { supplier: '', purchaseDate: new Date().toISOString().slice(0, 10), supplierReference: '', items: [{ ...emptyItem }], notes: '', attachment: '', purchaseStatus: 'Draft' };

const PurchaseForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminAxios.get('/suppliers/all').then(({ data }) => setSuppliers(data.data.suppliers));
    adminAxios.get('products?limit=200').then(({ data }) => setProducts(data.data.products));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    adminAxios.get(`/purchases/${id}`).then(({ data }) => {
      const p = data.data.purchase;
      setForm({
        supplier: p.supplier?._id || p.supplier,
        purchaseDate: new Date(p.purchaseDate).toISOString().slice(0, 10),
        supplierReference: p.supplierReference || '',
        items: p.items.map((it) => ({
          product: it.product?._id || it.product,
          size: it.size,
          quantity: it.quantity,
          unitCost: it.unitCost,
          discount: it.discount,
          tax: it.tax,
        })),
        notes: p.notes || '',
        attachment: p.attachment || '',
        purchaseStatus: p.purchaseStatus,
      });
      setLoading(false);
    });
  }, [id, isEdit]);

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));
  const removeItem = (idx) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, value) =>
    setForm((prev) => ({ ...prev, items: prev.items.map((row, i) => (i === idx ? { ...row, [field]: value } : row)) }));

  const sizesFor = (productId) => products.find((p) => p._id === productId)?.sizes || [];

  const lineTotal = (row) => Math.max(Number(row.quantity || 0) * Number(row.unitCost || 0) - Number(row.discount || 0) + Number(row.tax || 0), 0);
  const grandTotal = form.items.reduce((sum, row) => sum + lineTotal(row), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, items: form.items.filter((it) => it.product && it.size) };
      if (isEdit) await adminAxios.put(`/purchases/${id}`, payload);
      else await adminAxios.post('/purchases', payload);
      navigate('/admin/purchases');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save this purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="font-serif text-2xl text-ink">{isEdit ? 'Edit Purchase' : 'New Purchase'}</h1>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <button type="button" onClick={() => navigate('/admin/purchases')} className="border border-ink/20 text-ink text-xs tracking-widest px-5 py-2.5 rounded-md hover:border-ink">
            CANCEL
          </button>
          <button type="submit" form="purchase-form" disabled={submitting} className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-5 py-2.5 rounded-md disabled:opacity-60">
            {submitting ? 'SAVING...' : 'SAVE PURCHASE'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-charcoal mb-4">{error}</p>}

      <form id="purchase-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-cream-200 rounded-md p-6 grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs tracking-widest text-muted block mb-1.5">SUPPLIER</label>
              <select required value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}{s.company ? ` (${s.company})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs tracking-widest text-muted block mb-1.5">PURCHASE DATE</label>
              <input type="date" required value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs tracking-widest text-muted block mb-1.5">SUPPLIER INVOICE / REFERENCE</label>
              <input value={form.supplierReference} onChange={(e) => setForm({ ...form, supplierReference: e.target.value })} className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs tracking-widest text-muted block mb-1.5">INVOICE / ATTACHMENT (DRIVE LINK)</label>
              <input value={form.attachment} onChange={(e) => setForm({ ...form, attachment: e.target.value })} placeholder="https://drive.google.com/..." className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="col-span-2">
              <label className="text-xs tracking-widest text-muted block mb-1.5">NOTES</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none" />
            </div>
          </div>

          <div className="bg-white border border-cream-200 rounded-md p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs tracking-widest text-muted">ITEMS</label>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-brand hover:underline">
                <FiPlus size={13} /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {form.items.map((row, i) => (
                <div key={i} className="border border-cream-200 rounded-md p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      required
                      value={row.product}
                      onChange={(e) => updateItem(i, 'product', e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                    <select
                      required
                      value={row.size}
                      onChange={(e) => updateItem(i, 'size', e.target.value)}
                      className="w-32 px-3 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                    >
                      <option value="">Size</option>
                      {sizesFor(row.product).map((s) => (
                        <option key={s.size} value={s.size}>{s.size}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => removeItem(i)} className="text-muted hover:text-charcoal flex-shrink-0">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] tracking-wide text-muted block mb-1">QTY</label>
                      <input type="number" min="1" required value={row.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} className="w-full px-2 py-2 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-wide text-muted block mb-1">UNIT COST</label>
                      <input type="number" min="0" required value={row.unitCost} onChange={(e) => updateItem(i, 'unitCost', e.target.value)} className="w-full px-2 py-2 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-wide text-muted block mb-1">DISCOUNT</label>
                      <input type="number" min="0" value={row.discount} onChange={(e) => updateItem(i, 'discount', e.target.value)} className="w-full px-2 py-2 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-wide text-muted block mb-1">TAX</label>
                      <input type="number" min="0" value={row.tax} onChange={(e) => updateItem(i, 'tax', e.target.value)} className="w-full px-2 py-2 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                    </div>
                  </div>
                  <p className="text-right text-xs text-muted">Line total: <span className="text-ink">{formatPrice(lineTotal(row))}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-cream-200 rounded-md p-6 space-y-4">
            <div>
              <label className="text-xs tracking-widest text-muted block mb-1.5">PURCHASE STATUS</label>
              <select value={form.purchaseStatus} onChange={(e) => setForm({ ...form, purchaseStatus: e.target.value })} className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="Draft">Draft</option>
                <option value="Ordered">Ordered</option>
              </select>
              <p className="text-xs text-muted mt-1.5">Use the purchase's detail page to mark it Received once stock arrives.</p>
            </div>
          </div>

          <div className="bg-white border border-cream-200 rounded-md p-6">
            <p className="text-xs tracking-widest text-muted mb-3">SUMMARY</p>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted">Items</span>
              <span className="text-ink">{form.items.length}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-serif pt-2 border-t border-cream-100 mt-2">
              <span className="text-ink">Grand Total</span>
              <span className="text-brand">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;
