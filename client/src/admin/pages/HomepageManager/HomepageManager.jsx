import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiArrowUp, FiArrowDown, FiCheck, FiMail } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { driveImg } from '../../../utils/driveImg';

const emptySlide = {
  heading: '',
  description: '',
  backgroundImage: '',
  buttonText: '',
  buttonUrl: '',
  secondaryButtonText: '',
  secondaryButtonUrl: '',
  isActive: true,
};

const emptyTestimonial = { customerName: '', customerImage: '', reviewImage: '', rating: 5, message: '' };

const HeroSlideForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save slide.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="bg-white p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Hero Slide</h2>
          <button type="button" onClick={onCancel} className="text-muted hover:text-ink">
            <FiX size={18} />
          </button>
        </div>
        {error && <p className="text-sm text-charcoal">{error}</p>}
        <div>
          <label className="text-xs text-muted block mb-1">Heading (2 lines max recommended)</label>
          <input
            required
            maxLength={80}
            value={form.heading}
            onChange={(e) => setForm({ ...form, heading: e.target.value })}
            className="w-full px-4 py-3 border border-cream-200 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Description (2 lines max recommended)</label>
          <textarea
            rows={2}
            maxLength={140}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 border border-cream-200 text-sm resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Background Image (Google Drive link)</label>
          <input
            required
            value={form.backgroundImage}
            onChange={(e) => setForm({ ...form, backgroundImage: e.target.value })}
            className="w-full px-4 py-3 border border-cream-200 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 max-480:grid-cols-1 gap-3">
          <input
            placeholder="Primary Button Text"
            value={form.buttonText}
            onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
            className="px-4 py-3 border border-cream-200 text-sm"
          />
          <input
            placeholder="Primary Button URL"
            value={form.buttonUrl}
            onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })}
            className="px-4 py-3 border border-cream-200 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 max-480:grid-cols-1 gap-3">
          <input
            placeholder="Secondary Button Text (optional)"
            value={form.secondaryButtonText}
            onChange={(e) => setForm({ ...form, secondaryButtonText: e.target.value })}
            className="px-4 py-3 border border-cream-200 text-sm"
          />
          <input
            placeholder="Secondary Button URL"
            value={form.secondaryButtonUrl}
            onChange={(e) => setForm({ ...form, secondaryButtonUrl: e.target.value })}
            className="px-4 py-3 border border-cream-200 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <div className="flex gap-3 pt-2 max-480:flex-col">
          <button type="button" onClick={onCancel} className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-3 hover:border-ink">
            CANCEL
          </button>
          <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 disabled:opacity-60">
            {saving ? 'SAVING...' : 'SAVE SLIDE'}
          </button>
        </div>
      </form>
    </div>
  );
};

const TestimonialForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const limit = form.reviewImage ? 100 : 150;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="bg-white p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink">Testimonial</h2>
          <button type="button" onClick={onCancel} className="text-muted hover:text-ink">
            <FiX size={18} />
          </button>
        </div>
        {error && <p className="text-sm text-charcoal">{error}</p>}
        <input
          required
          placeholder="Customer Name"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          className="w-full px-4 py-3 border border-cream-200 text-sm"
        />
        <input
          placeholder="Customer Avatar (Google Drive link, optional)"
          value={form.customerImage}
          onChange={(e) => setForm({ ...form, customerImage: e.target.value })}
          className="w-full px-4 py-3 border border-cream-200 text-sm"
        />
        <input
          placeholder="Review Image (Google Drive link, optional)"
          value={form.reviewImage}
          onChange={(e) => setForm({ ...form, reviewImage: e.target.value })}
          className="w-full px-4 py-3 border border-cream-200 text-sm"
        />
        <div>
          <label className="text-xs text-muted block mb-1">Rating</label>
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="w-full px-4 py-3 border border-cream-200 text-sm">
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} Stars</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">
            Message ({form.message.length}/{limit} - {form.reviewImage ? 'limited to 100 with an image' : 'up to 150 without one'})
          </label>
          <textarea
            required
            rows={3}
            maxLength={limit}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, limit) })}
            className="w-full px-4 py-3 border border-cream-200 text-sm resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2 max-480:flex-col">
          <button type="button" onClick={onCancel} className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-3 hover:border-ink">
            CANCEL
          </button>
          <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 disabled:opacity-60">
            {saving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </form>
    </div>
  );
};

