const mongoose = require('mongoose');

// Shared shape for the four policy-type pages (Shipping, Terms, Privacy,
// Returns). Every block is optional and the frontend only renders the
// blocks that have content, so the same schema comfortably produces both
// the "icon cards + bullet list" layout (Shipping/Returns) and the
// "sidebar table of contents + numbered sections" layout (Terms/Privacy)
// without needing separate schemas per page.
const policyPageSchema = new mongoose.Schema(
  {
    heroImage: { type: String, default: '' },
    heroHeading: { type: String, default: '' },
    heroDescription: { type: String, default: '' },
    highlightCards: [
      {
        icon: { type: String, default: 'box' },
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        _id: false,
      },
    ],
    sections: [
      {
        heading: { type: String, default: '' },
        body: { type: String, default: '' },
        _id: false,
      },
    ],
    bulletsHeading: { type: String, default: '' },
    bullets: [{ type: String }],
    showNeedHelp: { type: Boolean, default: false },
  },
  { _id: false }
);

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
          icon: { type: String, default: 'feather' },
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
      // "Our Craft" split panel - a signed quote paired with an image
      // (e.g. "The Art of Perfumery"). Renders as a light split section when
      // craftImage is set, or a plain centered quote when it isn't.
      craftEyebrow: { type: String, default: 'OUR CRAFT' },
      craftHeading: { type: String, default: '' },
      craftImage: { type: String, default: '' },
      quoteText: { type: String, default: '' },
      quoteAuthor: { type: String, default: '' },
      closingImage: { type: String, default: '' },
      // Trust-bar stats shown in the dark strip above the footer
      // (e.g. "50+ Signature Scents", "20+ Countries").
      stats: [
        {
          icon: { type: String, default: 'award' },
          value: { type: String, default: '' },
          label: { type: String, default: '' },
          _id: false,
        },
      ],
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
    // Hero banner text/image for the Contact Us page. Kept separate from
    // contactInfo above so the address/phone/hours (used in the footer and
    // Need-Help cards too) can't be wiped out by an edit to the page's
    // headline copy, and vice versa.
    contactPage: {
      heroImage: { type: String, default: '' },
      heroHeading: { type: String, default: 'Contact Us' },
      heroDescription: { type: String, default: "We're here to help! Reach out to us for any questions, feedback, or assistance." },
    },
    faqsPage: {
      heroImage: { type: String, default: '' },
      heroHeading: { type: String, default: 'Frequently Asked Questions' },
      heroDescription: { type: String, default: 'Find quick answers to the most common questions about our products, orders, and services.' },
    },
    promotionsPage: {
      heroImage: { type: String, default: '' },
      heroHeading: { type: String, default: 'Promotions & Offers' },
      heroDescription: { type: String, default: 'Exclusive seasonal discounts on selected luxury fragrances.' },
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
    // Structured, fully admin-manageable content for the four policy pages.
    // Each of the four uses the same flexible policyPageSchema (see above) -
    // Shipping/Returns lean on highlightCards + bullets, Terms/Privacy lean
    // on sections (rendered with an auto table of contents).
    policies: {
      shipping: { type: policyPageSchema, default: () => ({}) },
      terms: { type: policyPageSchema, default: () => ({}) },
      privacy: { type: policyPageSchema, default: () => ({}) },
      returns: { type: policyPageSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);
