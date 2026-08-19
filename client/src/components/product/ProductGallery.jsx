import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import { driveImg } from '../../utils/driveImg';

const ProductGallery = ({ product }) => {
  const media = [
    ...(product.video ? [{ type: 'video', src: product.video }] : []),
    ...(product.mainImage ? [{ type: 'image', src: product.mainImage }] : []),
    ...(product.hoverImage ? [{ type: 'image', src: product.hoverImage }] : []),
    ...(product.galleryImages || []).map((src) => ({ type: 'image', src })),
  ];
  const [active, setActive] = useState(0);
  const current = media[active];

  if (media.length === 0) {
    return <div className="aspect-square bg-cream-100 rounded-md" />;
  }

  return (
    <div>
      <div className="aspect-square bg-cream-100 rounded-md overflow-hidden mb-3">
        {current.type === 'video' ? (
          <video src={driveImg(current.src)} controls className="w-full h-full object-cover" />
        ) : (
          <img src={driveImg(current.src)} alt={product.name} className="w-full h-full object-cover" />
        )}
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((m, i) => (
            <button
              type="button"
              key={`${m.type}-${i}`}
              onClick={() => setActive(i)}
              className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                i === active ? 'border-brand' : 'border-transparent'
              }`}
            >
              {m.type === 'video' ? (
                <div className="w-full h-full bg-charcoal flex items-center justify-center text-white">
                  <FiPlay size={16} />
                </div>
              ) : (
                <img src={driveImg(m.src)} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
