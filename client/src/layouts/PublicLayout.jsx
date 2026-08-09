import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import publicAxios from '../api/publicAxios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  const [layout, setLayout] = useState(null);

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
        announcementText={layout?.websiteContent?.announcementBar?.isActive ? layout.websiteContent.announcementBar.text : null}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer websiteContent={layout?.websiteContent} />
    </div>
  );
};

export default PublicLayout;
