import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiChevronLeft, FiChevronRight, FiImage, FiUpload, FiX } from 'react-icons/fi';
import { driveImg } from '../../utils/driveImg';
import { useAuth } from '../../context/AuthContext';
import publicAxios from '../../api/publicAxios';

// Cards per page follows the breakpoint (4 desktop / 2 tablet / 1 mobile) but
// always slides through the full set rather than ever wrapping extra cards
// onto a second row - that's what keeps the section height constant.
const usePerPage = () => {
  const getPerPage = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 4;
  };
  const [perPage, setPerPage] = useState(getPerPage);

  useEffect(() => {
    const handleResize = () => setPerPage(getPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return perPage;
};

// Cards always render at the same height regardless of whether a review image
// is present - the image slot is always reserved (blank/placeholder if unused)
// so a page of mixed cards never looks jagged.
// Lets a logged-in customer share their overall brand experience (distinct
// from a product Review). Submissions are always 'pending' until an admin
// approves them from the moderation queue - nothing here can publish itself.
// Customers can share more than one testimonial over time, so this always
// offers a "share another" entry point rather than locking after the first.
const ShareExperience = () => {
  const [mine, setMine] = useState(undefined); // undefined = loading
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(null);
  const fileInputRef = useRef(null);

  const fetchMine = useCallback(() => {
    publicAxios
      .get('/testimonials/mine')
      .then(({ data }) => setMine(data.data.testimonials || []))
      .catch(() => setMine([]));
  }, []);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setMessage('');
    setImage(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    if (!message.trim()) {
      setError('Please share a short message.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('message', message.trim());
      if (image) formData.append('image', image);
      const { data } = await publicAxios.post('/testimonials', formData, { headers: { 'Content-Type': undefined } });
      setJustSubmitted(data.data.testimonial);
      setMine((prev) => [data.data.testimonial, ...(prev || [])]);
      resetForm();
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (mine === undefined) return null;

  if (justSubmitted && !open) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center border border-cream-200 bg-white p-5">
        <p className="text-sm text-ink mb-3">
          {justSubmitted.status === 'approved'
            ? 'Thanks - your testimonial is live above!'
            : 'Thanks for sharing your experience! It will appear here once approved.'}
        </p>
        <button
          type="button"
          onClick={() => {
            setJustSubmitted(null);
            setOpen(true);
          }}
          className="border border-ink/20 text-ink text-xs tracking-widest px-6 py-3 hover:border-ink transition-colors"
        >
          SHARE ANOTHER EXPERIENCE
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="text-center mt-10">
        <button type="button" onClick={() => setOpen(true)} className="border border-ink/20 text-ink text-xs tracking-widest px-6 py-3 hover:border-ink transition-colors">
          {mine.length > 0 ? 'SHARE ANOTHER EXPERIENCE' : 'SHARE YOUR EXPERIENCE'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-10 border border-cream-200 rounded-md bg-white p-5 space-y-3">
      <p className="text-sm text-ink font-medium">Share your experience with AL SA&apos;I</p>
      {error && <p className="text-sm text-charcoal">{error}</p>}

      <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button key={value} type="button" onClick={() => setRating(value)} onMouseEnter={() => setHoverRating(value)} aria-label={`${value} stars`}>
              <FiStar size={22} className={value <= (hoverRating || rating) ? 'fill-gold text-gold' : 'text-cream-300'} />
            </button>
          );
        })}
      </div>

      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={image ? 100 : 150}
        placeholder="What's your experience been like with AL SA'I?"
        className="w-full px-4 py-2.5 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none"
      />

      {/* Photo picker styled to match the product Review form's upload
          control, so the "choose a photo" experience reads the same
          everywhere on the site. */}
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

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-5 py-2.5 rounded-md disabled:opacity-60">
          {submitting ? 'SUBMITTING...' : 'SUBMIT'}
        </button>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setOpen(false);
          }}
          className="text-xs text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const Testimonials = ({ testimonials = [] }) => {
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const next = useCallback(() => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector(':scope > div');
      const step = card ? card.offsetWidth + 20 : 300;
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      if (scrollRef.current.scrollLeft >= maxScroll - 5) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
      }
    }
  }, []);

  const prev = useCallback(() => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector(':scope > div');
      const step = card ? card.offsetWidth + 20 : 300;
      if (scrollRef.current.scrollLeft <= 5) {
        scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    if (testimonials.length <= 4) return undefined;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, testimonials.length]);

  if (testimonials.length === 0 && !user) return null;

  const avgRating = testimonials.length ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1) : '0.0';

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl text-ink">What Our Customers Say</h2>
          <span className="heading-underline" />
          {testimonials.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
              <span className="text-gold font-medium">{avgRating}</span>
              <FiStar size={12} className="fill-gold text-gold" />
              <span>{testimonials.length} reviews</span>
            </div>
          )}
        </div>
        {testimonials.length > 4 && (
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

      {testimonials.length > 0 && (
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none scroll-smooth"
        >
          {testimonials.map((t) => (
            <div
              key={t._id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[calc((100%-3.75rem)/4)] snap-start bg-white border border-cream-200 p-5 h-[300px] flex flex-col"
            >
              <div className="flex gap-0.5 text-gold mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={12} className={i < t.rating ? 'fill-gold' : 'opacity-25'} />
                ))}
              </div>

              <div className="w-full h-24 bg-cream-100 mb-3 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {t.reviewImage ? (
                  <img src={driveImg(t.reviewImage)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FiImage size={20} className="text-cream-200" />
                )}
              </div>

              <p className="text-sm text-ink leading-snug flex-1 overflow-hidden">{t.message}</p>

              <div className="flex items-center gap-2 mt-3 flex-shrink-0">
                {t.customerImage ? (
                  <img src={driveImg(t.customerImage)} alt={t.customerName} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-cream-200 flex items-center justify-center text-xs text-muted">
                    {t.customerName?.[0]}
                  </div>
                )}
                <span className="text-xs text-ink">{t.customerName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <ShareExperience />
      ) : (
        <p className="text-sm text-muted text-center mt-10">
          <Link to="/login" className="text-brand hover:underline">
            Log in
          </Link>{' '}
          to share your own experience with AL SA&apos;I.
        </p>
      )}
    </section>
  );
};

export default Testimonials;