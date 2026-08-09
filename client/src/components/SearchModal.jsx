import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import publicAxios from '../api/publicAxios';
import { formatPrice } from '../utils/formatPrice';

const SearchModal = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return undefined;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      publicAxios
        .get('/products', { params: { search: query, limit: 6 } })
        .then(({ data }) => setResults(data.data.products))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const goToResults = () => {
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') goToResults();
    if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label="Close search" onClick={onClose} className="absolute inset-0 bg-charcoal/50" />
      <div className="relative max-w-2xl mx-auto mt-20 max-480:mt-8 mx-4 bg-cream rounded-md shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-cream-200">
          <FiSearch size={18} className="text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for perfumes, attars, gift sets..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-ink"
          />
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink flex-shrink-0">
            <FiX size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && <p className="text-sm text-muted text-center py-8">Searching...</p>}

          {!loading && query.trim() && results.length === 0 && (
            <p className="text-sm text-muted text-center py-8">No products found for &quot;{query}&quot;.</p>
          )}

          {!loading &&
            results.map((p) => {
              const size = p.sizes?.[0];
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    navigate(`/product/${p.slug}`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-cream-100 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded bg-cream-100 overflow-hidden flex-shrink-0">
                    {p.mainImage && <img src={p.mainImage} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{p.name}</p>
                    {size && <p className="text-xs text-muted">{formatPrice(size.salePrice || size.price)}</p>}
                  </div>
                </button>
              );
            })}

          {!loading && results.length > 0 && (
            <button
              type="button"
              onClick={goToResults}
              className="w-full text-center text-xs tracking-widest text-brand py-3 border-t border-cream-200 hover:underline"
            >
              VIEW ALL RESULTS FOR &quot;{query.toUpperCase()}&quot; →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
