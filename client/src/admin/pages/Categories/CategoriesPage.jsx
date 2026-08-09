import SimpleTaxonomyManager from '../../components/catalog/SimpleTaxonomyManager';

const CategoriesPage = () => (
  <SimpleTaxonomyManager
    title="Categories"
    description="Manage the main product types - Perfumes, Attars - shown in the navbar and shop filters. The optional video plays as the primary media on the homepage's 'Our Specialities' cards."
    apiPath="/collections"
    hasVideo
  />
);

export default CategoriesPage;
