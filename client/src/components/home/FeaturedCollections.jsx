import { Link } from 'react-router-dom';
import { driveImg } from '../../utils/driveImg';

const FeaturedCollections = ({ collections = [] }) => {
  if (collections.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs tracking-widest text-ink">FEATURED COLLECTIONS</h2>
        <Link to="/shop" className="text-xs text-brand hover:underline">
          VIEW ALL →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:pb-0 md:grid md:grid-cols-5 md:overflow-visible scrollbar-none">
        {collections.map((col) => (
          <Link
            key={col._id}
            to={`/shop?featuredCollection=${col._id}`}
            className="group flex-shrink-0 w-36 sm:w-44 md:w-auto snap-start"
          >
            <div className="aspect-[3/4] overflow-hidden bg-cream-100 mb-2">
              {col.image && (
                <img
                  src={driveImg(col.image)}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <p className="text-sm text-ink">{col.name}</p>
            {col.description && <p className="text-xs text-muted truncate">{col.description}</p>}
            <span className="text-xs text-brand">Explore →</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;