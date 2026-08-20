import { useState, useEffect, useCallback, useRef } from 'react';
import { FiStar, FiUpload, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';
import { useAuth } from '../../context/AuthContext';
import SliderProgress from '../SliderProgress';

const ReviewForm = ({ productId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    if (!reviewText.trim()) {
      setError('Please write a few words about your experience.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', rating);
      formData.append('reviewText', reviewText.trim());
      if (image) formData.append('image', image);

      const { data } = await publicAxios.post('/reviews', formData, {
        headers: { 'Content-Type': undefined },
      });
      setSuccess(data.message || "Thanks for your review! It will appear once approved.");
      setRating(0);
      setReviewText('');
      setImage(null);
      onSubmitted?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit your review right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="border border-cream-200 rounded-md p-5 bg-cream-50">
        <p className="text-sm text-ink">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-cream-200 rounded-md p-5 space-y-3">
      <p className="text-sm text-ink font-medium">Write a review</p>
      {error && <p className="text-sm text-charcoal">{error}</p>}

      <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
            >
              <FiStar size={22} className={value <= (hoverRating || rating) ? 'fill-gold text-gold' : 'text-cream-300'} />
            </button>
          );
        })}
      </div>

      <textarea
        rows={3}
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Share your experience with this fragrance..."
        maxLength={1000}
        className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none"
      />

      <div>
        <label className="text-xs text-muted block mb-1.5">Add a photo (optional)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="hidden"
        />
        {image ? (
          <div className="flex items-center gap-3 border border-cream-200 rounded-md p-2.5 bg-cream-50">
            <img src={URL.createObjectURL(image)} alt="Selected upload" className="w-11 h-11 rounded-md object-cover flex-shrink-0" />
            <p className="flex-1 min-w-0 text-xs text-ink truncate">{image.name}</p>
            <button
              type="button"
              onClick={() => {
                setImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              aria-label="Remove photo"
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-charcoal hover:bg-cream-100 transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 border border-dashed border-cream-300 rounded-md px-4 py-2.5 text-xs text-muted hover:border-brand hover:text-brand transition-colors w-full sm:w-auto"
          >
            <FiUpload size={14} /> Choose a photo
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-5 py-2.5 rounded-md disabled:opacity-60"
      >
        {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
      </button>
    </form>
  );
};

const ReviewsSection = ({ productId, ratingAverage, ratingCount }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const fetchReviews = useCallback(() => {
    if (!productId) return;
    publicAxios
      .get(`/reviews/product/${productId}`)
      .then(({ data }) => setReviews(data.data.reviews))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const next = () => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector(':scope > div');
      const step = card ? card.offsetWidth + 16 : 300;
      scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const prev = () => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector(':scope > div');
      const step = card ? card.offsetWidth + 16 : 300;
      scrollRef.current.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiStar size={20} className="fill-gold text-gold" />
          <span className="font-serif text-3xl text-ink">{(ratingAverage || 0).toFixed(1)}</span>
          <span className="text-muted text-sm">Based on {ratingCount || 0} reviews</span>
        </div>
        {reviews.length > 2 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous reviews"
              className="w-8 h-8 border border-cream-200 flex items-center justify-center text-ink hover:border-brand transition-colors"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next reviews"
              className="w-8 h-8 border border-cream-200 flex items-center justify-center text-ink hover:border-brand transition-colors"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="mb-8 max-w-lg">
        {user ? (
          <ReviewForm productId={productId} onSubmitted={fetchReviews} />
        ) : (
          <p className="text-sm text-muted border border-cream-200 rounded-md p-4">
            <Link to="/login" className="text-brand hover:underline">
              Log in
            </Link>{' '}
            to write a review for this product.
          </p>
        )}
      </div>

      {loading ? (
        <div className="h-6 w-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted">No reviews yet - be the first to share your thoughts.</p>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none scroll-smooth"
          >
            {reviews.map((r) => (
              <div
                key={r._id}
                className="flex-shrink-0 w-full xs:w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2.5rem)/3)] md:w-[calc((100%-3.75rem)/4)] lg:w-[calc((100%-5rem)/5)] snap-start border border-cream-200 rounded-md p-4 bg-white"
              >
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
                {r.image && <img src={r.image} alt="Customer upload" className="mt-3 w-24 h-24 object-cover rounded-md" />}
              </div>
            ))}
          </div>
          <SliderProgress scrollRef={scrollRef} total={reviews.length} itemLabel="reviews" />
        </>
      )}
    </div>
  );
};

export default ReviewsSection;