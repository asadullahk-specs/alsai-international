import { Link } from 'react-router-dom';
import { driveImg } from '../../utils/driveImg';

// A short teaser toward the full Our Story page - not the whole story
// inline. Heading (short, quote-like) on the left, a couple of lines of
// body copy on the right, with a button under that copy leading to /about.
const OurStory = ({ story }) => {
  if (!story) return null;

  const teaser = story.description
    ? story.description.split(/\n+/).map((s) => s.trim()).filter(Boolean)[0]
    : "Imported ingredients. Perfumers we've worked with for years. And a scent profile that ends with us, not a committee.";

  return (
    <section className="relative bg-charcoal text-white overflow-hidden min-h-[340px] flex items-center">
      {story.image && (
        <div className="absolute inset-0 z-0">
          <img
            src={driveImg(story.image)}
            alt={story.heading || 'Our Story'}
            className="w-full h-full object-cover object-right sm:object-center opacity-90 transition-opacity duration-300"
          />
          {/* Subtle gradient overlay to keep left text readable while keeping right image bright */}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 sm:via-charcoal/60 to-transparent" />
        </div>
      )}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center w-full">
        <div>
          {story.tagline && <p className="text-gold text-xs tracking-[0.25em] mb-4 uppercase font-medium">{story.tagline}</p>}
          <h2 className="font-serif italic text-2xl sm:text-3xl md:text-4xl leading-snug drop-shadow-sm">{story.heading || "\u201cIf I wouldn't wear it, it isn't on this site.\u201d"}</h2>
        </div>
        <div>
          <p className="text-cream-100/95 text-sm leading-relaxed mb-6 drop-shadow-sm">{teaser}</p>
          <Link
            to="/about"
            className="inline-block bg-white text-ink text-xs tracking-widest px-6 py-3 hover:bg-cream-100 transition-colors font-medium"
          >
            READ OUR STORY
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
