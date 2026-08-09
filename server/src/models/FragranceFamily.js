const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const fragranceFamilySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

fragranceFamilySchema.pre('validate', function generateSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model('FragranceFamily', fragranceFamilySchema);
