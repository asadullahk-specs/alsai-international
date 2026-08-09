const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema(
  {
    aboutPage: {
      image: { type: String, default: '' },
      heading: { type: String, default: '' },
      description: { type: String, default: '' },
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
