const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema(
  {
    // "Our Story" / About page - kept as one richly structured block so an
    // admin can manage every piece of text and media that renders there,
    // rather than a single heading/description/image.
    aboutPage: {
      eyebrow: { type: String, default: 'THE ESSENCE OF LUXURY' },
      heading: { type: String, default: '' },
      description: { type: String, default: '' },
      image: { type: String, default: '' },
      video: { type: String, default: '' },
      storyHeading: { type: String, default: 'Our Story' },
      storyBody: { type: String, default: '' },
      storyImage: { type: String, default: '' },
      storyVideo: { type: String, default: '' },
      values: [
        {
          title: { type: String, default: '' },
          description: { type: String, default: '' },
        },
      ],
      milestones: [
        {
          year: { type: String, default: '' },
          title: { type: String, default: '' },
          description: { type: String, default: '' },
        },
      ],
      quoteText: { type: String, default: '' },
      quoteAuthor: { type: String, default: '' },
      closingImage: { type: String, default: '' },
    },
    shopPage: {
      allBannerImage: { type: String, default: '' },
    },
    giftSetPage: {
      bannerImage: { type: String, default: '' },
    },
    contactInfo: {
      storeName: { type: String, default: '' },
      address: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      workingHours: { type: String, default: '' },
      // A Google Maps share link for the store's location (admin searches the
      // store on Google Maps, taps Share, and pastes the link here). The
      // header's "Store Locator" link opens this directly instead of an
      // embedded map, so there's nothing to keep in sync beyond the link.
      storeMapUrl: { type: String, default: '' },
    },
    footer: {
      description: { type: String, default: '' },
      columns: [
        {
          title: { type: String, required: true },
          links: [{ label: { type: String, required: true }, url: { type: String, required: true }, _id: false }],
          _id: false,
        },
      ],
    },
    socialLinks: [{ platform: { type: String, required: true }, url: { type: String, required: true }, _id: false }],
    announcementBar: {
      text: { type: String, default: '' },
      link: { type: String, default: '' },
      isActive: { type: Boolean, default: true },
    },
    faqs: [{ question: String, answer: String, displayOrder: { type: Number, default: 0 } }],
    policies: {
      privacyPolicy: { type: String, default: '' },
      termsConditions: { type: String, default: '' },
      shippingPolicy: { type: String, default: '' },
      returnPolicy: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);
