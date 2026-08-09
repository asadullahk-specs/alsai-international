import SimpleTaxonomyManager from '../../components/catalog/SimpleTaxonomyManager';

// Featured Collections are the finer sub-collections (Oud, Floral, Fresh,
// Signature...) used in the navbar's Collections submenu and assignable to
// products/homepage sections - distinct from the top-level Perfumes/Attars
// split managed on the Collections page.
const FeaturedCollectionsPage = () => (
  <SimpleTaxonomyManager
    title="Featured Collections"
    description="Manage the sub-collections shown in the navbar and homepage (Oud, Floral, Signature, etc.)."
    apiPath="/featured-collections"
  />
);

export default FeaturedCollectionsPage;
