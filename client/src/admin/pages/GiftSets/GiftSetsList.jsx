import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { formatPrice } from '../../../utils/formatPrice';
import { driveImg } from '../../../utils/driveImg';

const GiftSetsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = () => {
    setLoading(true);
    adminAxios
      .get('gift-sets')
      .then(({ data }) => setItems(data.data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gift set? This cannot be undone.')) return;
    await adminAxios.delete(`gift-sets/${id}`);
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">Gift Sets</h1>
          <p className="text-sm text-muted">Manage curated bundles of products sold as gift sets.</p>
        </div>
        <Link
          to="/admin/gift-sets/new"
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 rounded-md transition-colors flex-shrink-0"
        >
          <FiPlus size={14} /> ADD NEW GIFT SET
        </Link>
      </div>

      {loading ? (
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted py-10 text-center">No gift sets yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-cream-200 rounded-md overflow-hidden">
              <div className="aspect-square bg-cream-100">
                {item.mainImage && <img src={driveImg(item.mainImage)} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <p className="text-sm text-ink font-medium truncate">{item.name}</p>
                <p className="text-sm text-brand mb-2">{formatPrice(item.price)}</p>
                <p className="text-xs text-muted mb-3">{item.includedProducts?.length || 0} products included</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] tracking-wide px-2 py-1 rounded-full ${
                      item.isActive ? 'bg-brand/10 text-brand' : 'bg-cream-200 text-muted'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link to={`/admin/gift-sets/${item._id}`} className="text-muted hover:text-brand">
                      <FiEdit2 size={14} />
                    </Link>
                    <button type="button" onClick={() => handleDelete(item._id)} className="text-muted hover:text-charcoal">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GiftSetsList;
