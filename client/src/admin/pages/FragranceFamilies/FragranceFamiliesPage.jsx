import SimpleTaxonomyManager from '../../components/catalog/SimpleTaxonomyManager';

const FragranceFamiliesPage = () => (
  <SimpleTaxonomyManager
    title="Fragrance Families"
    description="Manage the scent families (Floral, Woody, Fresh...) admins assign to each product."
    apiPath="/fragrance-families"
    hasImage={false}
    hasDescription={false}
  />
);

export default FragranceFamiliesPage;
