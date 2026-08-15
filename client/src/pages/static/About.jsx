import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';
import { driveImg } from '../../utils/driveImg';
import usePageTitle from '../../hooks/usePageTitle';

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
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!about || (!about.heading && !about.storyBody)) return null;

  const hasValues = about.values?.length > 0;
  const hasMilestones = about.milestones?.length > 0;
  const hasQuote = about.quoteText;

  return (
    <div className="bg-cream">
      {/* Intro banner - same fixed-height frame convention used across the
          site's other top banners (Shop, Promotions, Gift Sets), so this
          page reads as consistent with the rest instead of a one-off. */}
      <section className="relative bg-cream-100 overflow-hidden h-[532px] sm:h-[616px] md:h-[672px]">
        {about.video ? (
          <video src={driveImg(about.video)} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          about.image && <img src={driveImg(about.image)} alt={about.heading} className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Dark shade always applied (even with no media) so this frame stays
            consistent with the other hero banners and keeps the transparent
            navbar's white items legible. */}
        <div className="absolute inset-0 bg-black/40" />
        <p className="absolute top-6 left-4 sm:left-8 text-xs text-cream-100/80 z-10">
          <Link to="/" className="hover:text-gold">Home</Link> / Our Story
        </p>
        <div className="absolute inset-0 flex flex-col justify-center px-4">
          <div className="max-w-3xl mx-auto w-full text-center">
            {about.eyebrow && <p className="text-xs tracking-[0.3em] text-gold mb-3">{about.eyebrow}</p>}
            {about.heading && <h1 className="font-serif text-3xl sm:text-4xl text-white mb-4">{about.heading}</h1>}
            {about.description && <p className="text-sm sm:text-base text-cream-100/90 leading-relaxed max-w-xl mx-auto">{about.description}</p>}
          </div>
        </div>
      </section>

      {/* Our Story - the narrative block, split with its own media so it
          reads as a distinct, well-structured section rather than a
          continuation of the intro banner above it. */}
      {about.storyBody && (
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className={about.storyImage || about.storyVideo ? 'order-2 md:order-1' : 'md:col-span-2 max-w-2xl mx-auto text-center'}>
              <p className="text-brand text-xs tracking-[0.25em] mb-3">{about.storyHeading || 'OUR STORY'}</p>
              <div className="space-y-4">
                {about.storyBody.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-muted text-sm leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
            {(about.storyImage || about.storyVideo) && (
              <div className="order-1 md:order-2 aspect-[4/5] bg-cream-100 rounded-md overflow-hidden">
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

      {/* Brand values */}
      {hasValues && (
        <section className="bg-cream-100/60 border-y border-cream-200">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <p className="text-brand text-xs tracking-[0.25em] mb-8 text-center">WHAT WE STAND FOR</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {about.values.map((v, i) => (
                <div key={i} className="text-center px-4">
                  <div className="w-10 h-10 rounded-full border border-gold/50 flex items-center justify-center mx-auto mb-4">
                    <span className="font-serif text-gold text-sm">{i + 1}</span>
                  </div>
                  <h3 className="font-serif text-lg text-ink mb-2">{v.title}</h3>
                  {v.description && <p className="text-xs text-muted leading-relaxed">{v.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Milestones / timeline */}
      {hasMilestones && (
        <section className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
          <p className="text-brand text-xs tracking-[0.25em] mb-10 text-center">OUR JOURNEY</p>
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

      {/* Closing quote + image */}
      {(hasQuote || about.closingImage) && (
        <section className="relative overflow-hidden">
          {about.closingImage && (
            <>
              <img src={driveImg(about.closingImage)} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          <div className={`relative max-w-2xl mx-auto px-4 text-center ${about.closingImage ? 'py-24 sm:py-32' : 'py-16'}`}>
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
      )}
    </div>
  );
};

export default About;