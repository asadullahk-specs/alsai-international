const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const giftSetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mainImage: { type: String, default: '' },
    hoverImage: { type: String, default: '' },
    galleryImages: [{ type: String }],
    includedProducts: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        size: { type: String, required: true },
        _id: false,
      },
    ],
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

giftSetSchema.pre('validate', function generateSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model('GiftSet', giftSetSchema);
