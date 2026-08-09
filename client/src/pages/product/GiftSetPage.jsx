import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import { driveImg } from '../../utils/driveImg';
import ProductGallery from '../../components/product/ProductGallery';

const GiftSetPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [giftSet, setGiftSet] = useState(null);
  const [bannerImage, setBannerImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    Promise.all([publicAxios.get(`/gift-sets/${slug}`), publicAxios.get('/layout')])
      .then(([giftSetRes, layoutRes]) => {
        setGiftSet(giftSetRes.data.data.giftSet);
        setBannerImage(layoutRes.data.data.websiteContent?.giftSetPage?.bannerImage || '');
        setQuantity(1);
        window.scrollTo(0, 0);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !giftSet) {
    return (
      <div className="text-center py-24">
        <p className="font-serif text-2xl text-ink mb-2">Gift Set Not Found</p>
        <Link to="/gift-sets" className="text-brand text-sm hover:underline">
          Back to Gift Sets
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(
      { _id: giftSet._id, slug: giftSet.slug, name: giftSet.name, mainImage: giftSet.mainImage },
      { size: 'Gift Set', price: giftSet.price, stock: 999 },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      {bannerImage && (
        <div className="bg-cream-100 relative overflow-hidden h-[160px] sm:h-[200px] md:h-[220px]">
          <img src={driveImg(bannerImage)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-10">
      <p className="text-xs text-muted mb-6">
        <Link to="/" className="hover:text-brand">
          Home
        </Link>{' '}
        &gt;{' '}
        <Link to="/gift-sets" className="hover:text-brand">
          Gift Sets
        </Link>{' '}
        &gt; {giftSet.name}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14">
        <ProductGallery product={giftSet} />

        <div>
          <p className="text-xs tracking-widest text-brand mb-2">CURATED SET</p>
          <h1 className="font-serif text-3xl text-ink mb-2">{giftSet.name}</h1>

          {giftSet.description && <p className="text-muted text-sm mb-4">{giftSet.description}</p>}

          <div className="flex items-center gap-3 mb-6">
            <span className="font-serif text-2xl text-ink">{formatPrice(giftSet.price)}</span>
          </div>

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
              <button type="button" onClick={() => setQuantity((q) => q + 1)} className="w-9 h-10 text-ink hover:text-brand">
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 transition-colors mb-8"
          >
            {added ? 'ADDED ✓' : 'ADD TO CART'}
          </button>

          {giftSet.includedProducts?.length > 0 && (
            <div>
              <p className="text-xs tracking-widest text-muted mb-3">WHAT&apos;S INCLUDED</p>
              <div className="space-y-3">
                {giftSet.includedProducts.map((row, i) => {
                  const p = row.product;
                  if (!p) return null;
                  return (
                    <Link
                      key={i}
                      to={`/product/${p.slug}`}
                      className="flex items-center gap-3 border border-cream-200 p-3 hover:border-brand transition-colors"
                    >
                      <div className="w-14 h-14 flex-shrink-0 bg-cream-100 rounded-md overflow-hidden">
                        {p.mainImage && <img src={driveImg(p.mainImage)} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-ink truncate">{p.name}</p>
                        <p className="text-xs text-muted">{row.size}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default GiftSetPage;
