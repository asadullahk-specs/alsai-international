const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

// Curated marketing groupings shown in "Featured Collections" on the homepage
// and as a badge/breadcrumb on product pages - e.g. "Oud Collection", "Floral
// Collection", "Signature Collection". Distinct from Collection (Perfumes/
// Attars) and from Fragrance Family (the scent-based filter attribute).
const featuredCollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

featuredCollectionSchema.pre('validate', function generateSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model('FeaturedCollection', featuredCollectionSchema);
