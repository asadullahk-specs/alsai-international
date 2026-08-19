import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSliders, FiChevronDown } from 'react-icons/fi';
import publicAxios from '../../api/publicAxios';
import ProductCard from '../../components/ProductCard';
import FilterSidebar from '../../components/shop/FilterSidebar';
import { driveImg } from '../../utils/driveImg';
import usePageTitle from '../../hooks/usePageTitle';
import BrandSpinner from '../../components/BrandSpinner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const Shop = () => {
  usePageTitle('Shop');
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalPages: 1, total: 0 });
  const [collections, setCollections] = useState([]);
  const [fragranceFamilies, setFragranceFamilies] = useState([]);
  const [giftSets, setGiftSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = Object.fromEntries(searchParams.entries());

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const updateRange = (entries) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  const goToPage = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', page);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [websiteContent, setWebsiteContent] = useState(null);

  useEffect(() => {
    publicAxios.get('/layout').then(({ data }) => {
      setCollections(data.data.collections);
      setFragranceFamilies(data.data.fragranceFamilies);
      setWebsiteContent(data.data.websiteContent);
    });
    publicAxios.get('/gift-sets?limit=4').then(({ data }) => setGiftSets(data.data.giftSets));
  }, []);

  useEffect(() => {
    setLoading(true);
    publicAxios
      .get('/products', { params: filters })
      .then(({ data }) => {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const pageButtons = Array.from({ length: Math.min(pagination.totalPages, 6) }, (_, i) => i + 1);
  const rangeStart = products.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeEnd = (pagination.page - 1) * pagination.limit + products.length;

  // The banner is driven entirely by the admin-managed Collection the shopper
  // has filtered to (its own name/description/image) - no separate content
  // model needed. With no single collection selected, it falls back to a
  // generic "Shop" banner.
  const activeCollectionIds = (filters.collection || '').split(',').filter(Boolean);
  const activeCollection =
    activeCollectionIds.length === 1 ? collections.find((c) => c._id === activeCollectionIds[0]) : null;

  // const bannerEyebrow = activeCollection ? 'COLLECTION' : 'SHOP';
  const bannerTitle = activeCollection ? activeCollection.name : 'All Fragrances';
  const bannerText = activeCollection?.description || "Discover timeless perfumes crafted from the world's finest ingredients.";
  const bannerImage = activeCollection?.image || websiteContent?.shopPage?.allBannerImage;

  return (
    <div>
      <div className="bg-cream-100 relative overflow-hidden h-[532px] sm:h-[616px] md:h-[672px] flex items-center">
        {bannerImage && (
          <img src={driveImg(bannerImage)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Dark shade over the banner image - matches the homepage hero, and
            keeps the transparent navbar's white text/icons legible on top of
            whatever image the admin has set here. */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="max-w-7xl mx-auto px-4 relative w-full">
          <p className="text-xs text-cream-100/80 mb-3">
            <Link to="/" className="hover:text-gold">Home</Link> / Shop
          </p>
          {/* <p className="text-xs tracking-widest text-cream-100/90 mb-2">{bannerEyebrow}</p> */}
          <h1 className="font-serif text-3xl sm:text-4xl text-white">{bannerTitle}</h1>
          <p className="text-sm text-cream-100/90 mt-2 max-w-lg">{bannerText}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row lg:items-start gap-8">
        <FilterSidebar
          collections={collections}
          fragranceFamilies={fragranceFamilies}
          filters={filters}
          onFilterChange={updateFilter}
          onRangeChange={updateRange}
          onClearAll={clearAll}
          mobileOpen={filtersOpen}
          onCloseMobile={() => setFiltersOpen(false)}
        />

        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 text-xs tracking-widest text-ink border border-cream-200 px-4 py-2.5 mb-4 hover:border-ink transition-colors"
          >
            <FiSliders size={14} /> FILTERS
          </button>

          <div className="flex items-center justify-between max-480:flex-col max-480:items-start max-480:gap-2 mb-6 gap-4">
            <p className="text-sm text-muted max-480:order-2">
              Showing {rangeStart}-{rangeEnd} of {pagination.total} Perfumes
            </p>
            <div className="relative max-480:order-1">
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none text-xs tracking-widest text-ink border border-cream-200 pl-4 pr-9 py-2.5 bg-transparent hover:border-ink transition-colors focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort by: {o.label}
                  </option>
                ))}
              </select>
              <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink" />
            </div>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <BrandSpinner size="small" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted text-sm py-20 text-center">No products match these filters.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => goToPage(pagination.page - 1)}
                className="w-9 h-9 flex items-center justify-center rounded border border-cream-200 disabled:opacity-30 text-ink hover:border-brand transition-colors"
                aria-label="Previous page"
              >
                ‹
              </button>
              <span className="text-xs font-medium tracking-widest text-ink px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => goToPage(pagination.page + 1)}
                className="w-9 h-9 flex items-center justify-center rounded border border-cream-200 disabled:opacity-30 text-ink hover:border-brand transition-colors"
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {giftSets.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14 border-t border-cream-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs tracking-widest text-ink">— EXPLORE OUR GIFT SETS —</h2>
            <Link to="/gift-sets" className="text-xs text-brand hover:underline">
              VIEW ALL →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:pb-0 md:grid md:grid-cols-4 md:overflow-visible scrollbar-none">
            {giftSets.map((g) => (
              <Link
                key={g._id}
                to={`/gift-sets/${g.slug}`}
                className="group flex-shrink-0 max-480:w-[78vw] w-36 sm:w-44 md:w-auto snap-start"
              >
                <div className="aspect-square rounded-md overflow-hidden bg-cream-100 mb-2 relative">
                  {g.mainImage && (
                    <img
                      src={driveImg(g.mainImage)}
                      alt={g.name}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${
                        g.hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                      }`}
                    />
                  )}
                  {g.hoverImage && (
                    <img
                      src={driveImg(g.hoverImage)}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  )}
                </div>
                <p className="text-sm text-ink">{g.name}</p>
                {g.description && <p className="text-xs text-muted truncate">{g.description}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default Shop;