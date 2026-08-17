import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiHeadphones, FiPhone, FiMail } from 'react-icons/fi';
import publicAxios from '../../api/publicAxios';
import { getPageIcon } from '../../utils/pageIcons';
import StaticPageHero from '../../components/StaticPageHero';
import usePageTitle from '../../hooks/usePageTitle';
import BrandSpinner from '../../components/BrandSpinner';

const TITLES = {
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  shipping: 'Shipping Policy',
  returns: 'Return Policy',
};

const PolicyPage = () => {
  const { type } = useParams();
  usePageTitle(TITLES[type] || 'Policy');
  const [page, setPage] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    setLoading(true);
    setActiveSection(0);
    publicAxios
      .get('/layout')
      .then(({ data }) => {
        setPage(data.data.websiteContent?.policies?.[type] || null);
        setContactInfo(data.data.websiteContent?.contactInfo || null);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const title = TITLES[type] || 'Policy';
  const hasCards = page?.highlightCards?.length > 0;
  const hasSections = page?.sections?.length > 0;
  const hasBullets = page?.bullets?.length > 0;
  const showNeedHelp = Boolean(page?.showNeedHelp && contactInfo);

  // Sections + bullets can't both anchor a Need-Help card layout, so when a
  // page uses numbered sections (Terms/Privacy style) the help card - if
  // enabled - renders as its own strip beneath them instead of beside bullets.
  const needHelpStandalone = showNeedHelp && !hasBullets;

  const anchorId = useMemo(() => (i) => `section-${i}`, []);

  const scrollToSection = (i) => {
    setActiveSection(i);
    const el = document.getElementById(anchorId(i));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return <BrandSpinner fullPage />;
  }

  const isEmpty = !page || (!page.heroHeading && !hasCards && !hasSections && !hasBullets);

  return (
    <div className="bg-cream">
      <StaticPageHero
        heading={page?.heroHeading || title}
        description={page?.heroDescription}
        image={page?.heroImage}
        breadcrumb={title}
      />

      {isEmpty ? (
        <div className="max-w-3xl mx-auto px-4 py-16">
          <p className="text-sm text-muted text-center">This page hasn&apos;t been filled in by the admin yet.</p>
        </div>
      ) : (
        <>
          {/* Icon highlight cards row - Shipping / Returns style */}
          {hasCards && (
            <section className="border-b border-cream-200 bg-white">
              <div className="max-w-5xl mx-auto px-4 py-12">
                <div className={`grid gap-6 ${page.highlightCards.length === 2
                    ? 'grid-cols-2'
                    : page.highlightCards.length === 3
                      ? 'grid-cols-1 sm:grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
                  }`}>
                  {page.highlightCards.map((card, i) => {
                    const Icon = getPageIcon(card.icon);
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center text-center px-4 py-6 border border-cream-200 bg-cream-100/40"
                      >
                        {/* Fixed-height icon zone — ensures all icons sit at the same vertical position */}
                        <div className="w-12 h-12 mb-4 rounded-full border border-gold/50 flex items-center justify-center flex-shrink-0">
                          <Icon size={20} className="text-brand" />
                        </div>
                        {/* Fixed min-height heading zone so text below aligns */}
                        <h3 className="text-xs font-semibold tracking-widest text-ink mb-2 uppercase min-h-[2.5rem] flex items-center justify-center leading-tight">
                          {card.title}
                        </h3>
                        <p className="text-xs text-muted leading-relaxed">{card.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          <div className="max-w-7xl mx-auto px-4 py-14">
            <div className={hasSections ? 'grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10' : ''}>
              {/* TOC sidebar - Terms / Privacy style */}
              {hasSections && (
                <aside className="lg:sticky lg:top-24 self-start">
                  <div className="bg-white border border-cream-200 p-4 sm:p-5 shadow-xs">
                    <p className="text-[10px] tracking-[0.2em] font-semibold text-brand uppercase mb-3 px-2">
                      — TABLE OF CONTENTS —
                    </p>
                    <nav className="overflow-x-auto lg:overflow-visible scrollbar-none">
                      <div className="flex lg:flex-col gap-1">
                        {page.sections.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => scrollToSection(i)}
                            className={`text-left text-xs sm:text-sm whitespace-nowrap lg:whitespace-normal px-3.5 py-2.5 border-l-2 transition-all duration-200 ${activeSection === i
                                ? 'bg-cream-100/80 text-brand border-brand font-medium'
                                : 'text-muted border-transparent hover:text-ink hover:bg-cream-50/60'
                              }`}
                          >
                            {String(i + 1).padStart(2, '0')}. {s.heading}
                          </button>
                        ))}
                      </div>
                    </nav>
                  </div>
                </aside>
              )}

              {hasSections && (
                <div className="space-y-8">
                  {page.sections.map((s, i) => (
                    <div key={i} id={anchorId(i)} className="scroll-mt-28 pb-6 border-b border-cream-200 last:border-b-0">
                      <h2 className="font-serif text-xl sm:text-2xl text-ink mb-3">
                        {i + 1}. {s.heading}
                      </h2>
                      <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{s.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bullet guidelines + optional Need Help card - Shipping / Returns style */}
            {(hasBullets || needHelpStandalone) && (
              <div className={`grid grid-cols-1 ${hasBullets && showNeedHelp ? 'lg:grid-cols-[1fr_320px]' : ''} gap-8 ${hasSections ? 'mt-14 pt-10 border-t border-cream-200' : ''}`}>
                {hasBullets && (
                  <div>
                    <h2 className="font-serif text-xl text-ink mb-4">{page.bulletsHeading || 'Important Information'}</h2>
                    <ul className="space-y-2.5">
                      {page.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted leading-relaxed">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {showNeedHelp && (
                  <div className={`bg-cream-100 border border-cream-200 p-6 flex gap-4 ${!hasBullets ? 'max-w-xl' : 'h-fit'}`}>
                    <div className="w-11 h-11 rounded-full border border-gold/50 flex items-center justify-center flex-shrink-0">
                      <FiHeadphones size={18} className="text-brand" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-ink mb-1">Need Help?</h3>
                      <p className="text-xs text-muted mb-3">Our customer care team is here to assist you.</p>
                      <div className="space-y-1.5">
                        {contactInfo.phone && (
                          <p className="flex items-center gap-2 text-sm text-ink">
                            <FiPhone size={13} className="text-brand" /> {contactInfo.phone}
                          </p>
                        )}
                        {contactInfo.email && (
                          <p className="flex items-center gap-2 text-sm text-ink">
                            <FiMail size={13} className="text-brand" /> {contactInfo.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PolicyPage;
