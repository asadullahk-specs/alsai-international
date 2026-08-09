import { useState, useEffect } from 'react';
import publicAxios from '../../api/publicAxios';

const About = () => {
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

  if (!about) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-brand text-xs tracking-[0.25em] mb-3">THE ESSENCE OF LUXURY</p>
          <h1 className="font-serif text-3xl text-ink mb-5">{about.heading}</h1>
          <p className="text-muted text-sm leading-relaxed">{about.description}</p>
        </div>
        {about.image && <img src={about.image} alt={about.heading} className="w-full h-auto rounded-md" />}
      </div>
    </div>
  );
};

export default About;
