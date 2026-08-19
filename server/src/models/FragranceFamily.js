const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const fragranceFamilySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    // Which Collection (Perfumes / Attars) this family belongs to, so the
    // navbar "Collections" dropdown and Shop filters can show a different
    // family list under each one instead of sharing a single list.
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
    belongsTo: { type: String, enum: ['Perfumes', 'Attars', 'Both'], default: 'Both' },
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
