import { useState, useEffect } from 'react';
import publicAxios from '../api/publicAxios';
import BrandSpinner from '../components/BrandSpinner';
import HeroSlider from '../components/home/HeroSlider';
import FeaturedCollections from '../components/home/FeaturedCollections';
import ShopByCategory from '../components/home/ShopByCategory';
import ProductRow from '../components/home/ProductRow';
import SeasonalBanner from '../components/home/SeasonalBanner';
import Testimonials from '../components/home/Testimonials';
import OurStory from '../components/home/OurStory';
import Newsletter from '../components/home/Newsletter';

const Home = () => {
  const [homepage, setHomepage] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([publicAxios.get('/homepage'), publicAxios.get('/layout')])
      .then(([homepageRes, layoutRes]) => {
        setHomepage(homepageRes.data.data);
        setCollections(layoutRes.data.data.collections || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <BrandSpinner fullPage />;
  }

  if (!homepage) return null;

  return (
    <div>
      <HeroSlider slides={homepage.heroSlides} />
      <FeaturedCollections collections={homepage.featuredCollections} />
      <ShopByCategory collections={collections} />
      <ProductRow title="BEST SELLERS" products={homepage.bestSellers} viewAllLink="/shop?sort=popular" mediaMode="video" />
      {homepage.seasonalCollections?.length > 0 && <SeasonalBanner campaigns={homepage.seasonalCollections} />}
      <ProductRow title="NEW ARRIVALS" products={homepage.newArrivals} viewAllLink="/shop?sort=newest" mediaMode="video" />
      <Testimonials testimonials={homepage.testimonials} />
      <OurStory story={homepage.ourStory} />
      <Newsletter heading={homepage.newsletterSection?.heading} description={homepage.newsletterSection?.description} />
    </div>
  );
};

export default Home;
