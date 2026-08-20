import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';
import { driveImg } from '../../utils/driveImg';
import { getPageIcon } from '../../utils/pageIcons';
import usePageTitle from '../../hooks/usePageTitle';
import BrandSpinner from '../../components/BrandSpinner';

const About = () => {
  usePageTitle('Our Story');
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAxios
      .get('/layout')
      .then(({ data }) => setAbout(data.data.websiteContent?.aboutPage))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <BrandSpinner fullPage />;
  }

  if (!about || (!about.heading && !about.storyBody)) return null;

  const hasValues = about.values?.length > 0;
  const hasMilestones = about.milestones?.length > 0;
  const hasQuote = about.quoteText;
  const hasCraft = hasQuote && about.craftImage;
  const hasStats = about.stats?.length > 0;

  return (
    <div className="bg-cream">
      {/* Intro banner - same fixed-height frame convention used across the
          site's other top banners (Shop, Promotions, Gift Sets), so this
          page reads as consistent with the rest instead of a one-off. */}
      {/* Intro banner - left-aligned text matching Shop page */}
      <section className="relative bg-cream-100 overflow-hidden h-[532px] sm:h-[616px] md:h-[672px] flex items-center">
        {about.video ? (
          <video src={driveImg(about.video)} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          about.image && <img src={driveImg(about.image)} alt={about.heading} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="max-w-7xl mx-auto px-4 relative w-full z-10">
          <p className="text-xs text-cream-100/80 mb-3">
            <Link to="/" className="hover:text-gold">Home</Link> / Our Story
          </p>
          {about.heading && <h1 className="font-serif text-3xl sm:text-4xl max-480:text-2xl text-white">{about.heading}</h1>}
          {about.description && (
            <p className="text-sm sm:text-base text-cream-100/90 mt-2 max-w-xl leading-relaxed">{about.description}</p>
          )}
        </div>
      </section>

      {/* Our Story - narrative block with 30% reduced image height */}
      {about.storyBody && (
        <section className="max-w-6xl mx-auto px-4 py-14 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className={about.storyImage || about.storyVideo ? 'order-2 md:order-1' : 'md:col-span-2 max-w-2xl mx-auto text-center'}>
              <p className="text-brand text-xs tracking-[0.25em] mb-3">
                — {about.storyHeading ? about.storyHeading.replace(/^—\s*|\s*—$/g, '') : 'OUR STORY'} —
              </p>
              <div className="space-y-4">
                {about.storyBody.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-muted text-sm leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
            {(about.storyImage || about.storyVideo) && (
              <div className="order-1 md:order-2 h-[280px] sm:h-[340px] md:h-[380px] w-full bg-cream-100 rounded-md overflow-hidden">
                {about.storyVideo ? (
                  <video src={driveImg(about.storyVideo)} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={driveImg(about.storyImage)} alt={about.storyHeading || 'Our Story'} className="w-full h-full object-cover" />
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Brand values - "What Drives Us" */}
      {hasValues && (
        <section className="bg-cream-100/60 border-y border-cream-200">
          <div className="max-w-6xl mx-auto px-4 py-14 sm:py-16">
            <p className="text-brand text-xs tracking-[0.25em] mb-6 text-center">— OUR VALUES —</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-10">What Drives Us</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 lg:divide-x lg:divide-cream-200">
              {about.values.map((v, i) => {
                const Icon = getPageIcon(v.icon);
                return (
                  <div key={i} className="text-center px-4">
                    <Icon size={28} className="text-brand mx-auto mb-4" strokeWidth={1.4} />
                    <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-ink mb-2 uppercase">{v.title}</h3>
                    {v.description && <p className="text-xs text-muted leading-relaxed">{v.description}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Milestones / timeline */}
      {hasMilestones && (
        <section className="max-w-3xl mx-auto px-4 py-14 sm:py-16">
          <p className="text-brand text-xs tracking-[0.25em] mb-10 text-center">— OUR JOURNEY —</p>
          <div className="relative border-l border-cream-200 pl-8 space-y-10">
            {about.milestones.map((m, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[35px] top-1 w-3 h-3 rounded-full bg-brand" />
                {m.year && <p className="text-xs tracking-widest text-gold mb-1">{m.year}</p>}
                <h3 className="font-serif text-base text-ink mb-1.5">{m.title}</h3>
                {m.description && <p className="text-sm text-muted leading-relaxed">{m.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Our Craft - signed quote paired with an image (height reduced 30%) */}
      {hasCraft ? (
        <section className="max-w-6xl mx-auto px-4 py-14 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className="h-[280px] sm:h-[340px] md:h-[380px] w-full bg-cream-100 rounded-md overflow-hidden">
              <img src={driveImg(about.craftImage)} alt={about.craftHeading || 'Our Craft'} className="w-full h-full object-cover" />
            </div>
            <div>
              {about.craftEyebrow && (
                <p className="text-brand text-xs tracking-[0.25em] mb-3">
                  — {about.craftEyebrow.replace(/^—\s*|\s*—$/g, '')} —
                </p>
              )}
              {about.craftHeading && <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-4">{about.craftHeading}</h2>}
              <blockquote className="text-sm sm:text-base text-muted leading-relaxed mb-5">{about.quoteText}</blockquote>
              {about.quoteAuthor && <p className="font-serif italic text-brand text-base">{about.quoteAuthor}</p>}
            </div>
          </div>
        </section>
      ) : (
        (hasQuote || about.closingImage) && (
          <section className="relative overflow-hidden">
            {about.closingImage && (
              <>
                <img src={driveImg(about.closingImage)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
              </>
            )}
            <div className={`relative max-w-2xl mx-auto px-4 text-center ${about.closingImage ? 'py-16 sm:py-24' : 'py-14'}`}>
              {hasQuote && (
                <blockquote className={`font-serif text-xl sm:text-2xl leading-relaxed mb-4 ${about.closingImage ? 'text-white' : 'text-ink'}`}>
                  &ldquo;{about.quoteText}&rdquo;
                </blockquote>
              )}
              {about.quoteAuthor && (
                <p className={`text-xs tracking-widest ${about.closingImage ? 'text-gold' : 'text-brand'}`}>{about.quoteAuthor.toUpperCase()}</p>
              )}
            </div>
          </section>
        )
      )}

      {/* Trust-bar stats - distinct light luxury background separated from the dark charcoal footer */}
      {hasStats && (
        <section className="bg-gradient-to-r from-cream-100 via-white to-cream-100 border-t border-b border-cream-200 py-12 sm:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
            {about.stats.map((s, i) => {
              const Icon = getPageIcon(s.icon);
              // 2-col layout (small): right border on left column (i%2===0),
              // bottom border on top row (i<2) → forms a "+" cross in the center.
              // 4-col layout (sm+): right border between every column except the last.
              const cellBorder = [
                i % 2 === 0 ? 'border-r' : '',
                i < 2 ? 'border-b' : '',
                'sm:border-b-0',
                i < 3 ? 'sm:border-r' : 'sm:border-r-0',
                'border-cream-200',
              ].filter(Boolean).join(' ');
              return (
                <div key={i} className={`text-center px-4 py-10 sm:py-8 ${cellBorder}`}>
                  <Icon size={26} className="text-brand mx-auto mb-3" strokeWidth={1.4} />
                  <p className="font-serif text-2xl sm:text-3xl text-ink font-semibold mb-1">{s.value}</p>
                  <p className="text-[11px] sm:text-xs tracking-widest text-muted uppercase font-medium">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
        </section>
      )}
    </div>
  );
};

export default About;