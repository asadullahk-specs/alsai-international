import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import publicAxios from '../api/publicAxios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Same hero-route list as Navbar.jsx - those pages start with a full-bleed
// banner at y=0 so the transparent header can overlay it; every other page
// needs top padding to clear the now fixed (not sticky) header.
const HERO_ROUTES = ['/', '/shop', '/gift-sets', '/promotions', '/about', '/faqs', '/contact'];

const PublicLayout = () => {
  const [layout, setLayout] = useState(null);
  const location = useLocation();
  const isHeroRoute = HERO_ROUTES.includes(location.pathname) || location.pathname.startsWith('/policies');
  const hasAnnouncement = Boolean(layout?.websiteContent?.announcementBar?.isActive);

  useEffect(() => {
    publicAxios
      .get('/layout')
      .then(({ data }) => setLayout(data.data))
      .catch(() => setLayout({ collections: [], fragranceFamilies: [], websiteContent: null }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        collections={layout?.collections || []}
        fragranceFamilies={layout?.fragranceFamilies || []}
        announcementText={hasAnnouncement ? layout.websiteContent.announcementBar.text : null}
        storeMapUrl={layout?.websiteContent?.contactInfo?.storeMapUrl}
      />
      <main className={`flex-1 ${isHeroRoute ? '' : hasAnnouncement ? 'pt-[116px]' : 'pt-20'}`}>
        <Outlet />
      </main>
      <Footer websiteContent={layout?.websiteContent} />
    </div>
  );
};

export default PublicLayout;
