import SimpleTaxonomyManager from '../../components/catalog/SimpleTaxonomyManager';

const CollectionsPage = () => (
  <SimpleTaxonomyManager
    title="Collections"
    description="Manage curated marketing groupings like 'Oud Collection' or 'Floral Collection', shown in Featured Collections on the homepage."
    apiPath="/featured-collections"
  />
);

export default CollectionsPage;
