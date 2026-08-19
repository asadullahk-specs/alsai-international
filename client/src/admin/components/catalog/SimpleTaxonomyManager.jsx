import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { driveImg } from '../../../utils/driveImg';

const SimpleTaxonomyManager = ({ title, description, apiPath, hasImage = true, hasDescription = true, hasVideo = false, hasCollectionSelect = false }) => {
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', video: '', collection: '', belongsTo: 'Both', isActive: true, displayOrder: 0 });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = () => {
    setLoading(true);
    adminAxios
      .get(apiPath)
      .then(({ data }) => setItems(data.data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
    if (hasCollectionSelect) {
      adminAxios.get('/collections').then(({ data }) => setCollections(data.data.items));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath]);

  const openNewForm = () => {
    setForm({ name: '', description: '', image: '', video: '', collection: collections[0]?._id || '', belongsTo: 'Both', isActive: true, displayOrder: items.length });
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setForm({
      name: item.name,
      description: item.description || '',
      image: item.image || '',
      video: item.video || '',
      collection: item.collection?._id || item.collection || '',
      belongsTo: item.belongsTo || 'Both',
      isActive: item.isActive,
      displayOrder: item.displayOrder,
    });
    setEditingId(item._id);
    setError('');
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, displayOrder: Number(form.displayOrder) };
      if (editingId) {
        await adminAxios.put(`${apiPath}/${editingId}`, payload);
      } else {
        await adminAxios.post(apiPath, payload);
      }
      setShowForm(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    await adminAxios.delete(`${apiPath}/${id}`);
    fetchItems();
  };

  const singular = title.endsWith('s') ? title.slice(0, -1) : title;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">{title}</h1>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        <button
          type="button"
          onClick={openNewForm}
          className="flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 transition-colors flex-shrink-0"
        >
          <FiPlus size={14} /> ADD NEW
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-md p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-ink">{editingId ? `Edit ${singular}` : `Add New ${singular}`}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-ink">
                <FiX size={18} />
              </button>
            </div>
            {error && <p className="text-sm text-charcoal">{error}</p>}
            <input
              name="name"
              required
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {hasDescription && (
              <textarea
                name="description"
                placeholder="Description (optional)"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none"
              />
            )}
            {hasImage && (
              <input
                name="image"
                placeholder="Image (Google Drive link)"
                value={form.image}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            )}
            {hasVideo && (
              <input
                name="video"
                placeholder="Video (Google Drive link, optional - shown instead of the image on the homepage)"
                value={form.video}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            )}
            {hasCollectionSelect && (
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5">BELONGS TO</label>
                <select
                  name="belongsTo"
                  value={form.belongsTo || 'Both'}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="Perfumes">Perfumes</option>
                  <option value="Attars">Attars</option>
                  <option value="Both">Both</option>
                </select>
                <p className="text-xs text-muted mt-1.5">Controls which navbar dropdown (Perfumes, Attars, or Both) shows this family.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="displayOrder"
                placeholder="Display Order"
                value={form.displayOrder}
                onChange={handleChange}
                className="px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="text-brand" />
                Active
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-3 rounded-md hover:border-ink transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 rounded-md transition-colors disabled:opacity-60"
              >
                {submitting ? 'SAVING...' : 'SAVE'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted py-10 text-center">Nothing here yet.</p>
      ) : (
        <div className="bg-white border border-cream-200 rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-left text-xs tracking-widest text-muted">
                {hasImage && <th className="p-4 max-480:p-2 font-normal">Image</th>}
                <th className="p-4 max-480:p-2 max-480:text-[11px] max-320:text-[9px] font-normal">Name</th>
                {hasCollectionSelect && <th className="p-4 max-480:p-2 max-480:text-[11px] max-320:text-[9px] font-normal table-cell max-640:hidden">Belongs To</th>}
                <th className="p-4 max-480:p-2 max-480:text-[11px] max-320:text-[9px] font-normal table-cell max-520:hidden">Status</th>
                <th className="p-4 max-480:p-2 max-480:text-[11px] max-320:text-[9px] font-normal">Order</th>
                <th className="p-4 max-480:p-2 max-480:text-[11px] max-320:text-[9px] font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-cream-100 last:border-0">
                  {hasImage && (
                    <td className="p-4 max-480:p-2">
                      <div className="w-10 h-10 max-320:w-7 max-320:h-7 rounded-md bg-cream-100 overflow-hidden">
                        {item.image && <img src={driveImg(item.image)} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                    </td>
                  )}
                  <td className="p-4 max-480:p-2 max-480:text-xs max-320:text-[10px] text-ink whitespace-nowrap">{item.name}</td>
                  {hasCollectionSelect && (
                    <td className="p-4 max-480:p-2 table-cell max-640:hidden text-sm text-muted">{item.belongsTo || item.collection?.name || 'Both'}</td>
                  )}
                  <td className="p-4 max-480:p-2 table-cell max-520:hidden">
                    <span
                      className={`text-[10px] max-320:text-[9px] tracking-wide px-2 py-1 rounded-full ${
                        item.isActive ? 'bg-brand/10 text-brand' : 'bg-cream-200 text-muted'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 max-480:p-2 max-480:text-xs max-320:text-[10px] text-muted">{item.displayOrder}</td>
                  <td className="p-4 max-480:p-2 text-right">
                    <div className="flex items-center justify-end gap-2 max-480:gap-1.5">
                      <button type="button" onClick={() => openEditForm(item)} className="text-muted hover:text-brand">
                        <FiEdit2 className="max-320:w-3 max-320:h-3" size={15} />
                      </button>
                      <button type="button" onClick={() => handleDelete(item._id)} className="text-muted hover:text-charcoal">
                        <FiTrash2 className="max-320:w-3 max-320:h-3" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SimpleTaxonomyManager;
