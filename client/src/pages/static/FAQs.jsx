import { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import publicAxios from '../../api/publicAxios';
import StaticPageHero from '../../components/StaticPageHero';
import usePageTitle from '../../hooks/usePageTitle';
import BrandSpinner from '../../components/BrandSpinner';

const FAQs = () => {
  usePageTitle('FAQs');
  const [faqs, setFaqs] = useState([]);
  const [hero, setHero] = useState(null);
  const [openIndex, setOpenIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAxios
      .get('/layout')
      .then(({ data }) => {
        const sorted = [...(data.data.websiteContent?.faqs || [])].sort((a, b) => a.displayOrder - b.displayOrder);
        setFaqs(sorted);
        setHero(data.data.websiteContent?.faqsPage || null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <BrandSpinner fullPage />;
  }

  return (
    <div className="bg-cream">
      <StaticPageHero
        heading={hero?.heroHeading || 'Frequently Asked Questions'}
        description={hero?.heroDescription}
        image={hero?.heroImage}
        breadcrumb="FAQs"
      />

      <div className="max-w-3xl mx-auto px-4 py-16">
        {faqs.length === 0 ? (
          <p className="text-sm text-muted text-center">No FAQs have been added yet.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq._id || i} className="border border-cream-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left"
                >
                  <span className="text-sm sm:text-base font-serif text-ink">{faq.question}</span>
                  <FiChevronDown size={16} className={`text-muted transition-transform flex-shrink-0 ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === i && <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-muted leading-relaxed">{faq.answer}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQs;
