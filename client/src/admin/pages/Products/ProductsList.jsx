import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { formatPrice } from '../../../utils/formatPrice';
import { driveImg } from '../../../utils/driveImg';
import Pagination from '../../components/common/Pagination';

const ProductsList = () => {
  const [urlParams, setUrlParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState(urlParams.get('search') || '');
  const [collections, setCollections] = useState([]);
  const [collectionFilter, setCollectionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Keeps this tab's own search box in sync with the header search bar - the
  // header only ever updates the URL for whichever tab is currently open, so
  // this effect is what actually applies that query to this page's data.
  useEffect(() => {
    const fromUrl = urlParams.get('search') || '';
    setSearch((current) => (current === fromUrl ? current : fromUrl));
  }, [urlParams]);

  useEffect(() => {
    adminAxios.get('collections').then(({ data }) => setCollections(data.data.collections || data.data.items || []));
  }, []);

  const fetchProducts = (page = 1, searchTerm = search, collectionId = collectionFilter) => {
    setLoading(true);
    adminAxios
      .get('products', { params: { page, search: searchTerm, collection: collectionId || undefined, limit: 10 } })
      .then(({ data }) => {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  // Catches search as the admin types - no need to press Enter. Re-fetches
  // (from page 1) whenever the query changes, same pattern as every other
  // admin list page's own search box.
  useEffect(() => {
    fetchProducts(1, search, collectionFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('search', value);
      else next.delete('search');
      return next;
    }, { replace: true });
  };

  const handleCollectionChange = (value) => {
    setCollectionFilter(value);
    fetchProducts(1, search, value);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    await adminAxios.delete(`products/${id}`);
    fetchProducts(pagination.page);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-3">
        <h1 className="font-serif text-2xl text-ink">Products</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 transition-colors flex-shrink-0"
        >
          <FiPlus size={14} /> ADD PRODUCT
        </Link>
      </div>
      <p className="text-sm text-muted mb-6">Total Products: {pagination.total}</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-sm flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2.5 border border-cream-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <select
          value={collectionFilter}
          onChange={(e) => handleCollectionChange(e.target.value)}
          className="px-4 py-2.5 border border-cream-200 bg-white text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand sm:w-56"
        >
          <option value="">All Collections (Perfumes &amp; Attars)</option>
          {collections.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      ) : products.length === 0 ? (
        <p className="text-sm text-muted py-10 text-center">No products found.</p>
      ) : (
        <>
          <div className="bg-white border border-cream-200 rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 text-left text-xs tracking-widest text-muted">
                  <th className="p-4 font-normal hidden sm:table-cell">Image</th>
                  <th className="p-4 font-normal">Title</th>
                  <th className="p-4 font-normal hidden sm:table-cell">Category</th>
                  <th className="p-4 font-normal hidden md:table-cell">Fragrance Family</th>
                  <th className="p-4 font-normal">Stock</th>
                  <th className="p-4 font-normal hidden sm:table-cell">Status</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-cream-100 last:border-0">
                    <td className="p-4 hidden sm:table-cell">
                      <div className="w-10 h-10 rounded-md bg-cream-100 overflow-hidden">
                        {p.mainImage && <img src={driveImg(p.mainImage)} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-ink whitespace-nowrap">{p.name}</p>
                      <p className="text-xs text-muted">{formatPrice(p.basePrice)}</p>
                    </td>
                    <td className="p-4 text-muted whitespace-nowrap hidden sm:table-cell">{p.collection?.name || '-'}</td>
                    <td className="p-4 text-muted whitespace-nowrap hidden md:table-cell">{p.fragranceFamily?.name || '-'}</td>
                    <td className="p-4">
                      <span
                        className={
                          p.totalStock === 0
                            ? 'text-charcoal'
                            : p.totalStock <= p.lowStockThreshold
                              ? 'text-gold'
                              : 'text-brand'
                        }
                      >
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span
                        className={`text-[10px] tracking-wide px-2 py-1 rounded-full ${p.isActive && !p.isHidden ? 'bg-brand/10 text-brand' : 'bg-cream-200 text-muted'
                          }`}
                      >
                        {p.isActive && !p.isHidden ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link to={`/product/${p.slug}`} target="_blank" className="text-muted hover:text-brand">
                          <FiEye size={15} />
                        </Link>
                        <Link to={`/admin/products/${p._id}`} className="text-muted hover:text-brand">
                          <FiEdit2 size={15} />
                        </Link>
                        <button type="button" onClick={() => handleDelete(p._id)} className="text-muted hover:text-charcoal">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={(p) => fetchProducts(p)} />
        </>
      )}
    </div>
  );
};

export default ProductsList;