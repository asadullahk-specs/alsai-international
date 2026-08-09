import { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import publicAxios from '../../api/publicAxios';

const ReviewsSection = ({ productId, ratingAverage, ratingCount }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    publicAxios
      .get(`/reviews/product/${productId}`)
      .then(({ data }) => setReviews(data.data.reviews))
      .finally(() => setLoading(false));
  }, [productId]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <FiStar size={20} className="fill-gold text-gold" />
        <span className="font-serif text-3xl text-ink">{(ratingAverage || 0).toFixed(1)}</span>
        <span className="text-muted text-sm">Based on {ratingCount || 0} reviews</span>
      </div>

      {loading ? (
        <div className="h-6 w-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted">No reviews yet - be the first to share your thoughts once you've made a purchase.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {reviews.map((r) => (
            <div key={r._id} className="border border-cream-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                {r.customer?.avatar ? (
                  <img src={r.customer.avatar} alt={r.customer.fullName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center text-xs text-muted">
                    {r.customer?.fullName?.[0] || '?'}
                  </div>
                )}
                <div>
                  <p className="text-sm text-ink">{r.customer?.fullName || 'Anonymous'}</p>
                  <div className="flex text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} size={11} className={i < r.rating ? 'fill-gold' : 'opacity-25'} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted">{r.reviewText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
