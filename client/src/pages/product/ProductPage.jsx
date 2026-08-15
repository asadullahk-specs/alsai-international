import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShare2, FiStar } from 'react-icons/fi';
import publicAxios from '../../api/publicAxios';
import customerAxios from '../../api/customerAxios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import { addRecentlyViewed, getRecentlyViewedIds } from '../../utils/recentlyViewed';
import ProductGallery from '../../components/product/ProductGallery';
import ReviewsSection from '../../components/product/ReviewsSection';
import ProductCard from '../../components/ProductCard';
import usePageTitle from '../../hooks/usePageTitle';
import BrandSpinner from '../../components/BrandSpinner';

const TABS = ['Description', 'Shipping', 'Facts', 'Reviews'];

const ProductPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  usePageTitle('Products', product?.name);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    publicAxios
      .get(`/products/${slug}`)
      .then(({ data }) => {
        const p = data.data.product;
        setProduct(p);
        setSelectedSize(p.sizes?.[0]);
        setQuantity(1);
        addRecentlyViewed(p._id);
        window.scrollTo(0, 0);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const ids = getRecentlyViewedIds().filter((id) => id !== product._id);
    if (ids.length === 0) {
      setRecentlyViewed([]);
      return;
    }
    publicAxios.get('/products', { params: { ids: ids.join(',') } }).then(({ data }) => {
      const ordered = ids.map((id) => data.data.products.find((p) => p._id === id)).filter(Boolean);
      setRecentlyViewed(ordered);
    });
  }, [product]);

  if (loading) {
    return <BrandSpinner fullPage />;
  }

  if (notFound || !product || !selectedSize) {
    return (
      <div className="text-center py-24">
        <p className="font-serif text-2xl text-ink mb-2">Product Not Found</p>
        <Link to="/shop" className="text-brand text-sm hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const discount = selectedSize.salePrice ? Math.round((1 - selectedSize.salePrice / selectedSize.price) * 100) : 0;
  const outOfStock = selectedSize.stock === 0;
  const lowStock = !outOfStock && selectedSize.stock <= (product.lowStockThreshold || 15);

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem(product, selectedSize, quantity);
  };

  const handleToggleWishlist = () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${product.slug}` } });
      return;
    }
    const next = !wishlisted;
    setWishlisted(next);
    const request = next
      ? customerAxios.post(`/wishlist/${product._id}`)
      : customerAxios.delete(`/wishlist/${product._id}`);
    request.catch(() => setWishlisted(!next));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch {
        // user cancelled the share sheet - nothing to do
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <p className="text-xs text-muted mb-6">
        <Link to="/" className="hover:text-brand">
          Home
        </Link>{' '}
        &gt;{' '}
        <Link to="/shop" className="hover:text-brand">
          Shop
        </Link>
        {product.collection && (
          <>
            {' '}
            &gt;{' '}
            <Link to={`/shop?collection=${product.collection._id}`} className="hover:text-brand">
              {product.collection.name}
            </Link>
          </>
        )}{' '}
        &gt; {product.name}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14">
        <ProductGallery product={product} />

        <div>
          {product.featuredCollection && (
            <p className="text-xs tracking-widest text-brand mb-2">{product.featuredCollection.name.toUpperCase()}</p>
          )}
          <h1 className="font-serif text-3xl text-ink mb-2">{product.name}</h1>

          {product.ratingCount > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className={i < Math.round(product.ratingAverage) ? 'fill-gold text-gold' : 'text-cream-200'}
                />
              ))}
              <span className="text-sm text-muted">({product.ratingCount})</span>
            </div>
          )}

          {product.shortDescription && <p className="text-muted text-sm mb-4">{product.shortDescription}</p>}

          <div className="flex items-center gap-3 mb-6">
            <span className="font-serif text-2xl text-ink">{formatPrice(selectedSize.salePrice || selectedSize.price)}</span>
            {selectedSize.salePrice && (
              <>
                <span className="text-muted line-through text-sm">{formatPrice(selectedSize.price)}</span>
                <span className="bg-brand/10 text-brand text-xs px-2 py-1 rounded">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-xs tracking-widest text-muted mb-2">SIZE: {selectedSize.size}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {product.sizes.map((s) => (
              <button
                type="button"
                key={s.size}
                onClick={() => setSelectedSize(s)}
                className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                  selectedSize.size === s.size ? 'border-brand bg-brand text-white' : 'border-cream-200 text-ink hover:border-brand'
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>

          <p className={`text-xs mb-4 ${outOfStock ? 'text-charcoal' : lowStock ? 'text-gold' : 'text-brand'}`}>
            {outOfStock ? 'Out of Stock' : lowStock ? `Only ${selectedSize.stock} left · Ready to Ship` : 'In Stock · Ready to Ship'}
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-cream-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-10 text-ink hover:text-brand"
              >
                −
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(selectedSize.stock || 1, q + 1))}
                className="w-9 h-10 text-ink hover:text-brand"
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="w-full bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 transition-colors mb-4 disabled:opacity-40"
          >
            {outOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>

          <div className="flex items-center gap-5 text-sm text-muted">
            <button type="button" onClick={handleToggleWishlist} className="flex items-center gap-1.5 hover:text-brand">
              <FiHeart size={15} className={wishlisted ? 'fill-brand text-brand' : ''} /> Add to Wishlist
            </button>
            <button type="button" onClick={handleShare} className="flex items-center gap-1.5 hover:text-brand">
              <FiShare2 size={15} /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-cream-200 flex gap-8 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs tracking-widest pb-3 border-b-2 flex-shrink-0 transition-colors ${
              activeTab === tab ? 'border-brand text-ink' : 'border-transparent text-muted'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mb-16 min-h-[120px]">
        {activeTab === 'Description' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <p className="text-sm text-muted leading-relaxed">{product.fullDescription}</p>
            {(product.fragranceNotes?.top?.length || product.fragranceNotes?.heart?.length || product.fragranceNotes?.base?.length) ? (
              <div className="space-y-3">
                {product.fragranceNotes.top?.length > 0 && (
                  <p className="text-sm">
                    <span className="text-ink font-medium">Top Notes: </span>
                    <span className="text-muted">{product.fragranceNotes.top.join(', ')}</span>
                  </p>
                )}
                {product.fragranceNotes.heart?.length > 0 && (
                  <p className="text-sm">
                    <span className="text-ink font-medium">Heart Notes: </span>
                    <span className="text-muted">{product.fragranceNotes.heart.join(', ')}</span>
                  </p>
                )}
                {product.fragranceNotes.base?.length > 0 && (
                  <p className="text-sm">
                    <span className="text-ink font-medium">Base Notes: </span>
                    <span className="text-muted">{product.fragranceNotes.base.join(', ')}</span>
                  </p>
                )}
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'Shipping' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              ['Delivery Time', product.shippingInfo?.deliveryTime],
              ['Shipping Charges', product.shippingInfo?.shippingCharges],
              ['Return & Exchange', product.shippingInfo?.returnExchange],
              ['Order Cancellation', product.shippingInfo?.orderCancellation],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sm text-ink font-medium mb-1">{label}</p>
                <p className="text-xs text-muted">{value || 'Contact us for details.'}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Facts' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[
              ['Concentration', product.facts?.concentration],
              ['Longevity', product.facts?.longevity],
              ['Sillage', product.facts?.sillage],
              ['Gender', product.facts?.gender],
              ['Ingredients', product.facts?.ingredients],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs tracking-widest text-muted mb-1">{label.toUpperCase()}</p>
                  <p className="text-sm text-ink">{value}</p>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'Reviews' && (
          <ReviewsSection productId={product._id} ratingAverage={product.ratingAverage} ratingCount={product.ratingCount} />
        )}
      </div>

      {product.relatedProducts?.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xs tracking-widest text-ink mb-6">RELATED PRODUCTS</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="text-xs tracking-widest text-ink mb-6">RECENTLY VIEWED</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {recentlyViewed.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
