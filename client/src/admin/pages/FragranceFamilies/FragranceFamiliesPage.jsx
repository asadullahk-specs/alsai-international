import SimpleTaxonomyManager from '../../components/catalog/SimpleTaxonomyManager';

const FragranceFamiliesPage = () => (
  <SimpleTaxonomyManager
    title="Fragrance Families"
    description="Manage scent families (Oud & Woody, Musk & Powdery, Floral & Rose...). Set Belongs To to Perfumes, Attars, or Both so the navbar and shop filters reflect them accurately."
    apiPath="/fragrance-families"
    hasImage={true}
    hasDescription={true}
    hasCollectionSelect={true}
  />
);

export default FragranceFamiliesPage;
