import { driveImg } from '../../utils/driveImg';

const DEFAULT_PARAGRAPHS = [
  "AL SA'I is more than a perfume house. It is a journey of passion, craftsmanship, and the pursuit of olfactory perfection.",
  "Each fragrance is meticulously created using rare, hand-selected ingredients sourced from around the globe to deliver an unmatched scent profile that endures throughout the day.",
  "Inspired by heritage and elevated by modern artistry, our Extrait de Parfum collection embodies depth, complexity, and refinement for those who appreciate true distinction."
];

const OurStory = ({ story }) => {
  if (!story) return null;

  let storyParagraphs = [];
  if (story.description) {
    // Split text by single or multiple line breaks (\n or \n\n)
    const userParagraphs = story.description.split(/\n+/).map(s => s.trim()).filter(Boolean);

    if (userParagraphs.length > 1) {
      // If user/admin typed multiple paragraphs, display all of them
      storyParagraphs = userParagraphs;
    } else {
      // If user/admin typed a single paragraph or seed text exists, combine with 2nd and 3rd paragraphs
      storyParagraphs = [
        userParagraphs[0] || DEFAULT_PARAGRAPHS[0],
        DEFAULT_PARAGRAPHS[1],
        DEFAULT_PARAGRAPHS[2],
      ];
    }
  } else {
    storyParagraphs = DEFAULT_PARAGRAPHS;
  }

  return (
    <section className="bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-start md:items-center gap-10 lg:gap-14">
        <div className="flex-1 w-full text-left">
          {story.tagline && <p className="text-brand text-xs tracking-[0.25em] mb-3 uppercase">{story.tagline}</p>}
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-4">{story.heading || 'Our Story'}</h2>
          <div className="text-muted text-sm leading-relaxed space-y-4 w-full">
            {storyParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
        {story.image && (
          <div className="flex-1 w-full">
            <img src={driveImg(story.image)} alt={story.heading || 'Our Story'} className="w-full h-auto max-h-[380px] object-cover rounded-md mx-auto" />
          </div>
        )}
      </div>
    </section>
  );
};

export default OurStory;
