import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { driveImg } from '../../../utils/driveImg';

const emptyForm = {
  name: '',
  price: '',
  mainImage: '',
  hoverImage: '',
  galleryImages: [],
  description: '',
  includedProducts: [],
  isActive: true,
  displayOrder: 0,
};

const GiftSetForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminAxios.get('products?limit=200').then(({ data }) => setProducts(data.data.products));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    adminAxios.get(`gift-sets/${id}`).then(({ data }) => {
      const item = data.data.item;
      setForm({
        name: item.name,
        price: item.price,
        mainImage: item.mainImage || '',
        hoverImage: item.hoverImage || '',
        galleryImages: item.galleryImages || [],
        description: item.description || '',
        includedProducts: item.includedProducts.map((p) => ({ product: p.product?._id || p.product, size: p.size })),
        isActive: item.isActive,
        displayOrder: item.displayOrder,
      });
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // --- Gallery helpers ---
  const addGalleryImage = () => setForm((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, ''] }));
  const updateGalleryImage = (idx, value) =>
    setForm((prev) => ({ ...prev, galleryImages: prev.galleryImages.map((g, i) => (i === idx ? value : g)) }));
  const removeGalleryImage = (idx) =>
    setForm((prev) => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== idx) }));

  // --- Included products helpers ---
  const addProductRow = () => setForm((prev) => ({ ...prev, includedProducts: [...prev.includedProducts, { product: '', size: '' }] }));
  const removeProductRow = (idx) =>
    setForm((prev) => ({ ...prev, includedProducts: prev.includedProducts.filter((_, i) => i !== idx) }));
  const updateProductRow = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      includedProducts: prev.includedProducts.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        displayOrder: Number(form.displayOrder),
        galleryImages: form.galleryImages.filter(Boolean),
      };
      if (isEdit) {
        await adminAxios.put(`gift-sets/${id}`, payload);
      } else {
        await adminAxios.post('gift-sets', payload);
      }
      navigate('/admin/gift-sets');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save this gift set.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand';
  const labelClass = 'text-xs tracking-widest text-muted block mb-1.5';

  if (loading) return <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="font-serif text-2xl text-ink">{isEdit ? 'Edit Gift Set' : 'Add New Gift Set'}</h1>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => navigate('/admin/gift-sets')}
            className="border border-ink/20 text-ink text-xs tracking-widest px-5 py-2.5 hover:border-ink transition-colors"
          >
            CANCEL
          </button>
          <button
            type="submit"
            form="gift-set-form"
            disabled={submitting}
            className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-5 py-2.5 transition-colors disabled:opacity-60"
          >
            {submitting ? 'SAVING...' : 'SAVE GIFT SET'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-charcoal mb-4">{error}</p>}

      <form id="gift-set-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Core Details */}
          <div className="bg-white border border-cream-200 rounded-md p-6 grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>NAME</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>PRICE (PKR)</label>
              <input
                type="number"
                name="price"
                required
                value={form.price}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>DESCRIPTION</label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Media */}
          <div className="bg-white border border-cream-200 rounded-md p-6 space-y-5">
            <p className={labelClass}>MEDIA</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>MAIN IMAGE (GOOGLE DRIVE LINK)</label>
                <input
                  name="mainImage"
                  value={form.mainImage}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className={inputClass}
                />
                {form.mainImage && (
                  <div className="w-20 h-20 mt-2 bg-cream-100 rounded-md overflow-hidden">
                    <img src={driveImg(form.mainImage)} alt="Main preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>HOVER IMAGE (GOOGLE DRIVE LINK)</label>
                <input
                  name="hoverImage"
                  value={form.hoverImage}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className={inputClass}
                />
                {form.hoverImage && (
                  <div className="w-20 h-20 mt-2 bg-cream-100 rounded-md overflow-hidden">
                    <img src={driveImg(form.hoverImage)} alt="Hover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>GALLERY IMAGES</label>
                <button type="button" onClick={addGalleryImage} className="flex items-center gap-1 text-xs text-brand hover:underline">
                  <FiPlus size={13} /> Add Image
                </button>
              </div>
              <div className="space-y-2">
                {form.galleryImages.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {g && (
                      <div className="w-10 h-10 flex-shrink-0 bg-cream-100 rounded overflow-hidden">
                        <img src={driveImg(g)} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      value={g}
                      onChange={(e) => updateGalleryImage(i, e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className={`flex-1 ${inputClass}`}
                    />
                    <button type="button" onClick={() => removeGalleryImage(i)} className="text-muted hover:text-charcoal flex-shrink-0">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
                {form.galleryImages.length === 0 && <p className="text-sm text-muted">No gallery images added yet.</p>}
              </div>
            </div>
          </div>

          {/* Included Products */}
          <div className="bg-white border border-cream-200 rounded-md p-6">
            <div className="flex items-center justify-between mb-4">
              <label className={labelClass}>INCLUDED PRODUCTS</label>
              <button type="button" onClick={addProductRow} className="flex items-center gap-1 text-xs text-brand hover:underline">
                <FiPlus size={13} /> Add Product
              </button>
            </div>
            <div className="space-y-3">
              {form.includedProducts.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <select
                    required
                    value={row.product}
                    onChange={(e) => updateProductRow(i, 'product', e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    placeholder="Size (e.g. 50ml)"
                    value={row.size}
                    onChange={(e) => updateProductRow(i, 'size', e.target.value)}
                    className="w-24 px-3 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <button
                    type="button"
                    onClick={() => removeProductRow(i)}
                    className="text-muted hover:text-charcoal flex-shrink-0"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              ))}
              {form.includedProducts.length === 0 && <p className="text-sm text-muted">No products added yet.</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-cream-200 rounded-md p-6">
            <label className={labelClass}>MAIN IMAGE PREVIEW</label>
            <div className="aspect-square bg-cream-100 rounded-md overflow-hidden">
              {form.mainImage && <img src={driveImg(form.mainImage)} alt="" className="w-full h-full object-cover" />}
            </div>
          </div>

          <div className="bg-white border border-cream-200 rounded-md p-6 space-y-4">
            <div>
              <label className={labelClass}>DISPLAY ORDER</label>
              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="text-brand" />
              Active - visible on the storefront
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GiftSetForm;
