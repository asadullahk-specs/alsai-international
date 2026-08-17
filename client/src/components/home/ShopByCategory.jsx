import { Link } from 'react-router-dom';
import { driveImg } from '../../utils/driveImg';

// "Our Specialities" always shows the two collections that split the entire
// catalog - Perfumes and Attars - pulling each card's media straight from the
// admin-managed Collection record (name, image, optional video), no
// hardcoding. Unlike the New Arrivals row, these cards intentionally have no
// hover-image swap - video (when set) is just the primary, static media.
const OurSpecialities = ({ collections = [] }) => {
  const perfumes = collections.find((c) => c.slug === 'perfumes');
  const attars = collections.find((c) => c.slug === 'attars');
  const cards = [perfumes, attars].filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <h2 className="text-xs tracking-widest text-ink mb-6">OUR SPECIALITIES</h2>
      {/* Below 480px this becomes a one-card-per-view slider, matching the
          other card rows on the site, instead of a cramped 2-up grid. A real
          spacer element (not container padding) keeps the left gap intact -
          padding on the leading edge of a horizontally-scrolling flex
          container gets clipped by some mobile browsers. */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 max-480:flex max-480:gap-4 max-480:overflow-x-auto max-480:snap-x max-480:snap-mandatory max-480:pb-2 scrollbar-none">
        {cards.map((c) => (
          <Link
            key={c._id}
            to={`/shop?collection=${c._id}`}
            className="relative overflow-hidden aspect-[4/3] sm:aspect-[16/10] group bg-cream-100 max-480:flex-shrink-0 max-480:w-[78vw] max-480:snap-start"
          >
            {c.video ? (
              <video
                src={driveImg(c.video)}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              c.image && (
                <img
                  src={driveImg(c.image)}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )
            )}
            <div className="absolute inset-0 bg-black/25 flex flex-col justify-end p-3 sm:p-6">
              <h3 className="font-serif text-white text-sm max-480:text-xs sm:text-2xl">{c.name}</h3>
              {c.description && <p className="hidden sm:block text-cream-100 text-xs mb-2">{c.description}</p>}
              <span className="text-white text-[10px] max-480:text-[8px] sm:text-xs tracking-widest">SHOP NOW →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default OurSpecialities;