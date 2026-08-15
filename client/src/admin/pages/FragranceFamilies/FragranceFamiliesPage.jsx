import SimpleTaxonomyManager from '../../components/catalog/SimpleTaxonomyManager';

const FragranceFamiliesPage = () => (
  <SimpleTaxonomyManager
    title="Fragrance Families"
    description="Manage the scent families (Floral, Woody, Fresh...) admins assign to each product. Assign each one to Perfumes or Attars so the navbar shows the right list under each."
    apiPath="/fragrance-families"
    hasImage={false}
    hasDescription={false}
    hasCollectionSelect
  />
);

export default FragranceFamiliesPage;
