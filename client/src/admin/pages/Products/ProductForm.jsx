import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { formatPrice } from '../../../utils/formatPrice';
import { driveImg } from '../../../utils/driveImg';

const TABS = ['General', 'Pricing', 'Inventory', 'Media', 'Product Information', 'Flags', 'SEO'];

const emptySize = { size: '', sku: '', price: '', salePrice: '', costPrice: '', stock: '' };

const emptyForm = {
  name: '',
  brand: "AL SA'I",
  shortDescription: '',
  fullDescription: '',
  collection: '',
  featuredCollection: '',
  fragranceFamily: '',
  sizes: [{ ...emptySize }],
  lowStockThreshold: 15,
  mainImage: '',
  hoverImage: '',
  galleryImages: [],
  video: '',
  fragranceNotes: { top: '', heart: '', base: '' },
  facts: { concentration: 'Extrait de Parfum', longevity: '', sillage: '', gender: 'Unisex', ingredients: '' },
  shippingInfo: { deliveryTime: '', shippingCharges: '', returnExchange: '', orderCancellation: '' },
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isActive: true,
  isHidden: false,
  metaTitle: '',
  metaKeywords: '',
  metaDescription: '',
  canonicalUrl: '',
};

const FLAG_DEFS = [
  ['isFeatured', 'Featured Product', 'Show this product on the homepage and featured sections.'],
  ['isBestSeller', 'Best Seller', 'Mark this product as a best seller.'],
  ['isNewArrival', 'New Arrival', 'Display this product as a new arrival.'],
  ['isActive', 'Active', 'Make this product visible on the store.'],
  ['isHidden', 'Hidden', 'Hide this product from the store (not visible to customers).'],
];

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('General');
  const [form, setForm] = useState(emptyForm);
  const [collections, setCollections] = useState([]);
  const [featuredCollections, setFeaturedCollections] = useState([]);
  const [fragranceFamilies, setFragranceFamilies] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      adminAxios.get('collections'),
      adminAxios.get('featured-collections'),
      adminAxios.get('fragrance-families'),
    ]).then(([c, f, ff]) => {
      setCollections(c.data.data.items);
      setFeaturedCollections(f.data.data.items);
      setFragranceFamilies(ff.data.data.items);
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    adminAxios.get(`products/${id}`).then(({ data }) => {
      const p = data.data.product;
      setForm({
        name: p.name,
        brand: p.brand,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        collection: p.collection?._id || '',
        featuredCollection: p.featuredCollection?._id || '',
        fragranceFamily: p.fragranceFamily?._id || '',
        sizes: p.sizes.length ? p.sizes : [{ ...emptySize }],
        lowStockThreshold: p.lowStockThreshold,
        mainImage: p.mainImage,
        hoverImage: p.hoverImage,
        galleryImages: p.galleryImages || [],
        video: p.video || '',
        fragranceNotes: {
          top: (p.fragranceNotes?.top || []).join(', '),
          heart: (p.fragranceNotes?.heart || []).join(', '),
          base: (p.fragranceNotes?.base || []).join(', '),
        },
        facts: { ...emptyForm.facts, ...p.facts },
        shippingInfo: { ...emptyForm.shippingInfo, ...p.shippingInfo },
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        isNewArrival: p.isNewArrival,
        isActive: p.isActive,
        isHidden: p.isHidden,
        metaTitle: p.metaTitle || '',
        metaKeywords: (p.metaKeywords || []).join(', '),
        metaDescription: p.metaDescription || '',
        canonicalUrl: p.canonicalUrl || '',
      });
      setLoading(false);
    });
  }, [id, isEdit]);

  const update = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i += 1) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateSize = (idx, field, value) =>
    setForm((prev) => ({ ...prev, sizes: prev.sizes.map((s, i) => (i === idx ? { ...s, [field]: value } : s)) }));
  const addSize = () => setForm((prev) => ({ ...prev, sizes: [...prev.sizes, { ...emptySize }] }));
  const removeSize = (idx) => setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }));

  const addGalleryImage = () => setForm((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, ''] }));
  const updateGalleryImage = (idx, value) =>
    setForm((prev) => ({ ...prev, galleryImages: prev.galleryImages.map((g, i) => (i === idx ? value : g)) }));
  const removeGalleryImage = (idx) =>
    setForm((prev) => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.collection) {
      setError('Please select a Category on the General tab.');
      setActiveTab('General');
      return;
    }
    if (form.sizes.length === 0 || form.sizes.some((s) => !s.size || !s.price)) {
      setError('Please provide at least one complete size with a price on the Pricing tab.');
      setActiveTab('Pricing');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        brand: form.brand,
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        collection: form.collection,
        featuredCollection: form.featuredCollection || undefined,
        fragranceFamily: form.fragranceFamily || undefined,
        sizes: form.sizes.map((s) => ({
          size: s.size,
          sku: s.sku,
          price: Number(s.price),
          salePrice: s.salePrice ? Number(s.salePrice) : undefined,
          costPrice: s.costPrice ? Number(s.costPrice) : undefined,
          stock: Number(s.stock) || 0,
        })),
        lowStockThreshold: Number(form.lowStockThreshold),
        mainImage: form.mainImage,
        hoverImage: form.hoverImage,
        galleryImages: form.galleryImages.filter(Boolean),
        video: form.video,
        fragranceNotes: {
          top: form.fragranceNotes.top.split(',').map((s) => s.trim()).filter(Boolean),
          heart: form.fragranceNotes.heart.split(',').map((s) => s.trim()).filter(Boolean),
          base: form.fragranceNotes.base.split(',').map((s) => s.trim()).filter(Boolean),
        },
        facts: form.facts,
        shippingInfo: form.shippingInfo,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isNewArrival: form.isNewArrival,
        isActive: form.isActive,
        isHidden: form.isHidden,
        metaTitle: form.metaTitle,
        metaKeywords: form.metaKeywords.split(',').map((s) => s.trim()).filter(Boolean),
        metaDescription: form.metaDescription,
        canonicalUrl: form.canonicalUrl,
      };

      if (isEdit) {
        await adminAxios.put(`products/${id}`, payload);
      } else {
        await adminAxios.post('products', payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save this product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />;

  const prices = form.sizes.map((s) => Number(s.price)).filter((n) => !Number.isNaN(n) && n > 0);
  const lowestPrice = prices.length ? Math.min(...prices) : 0;
  const highestPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const totalStock = form.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);

  const inputClass =
    'w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand';
  const labelClass = 'text-xs tracking-widest text-muted block mb-1.5';

  return (
    <div>
      <div className="flex items-center justify-between max-480:flex-col max-480:items-stretch mb-6 gap-3">
        <h1 className="font-serif text-2xl text-ink">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <div className="flex gap-3 flex-shrink-0 max-480:flex-col max-480:w-full">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="border border-ink/20 text-ink text-xs tracking-widest px-5 py-2.5 rounded-md hover:border-ink transition-colors max-480:w-full"
          >
            CANCEL
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={submitting}
            className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-5 py-2.5 rounded-md transition-colors disabled:opacity-60 max-480:w-full"
          >
            {submitting ? 'SAVING...' : 'SAVE PRODUCT'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-charcoal mb-4">{error}</p>}

      {/* Below md: tabs collapse into a dropdown filter instead of a horizontal scroller */}
      <div className="md:hidden mb-6">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full border border-cream-200 bg-white text-sm text-ink px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {TABS.map((tab) => (
            <option key={tab} value={tab}>
              {tab.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:flex border-b border-cream-200 gap-6 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-xs tracking-widest pb-3 border-b-2 flex-shrink-0 whitespace-nowrap transition-colors ${
              activeTab === tab ? 'border-brand text-ink' : 'border-transparent text-muted'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        {activeTab === 'General' && (
          <div className="bg-white border border-cream-200 rounded-md p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={labelClass}>PRODUCT NAME</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CATEGORY</label>
              <select required value={form.collection} onChange={(e) => update('collection', e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Select category</option>
                {collections.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>COLLECTION (OPTIONAL)</label>
              <select value={form.featuredCollection} onChange={(e) => update('featuredCollection', e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">None</option>
                {featuredCollections.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>FRAGRANCE FAMILY</label>
              <select value={form.fragranceFamily} onChange={(e) => update('fragranceFamily', e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Select fragrance family</option>
                {fragranceFamilies.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>BRAND</label>
              <input value={form.brand} onChange={(e) => update('brand', e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>SHORT DESCRIPTION</label>
              <input
                value={form.shortDescription}
                onChange={(e) => update('shortDescription', e.target.value)}
                placeholder="Shown on product cards, e.g. Creamy Sandalwood and Musk"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>FULL DESCRIPTION</label>
              <textarea
                rows={4}
                value={form.fullDescription}
                onChange={(e) => update('fullDescription', e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        )}

        {activeTab === 'Pricing' && (
          <div className="bg-white border border-cream-200 rounded-md p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs tracking-widest text-muted">SIZES, PRICING & STOCK</label>
              <button type="button" onClick={addSize} className="flex items-center gap-1 text-xs text-brand hover:underline">
                <FiPlus size={13} /> Add Size
              </button>
            </div>
            {/* Table layout - min-821 and up, matching the summary card breakpoint below */}
            <div className="hidden min-821:block overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-left text-xs tracking-widest text-muted border-b border-cream-200">
                    <th className="pb-2 pr-2 font-normal">Size</th>
                    <th className="pb-2 pr-2 font-normal">SKU</th>
                    <th className="pb-2 pr-2 font-normal">Price</th>
                    <th className="pb-2 pr-2 font-normal">Sale Price</th>
                    <th className="pb-2 pr-2 font-normal">Cost Price</th>
                    <th className="pb-2 pr-2 font-normal">Stock</th>
                    <th className="pb-2 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {form.sizes.map((s, i) => (
                    <tr key={i}>
                      <td className="py-1.5 pr-2">
                        <input required placeholder="50ml" value={s.size} onChange={(e) => updateSize(i, 'size', e.target.value)} className="w-20 px-2 py-2 rounded border border-cream-200 text-sm" />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input required placeholder="ALS-001-50" value={s.sku} onChange={(e) => updateSize(i, 'sku', e.target.value)} className="w-28 px-2 py-2 rounded border border-cream-200 text-sm" />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input required type="number" value={s.price} onChange={(e) => updateSize(i, 'price', e.target.value)} className="w-24 px-2 py-2 rounded border border-cream-200 text-sm" />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input type="number" value={s.salePrice} onChange={(e) => updateSize(i, 'salePrice', e.target.value)} className="w-24 px-2 py-2 rounded border border-cream-200 text-sm" />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input type="number" value={s.costPrice} onChange={(e) => updateSize(i, 'costPrice', e.target.value)} className="w-24 px-2 py-2 rounded border border-cream-200 text-sm" />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input type="number" value={s.stock} onChange={(e) => updateSize(i, 'stock', e.target.value)} className="w-20 px-2 py-2 rounded border border-cream-200 text-sm" />
                      </td>
                      <td className="py-1.5">
                        <button type="button" onClick={() => removeSize(i)} className="text-muted hover:text-charcoal">
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stacked card layout - max-820, matching the summary card structure below */}
            <div className="max-820:block min-821:hidden space-y-4">
              {form.sizes.map((s, i) => (
                <div key={i} className="border border-cream-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs tracking-widest text-muted">SIZE {i + 1}</p>
                    <button type="button" onClick={() => removeSize(i)} className="text-muted hover:text-charcoal">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 text-sm border-t border-cream-200 pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">Size</p>
                      <input required placeholder="50ml" value={s.size} onChange={(e) => updateSize(i, 'size', e.target.value)} className="w-32 px-2 py-1.5 rounded border border-cream-200 text-sm text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">SKU</p>
                      <input required placeholder="ALS-001-50" value={s.sku} onChange={(e) => updateSize(i, 'sku', e.target.value)} className="w-32 px-2 py-1.5 rounded border border-cream-200 text-sm text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">Price</p>
                      <input required type="number" value={s.price} onChange={(e) => updateSize(i, 'price', e.target.value)} className="w-32 px-2 py-1.5 rounded border border-cream-200 text-sm text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">Sale Price</p>
                      <input type="number" value={s.salePrice} onChange={(e) => updateSize(i, 'salePrice', e.target.value)} className="w-32 px-2 py-1.5 rounded border border-cream-200 text-sm text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">Cost Price</p>
                      <input type="number" value={s.costPrice} onChange={(e) => updateSize(i, 'costPrice', e.target.value)} className="w-32 px-2 py-1.5 rounded border border-cream-200 text-sm text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">Stock</p>
                      <input type="number" value={s.stock} onChange={(e) => updateSize(i, 'stock', e.target.value)} className="w-32 px-2 py-1.5 rounded border border-cream-200 text-sm text-right" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 max-820:gap-2 min-821:grid min-821:grid-cols-4 min-821:gap-4 mt-6 pt-4 border-t border-cream-200 text-sm">
              <div className="flex items-center justify-between min-821:block">
                <p className="text-xs text-muted">Lowest Price</p>
                <p className="text-ink">{formatPrice(lowestPrice)}</p>
              </div>
              <div className="flex items-center justify-between min-821:block">
                <p className="text-xs text-muted">Highest Price</p>
                <p className="text-ink">{formatPrice(highestPrice)}</p>
              </div>
              <div className="flex items-center justify-between min-821:block">
                <p className="text-xs text-muted">Average Price</p>
                <p className="text-ink">{formatPrice(avgPrice)}</p>
              </div>
              <div className="flex items-center justify-between min-821:block">
                <p className="text-xs text-muted">Total Stock</p>
                <p className="text-ink">{totalStock}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Inventory' && (
          <div className="bg-white border border-cream-200 rounded-md p-6">
            <div className="max-w-xs mb-6">
              <label className={labelClass}>LOW STOCK ALERT THRESHOLD</label>
              <input type="number" value={form.lowStockThreshold} onChange={(e) => update('lowStockThreshold', e.target.value)} className={inputClass} />
            </div>
            <p className="text-xs tracking-widest text-muted mb-1">CURRENT STOCK BY SIZE</p>
            <p className="text-xs text-muted mb-3">Stock levels are added and edited per size on the Pricing tab.</p>
            <div className="space-y-1">
              {form.sizes.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-cream-100 last:border-0">
                  <span className="text-ink">{s.size || `Size ${i + 1}`}</span>
                  <span
                    className={
                      Number(s.stock) === 0
                        ? 'text-charcoal'
                        : Number(s.stock) <= Number(form.lowStockThreshold)
                        ? 'text-gold'
                        : 'text-brand'
                    }
                  >
                    {s.stock || 0} units
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Media' && (
          <div className="bg-white border border-cream-200 rounded-md p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>MAIN IMAGE (GOOGLE DRIVE LINK)</label>
                <input value={form.mainImage} onChange={(e) => update('mainImage', e.target.value)} placeholder="https://drive.google.com/..." className={inputClass} />
                {form.mainImage && (
                  <div className="w-20 h-20 mt-2 bg-cream-100 rounded-md overflow-hidden">
                    <img src={driveImg(form.mainImage)} alt="Main preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>HOVER IMAGE (GOOGLE DRIVE LINK)</label>
                <input value={form.hoverImage} onChange={(e) => update('hoverImage', e.target.value)} placeholder="https://drive.google.com/..." className={inputClass} />
                {form.hoverImage && (
                  <div className="w-20 h-20 mt-2 bg-cream-100 rounded-md overflow-hidden">
                    <img src={driveImg(form.hoverImage)} alt="Hover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>PRODUCT VIDEO (GOOGLE DRIVE LINK)</label>
              <input value={form.video} onChange={(e) => update('video', e.target.value)} placeholder="https://drive.google.com/..." className={inputClass} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs tracking-widest text-muted">GALLERY IMAGES</label>
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
                    <input value={g} onChange={(e) => updateGalleryImage(i, e.target.value)} placeholder="https://drive.google.com/..." className={`flex-1 ${inputClass}`} />
                    <button type="button" onClick={() => removeGalleryImage(i)} className="text-muted hover:text-charcoal flex-shrink-0">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
                {form.galleryImages.length === 0 && <p className="text-sm text-muted">No gallery images added yet.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Product Information' && (
          <div className="space-y-6">
            <div className="bg-white border border-cream-200 rounded-md p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>TOP NOTES</label>
                <input value={form.fragranceNotes.top} onChange={(e) => update('fragranceNotes.top', e.target.value)} placeholder="Comma separated" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>HEART NOTES</label>
                <input value={form.fragranceNotes.heart} onChange={(e) => update('fragranceNotes.heart', e.target.value)} placeholder="Comma separated" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>BASE NOTES</label>
                <input value={form.fragranceNotes.base} onChange={(e) => update('fragranceNotes.base', e.target.value)} placeholder="Comma separated" className={inputClass} />
              </div>
            </div>
            <div className="bg-white border border-cream-200 rounded-md p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>CONCENTRATION</label>
                <input value={form.facts.concentration} onChange={(e) => update('facts.concentration', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>GENDER</label>
                <select value={form.facts.gender} onChange={(e) => update('facts.gender', e.target.value)} className={`${inputClass} bg-white`}>
                  <option>Unisex</option>
                  <option>Men</option>
                  <option>Women</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>LONGEVITY</label>
                <input value={form.facts.longevity} onChange={(e) => update('facts.longevity', e.target.value)} placeholder="e.g. 6 to 8 Hours" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>SILLAGE</label>
                <input value={form.facts.sillage} onChange={(e) => update('facts.sillage', e.target.value)} placeholder="e.g. Strong" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>INGREDIENTS</label>
                <textarea rows={2} value={form.facts.ingredients} onChange={(e) => update('facts.ingredients', e.target.value)} className={`${inputClass} resize-none`} />
              </div>
            </div>
            <div className="bg-white border border-cream-200 rounded-md p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>DELIVERY TIME</label>
                <input value={form.shippingInfo.deliveryTime} onChange={(e) => update('shippingInfo.deliveryTime', e.target.value)} placeholder="e.g. Karachi: 1 to 2 Working Days" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>SHIPPING CHARGES</label>
                <input value={form.shippingInfo.shippingCharges} onChange={(e) => update('shippingInfo.shippingCharges', e.target.value)} placeholder="e.g. Free shipping over PKR 10,000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>RETURN & EXCHANGE</label>
                <input value={form.shippingInfo.returnExchange} onChange={(e) => update('shippingInfo.returnExchange', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ORDER CANCELLATION</label>
                <input value={form.shippingInfo.orderCancellation} onChange={(e) => update('shippingInfo.orderCancellation', e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Flags' && (
          <div className="bg-white border border-cream-200 rounded-md p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FLAG_DEFS.map(([key, label, desc]) => (
              <label key={key} className="border border-cream-200 rounded-md p-4 flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={(e) => update(key, e.target.checked)} className="mt-1 text-brand" />
                <div>
                  <p className="text-sm text-ink font-medium">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {activeTab === 'SEO' && (
          <div className="bg-white border border-cream-200 rounded-md p-6 space-y-4">
            <div>
              <label className={labelClass}>META TITLE</label>
              <input value={form.metaTitle} onChange={(e) => update('metaTitle', e.target.value)} maxLength={60} className={inputClass} />
              <p className="text-xs text-muted mt-1">{form.metaTitle.length}/60</p>
            </div>
            <div>
              <label className={labelClass}>META KEYWORDS</label>
              <input value={form.metaKeywords} onChange={(e) => update('metaKeywords', e.target.value)} placeholder="Comma separated, e.g. oud, perfume, luxury" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>META DESCRIPTION</label>
              <textarea rows={3} maxLength={160} value={form.metaDescription} onChange={(e) => update('metaDescription', e.target.value)} className={`${inputClass} resize-none`} />
              <p className="text-xs text-muted mt-1">{form.metaDescription.length}/160</p>
            </div>
            <div>
              <label className={labelClass}>CANONICAL URL (OPTIONAL)</label>
              <input value={form.canonicalUrl} onChange={(e) => update('canonicalUrl', e.target.value)} className={inputClass} />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductForm;
