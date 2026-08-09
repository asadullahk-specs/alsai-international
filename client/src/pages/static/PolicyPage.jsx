import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';

const TITLES = {
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  shipping: 'Shipping Policy',
  returns: 'Return Policy',
};

const FIELD_MAP = {
  privacy: 'privacyPolicy',
  terms: 'termsConditions',
  shipping: 'shippingPolicy',
  returns: 'returnPolicy',
};

const PolicyPage = () => {
  const { type } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    publicAxios
      .get('/layout')
      .then(({ data }) => {
        const field = FIELD_MAP[type];
        setContent(data.data.websiteContent?.policies?.[field] || '');
      })
      .finally(() => setLoading(false));
  }, [type]);

  const title = TITLES[type] || 'Policy';

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl text-ink mb-6">{title}</h1>
      {content ? (
        <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{content}</p>
      ) : (
        <p className="text-sm text-muted">This page hasn't been filled in by the admin yet.</p>
      )}
    </div>
  );
};

export default PolicyPage;
