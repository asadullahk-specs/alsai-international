const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true }, // e.g. "50ml"
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, default: "AL SA'I" },
    shortDescription: { type: String, default: '', trim: true },
    fullDescription: { type: String, default: '' },

    collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true }, // Perfumes / Attars
    featuredCollection: { type: mongoose.Schema.Types.ObjectId, ref: 'FeaturedCollection' }, // e.g. "Oud Collection"
    fragranceFamily: { type: mongoose.Schema.Types.ObjectId, ref: 'FragranceFamily' },

    sizes: {
      type: [sizeSchema],
      validate: [(v) => v.length > 0, 'At least one size is required'],
    },
    lowStockThreshold: { type: Number, default: 15 },
    totalStock: { type: Number, default: 0 },
    basePrice: { type: Number, default: 0 },

    mainImage: { type: String, default: '' },
    hoverImage: { type: String, default: '' },
    galleryImages: [{ type: String }],
    video: { type: String, default: '' },

    fragranceNotes: {
      top: [{ type: String }],
      heart: [{ type: String }],
      base: [{ type: String }],
    },
    facts: {
      concentration: { type: String, default: 'International' },
      longevity: { type: String, default: '' },
      sillage: { type: String, default: '' },
      gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: 'Unisex' },
      ingredients: { type: String, default: '' },
    },
    shippingInfo: {
      deliveryTime: { type: String, default: '' },
      shippingCharges: { type: String, default: '' },
      returnExchange: { type: String, default: '' },
      orderCancellation: { type: String, default: '' },
    },

    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },

    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    metaTitle: { type: String, default: '' },
    metaKeywords: [{ type: String }],
    metaDescription: { type: String, default: '' },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

productSchema.index({ name: 'text', shortDescription: 'text' });
productSchema.index({ collection: 1, isActive: 1, isHidden: 1 });

productSchema.pre('save', function computeDerivedFields(next) {
  if (this.isModified('sizes')) {
    this.totalStock = this.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
    this.basePrice = Math.min(...this.sizes.map((s) => s.salePrice || s.price));
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
