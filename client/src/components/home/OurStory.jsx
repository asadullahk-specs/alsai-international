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
    <section className="bg-charcoal text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          {story.tagline && <p className="text-gold text-xs tracking-[0.25em] mb-4 uppercase">{story.tagline}</p>}
          <h2 className="font-serif italic text-2xl sm:text-3xl leading-snug">{story.heading || "\u201cIf I wouldn't wear it, it isn't on this site.\u201d"}</h2>
        </div>
        <div>
          <p className="text-cream-200/80 text-sm leading-relaxed mb-6">{teaser}</p>
          <Link
            to="/about"
            className="inline-block border border-cream-200/40 text-cream-100 text-xs tracking-widest px-6 py-3 hover:border-gold hover:text-gold transition-colors"
          >
            READ OUR STORY
          </Link>
        </div>
      </div>
      {story.image && (
        <div className="w-full h-56 sm:h-72 overflow-hidden">
          <img src={driveImg(story.image)} alt={story.heading || 'Our Story'} className="w-full h-full object-cover opacity-80" />
        </div>
      )}
    </section>
  );
};

export default OurStory;