const HomepageManager = () => {
  const [content, setContent] = useState(null);
  const [products, setProducts] = useState([]);
  const [featuredCollections, setFeaturedCollections] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slideForm, setSlideForm] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      adminAxios.get('homepage'),
      adminAxios.get('products', { params: { limit: 200 } }),
      adminAxios.get('featured-collections'),
      adminAxios.get('testimonials'),
      adminAxios.get('newsletter', { params: { limit: 1 } }),
    ]).then(([homepageRes, productsRes, fcRes, testimonialsRes, newsletterRes]) => {
      setContent(homepageRes.data.data.content);
      setProducts(productsRes.data.data.products);
      setFeaturedCollections(fcRes.data.data.items);
      setTestimonials(testimonialsRes.data.data.testimonials);
      setSubscriberCount(newsletterRes.data.data.stats.total);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const saveSlide = async (form) => {
    if (slideForm.id) await adminAxios.put(`homepage/hero-slides/${slideForm.id}`, form);
    else await adminAxios.post('homepage/hero-slides', form);
    setSlideForm(null);
    fetchAll();
  };

  const deleteSlide = async (id) => {
    if (!window.confirm('Delete this hero slide?')) return;
    await adminAxios.delete(`homepage/hero-slides/${id}`);
    fetchAll();
  };

  const moveSlide = async (index, direction) => {
    const slides = [...content.heroSlides];
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    [slides[index], slides[target]] = [slides[target], slides[index]];
    await adminAxios.put('homepage/hero-slides/reorder', { orderedIds: slides.map((s) => s._id) });
    fetchAll();
  };

  const toggleSelection = async (field, id) => {
    const current = (content[field] || []).map((p) => p._id);
    const next = current.includes(id) ? current.filter((p) => p !== id) : [...current, id];
    await adminAxios.put('homepage/sections', { [field]: next });
    fetchAll();
  };

  const saveTestimonial = async (form) => {
    if (testimonialForm.id) await adminAxios.put(`testimonials/${testimonialForm.id}`, form);
    else await adminAxios.post('testimonials', form);
    setTestimonialForm(null);
    fetchAll();
  };

  const updateTestimonialStatus = async (id, status) => {
    await adminAxios.put(`testimonials/${id}`, { status });
    fetchAll();
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    await adminAxios.delete(`testimonials/${id}`);
    fetchAll();
  };

  if (loading || !content) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedSlides = [...content.heroSlides].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-6">Homepage Manager</h1>

      <div className="grid grid-cols-1 min-1481:grid-cols-3 gap-5">
        <div className="min-1481:col-span-2 space-y-5">
          {/* Hero Slider */}
          <div className="bg-white border border-cream-200 p-5">
            <div className="flex items-center justify-between max-480:flex-col max-480:items-start max-480:gap-2 mb-4">
              <p className="text-xs tracking-widest text-muted">1. HERO SLIDER</p>
              <button
                type="button"
                onClick={() => setSlideForm({ ...emptySlide, id: null })}
                className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-3 py-2 max-480:w-full max-480:justify-center"
              >
                <FiPlus size={13} /> ADD NEW SLIDE
              </button>
            </div>
            {sortedSlides.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">No hero slides yet.</p>
            ) : (
              <div className="space-y-2">
                {sortedSlides.map((s, i) => (
                  <div key={s._id} className="flex items-center gap-3 border border-cream-100 p-3">
                    {s.backgroundImage && <img src={driveImg(s.backgroundImage)} alt="" className="w-16 h-10 object-cover flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink truncate">{s.heading}</p>
                      <p className="text-xs text-muted truncate">{s.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button type="button" onClick={() => moveSlide(i, -1)} className="text-muted hover:text-brand"><FiArrowUp size={14} /></button>
                      <button type="button" onClick={() => moveSlide(i, 1)} className="text-muted hover:text-brand"><FiArrowDown size={14} /></button>
                      <button type="button" onClick={() => setSlideForm({ ...s, id: s._id })} className="text-muted hover:text-brand"><FiEdit2 size={14} /></button>
                      <button type="button" onClick={() => deleteSlide(s._id)} className="text-muted hover:text-charcoal"><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Testimonials */}
          <div className="bg-white border border-cream-200 p-5">
            <div className="flex items-center justify-between max-480:flex-col max-480:items-start max-480:gap-2 mb-4">
              <p className="text-xs tracking-widest text-muted">5. TESTIMONIALS</p>
              <button
                type="button"
                onClick={() => setTestimonialForm({ ...emptyTestimonial, id: null })}
                className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-3 py-2 max-480:w-full max-480:justify-center"
              >
                <FiPlus size={13} /> ADD TESTIMONIAL
              </button>
            </div>
            <p className="text-xs text-muted mb-3">Only approved testimonials will show on the homepage.</p>
            {testimonials.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">No testimonials yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs tracking-widest text-muted border-b border-cream-200">
                      <th className="py-2 font-normal">Customer</th>
                      <th className="py-2 font-normal">Rating</th>
                      <th className="py-2 font-normal max-1024:hidden">Message</th>
                      <th className="py-2 font-normal">Status</th>
                      <th className="py-2 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.map((t) => (
                      <tr key={t._id} className="border-b border-cream-100 last:border-0">
                        <td className="py-2 text-ink whitespace-nowrap">{t.customerName}</td>
                        <td className="py-2 text-gold whitespace-nowrap">{'★'.repeat(t.rating)}</td>
                        <td className="py-2 text-muted max-w-xs truncate max-1024:hidden">{t.message}</td>
                        <td className="py-2">
                          <span className={`text-[10px] tracking-wide px-2 py-1 ${t.status === 'approved' ? 'bg-brand/10 text-brand' : t.status === 'rejected' ? 'bg-charcoal/10 text-charcoal' : 'bg-gold/15 text-gold'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-2 text-muted">
                            {t.status !== 'approved' && (
                              <button type="button" onClick={() => updateTestimonialStatus(t._id, 'approved')} className="hover:text-brand"><FiCheck size={14} /></button>
                            )}
                            <button type="button" onClick={() => setTestimonialForm({ ...t, id: t._id })} className="hover:text-brand"><FiEdit2 size={14} /></button>
                            <button type="button" onClick={() => deleteTestimonial(t._id)} className="hover:text-charcoal"><FiTrash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Featured Collections picker */}
          <div className="bg-white border border-cream-200 p-5">
            <p className="text-xs tracking-widest text-muted mb-3">2. FEATURED COLLECTIONS</p>
            <p className="text-xs text-muted mb-3">{content.featuredCollections.length} Selected</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {featuredCollections.map((c) => (
                <label key={c._id} className="flex items-center gap-2 text-sm py-1">
                  <input
                    type="checkbox"
                    checked={content.featuredCollections.some((f) => f._id === c._id)}
                    onChange={() => toggleSelection('featuredCollections', c._id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {/* Best Sellers picker */}
          <div className="bg-white border border-cream-200 p-5">
            <p className="text-xs tracking-widest text-muted mb-3">3. BEST SELLERS</p>
            <p className="text-xs text-muted mb-3">{content.bestSellers.length} Selected</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {products.map((p) => (
                <label key={p._id} className="flex items-center gap-2 text-sm py-1">
                  <input
                    type="checkbox"
                    checked={content.bestSellers.some((b) => b._id === p._id)}
                    onChange={() => toggleSelection('bestSellers', p._id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>

          {/* New Arrivals picker */}
          <div className="bg-white border border-cream-200 p-5">
            <p className="text-xs tracking-widest text-muted mb-3">4. NEW ARRIVALS</p>
            <p className="text-xs text-muted mb-3">{content.newArrivals.length} Selected</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {products.map((p) => (
                <label key={p._id} className="flex items-center gap-2 text-sm py-1">
                  <input
                    type="checkbox"
                    checked={content.newArrivals.some((n) => n._id === p._id)}
                    onChange={() => toggleSelection('newArrivals', p._id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>

          {/* Newsletter summary */}
          <div className="bg-white border border-cream-200 p-5">
            <p className="text-xs tracking-widest text-muted mb-3">6. NEWSLETTER</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                <FiMail size={16} />
              </div>
              <div>
                <p className="font-serif text-lg text-ink">{subscriberCount}</p>
                <p className="text-xs text-muted">Total Subscribers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {slideForm && (
        <HeroSlideForm
          initial={slideForm}
          onCancel={() => setSlideForm(null)}
          onSave={saveSlide}
        />
      )}
      {testimonialForm && (
        <TestimonialForm
          initial={testimonialForm}
          onCancel={() => setTestimonialForm(null)}
          onSave={saveTestimonial}
        />
      )}
    </div>
  );
};

export default HomepageManager;
