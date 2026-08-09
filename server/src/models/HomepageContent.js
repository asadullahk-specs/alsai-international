const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    description: { type: String, default: '' },
    backgroundImage: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    buttonUrl: { type: String, default: '' },
    secondaryButtonText: { type: String, default: '' },
    secondaryButtonUrl: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: false }
);

const homepageContentSchema = new mongoose.Schema(
  {
    heroSlides: [heroSlideSchema],
    featuredCollections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FeaturedCollection' }],
    bestSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    newArrivals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    ourStory: {
      tagline: { type: String, default: 'THE ESSENCE OF LUXURY' },
      heading: { type: String, default: 'Our Story' },
      description: { type: String, default: '' },
      image: { type: String, default: '' },
      buttonText: { type: String, default: 'Discover Our Journey' },
      buttonUrl: { type: String, default: '/about' },
    },
    newsletterSection: {
      heading: { type: String, default: 'Stay in the Know' },
      description: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomepageContent', homepageContentSchema);
