import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';

// Best Sellers / New Arrivals now use the exact same product card as the
// Shop page (add-to-cart, discount badge, size badge, etc.) instead of the
// old stripped-down homepage-only card, so the product grid looks and
// behaves identically everywhere it appears on the site.
const ProductRow = ({ title, products = [], viewAllLink, mediaMode = 'image' }) => {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs tracking-widest text-ink">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-xs text-brand hover:underline">
            VIEW ALL →
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-5 md:overflow-visible scrollbar-none">
        {products.map((p) => (
          <div key={p._id} className="flex-shrink-0 w-40 sm:w-48 md:w-auto snap-start">
            <ProductCard product={p} mediaMode={mediaMode} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductRow;