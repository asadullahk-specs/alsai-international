const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

// Perfumes / Attars - the main product-type split used in the navbar, shop
// filters, and the admin Catalog sidebar. Gift Sets sits alongside these as
// its own model (see GiftSet.js) since a bundle of products needs different
// fields than a single fragrance - but all three read as peer sections to
// the admin, matching the Catalog menu.
const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    // Optional Google Drive video link. When set, the "Our Specialities" cards
    // on the homepage (which read from Perfumes/Attars, i.e. this model) show
    // the video as their primary media instead of the static image.
    video: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

collectionSchema.pre('validate', function generateSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model('Collection', collectionSchema);
