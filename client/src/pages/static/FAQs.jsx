import { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import publicAxios from '../../api/publicAxios';

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAxios
      .get('/layout')
      .then(({ data }) => {
        const sorted = [...(data.data.websiteContent?.faqs || [])].sort((a, b) => a.displayOrder - b.displayOrder);
        setFaqs(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl text-ink mb-8 text-center">Frequently Asked Questions</h1>
      {faqs.length === 0 ? (
        <p className="text-sm text-muted text-center">No FAQs have been added yet.</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq._id || i} className="border border-cream-200 rounded-md">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm text-ink font-medium">{faq.question}</span>
                <FiChevronDown size={16} className={`text-muted transition-transform flex-shrink-0 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && <p className="px-4 pb-4 text-sm text-muted">{faq.answer}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQs;
