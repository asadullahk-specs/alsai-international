require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Collection = require('../models/Collection');
const FragranceFamily = require('../models/FragranceFamily');
const FeaturedCollection = require('../models/FeaturedCollection');
const Product = require('../models/Product');
const GiftSet = require('../models/GiftSet');
const WebsiteContent = require('../models/WebsiteContent');
const HomepageContent = require('../models/HomepageContent');
const Testimonial = require('../models/Testimonial');

const upsert = (Model, match, data) => Model.findOneAndUpdate(match, data, { upsert: true, new: true, setDefaultsOnInsert: true });

// WebsiteContent and HomepageContent are singleton "site config" documents -
// there's only ever one of each, matched by `{}`. `upsert` above does a plain
// findOneAndUpdate with no `$set`, which MongoDB treats as a FULL DOCUMENT
// REPLACEMENT, not a merge. For per-item seeds (Products, Collections, Gift
// Sets - each matched by its own unique slug) that's fine, since each call
// only ever touches its own record. But for these two singletons, every time
// this script is re-run (e.g. as part of a normal local restart per the
// README setup steps) it was replacing the ENTIRE existing document with the
// hardcoded defaults below - silently wiping any hero slides, images, or text
// an admin had since added or edited through the admin panel, because none of
// the placeholder hero slides here even have a backgroundImage set. `seedOnce`
// uses $setOnInsert instead, so it only ever populates these documents the
// very first time (when none exists yet) and is a safe no-op on every
// subsequent run, no matter how many times the script is re-executed.
const seedOnce = (Model, match, data) =>
  Model.findOneAndUpdate(match, { $setOnInsert: data }, { upsert: true, new: true, setDefaultsOnInsert: true });

const run = async () => {
  await connectDB();

  // --- Collections (Perfumes / Attars) ---
  const [perfumes, attars] = await Promise.all([
    upsert(Collection, { slug: 'perfumes' }, { name: 'Perfumes', slug: 'perfumes', displayOrder: 1 }),
    upsert(Collection, { slug: 'attars' }, { name: 'Attars', slug: 'attars', displayOrder: 2 }),
  ]);
  console.log('Collections ready: Perfumes, Attars');

  // --- Fragrance Families ---
  const familyNames = ['Floral', 'Woody', 'Fresh', 'Amber', 'Oriental', 'Citrus', 'Aquatic', 'Spicy', 'Powdery'];
  const families = {};
  for (let i = 0; i < familyNames.length; i += 1) {
    const name = familyNames[i];
    const slug = name.toLowerCase();
    families[slug] = await upsert(FragranceFamily, { slug }, { name, slug, displayOrder: i + 1 });
  }
  console.log('Fragrance Families ready:', familyNames.join(', '));

  // --- Featured Collections (curated marketing groupings) ---
  const featuredDefs = [
    { name: 'Oud Collection', slug: 'oud-collection', description: 'Rich, deep, intense.' },
    { name: 'Floral Collection', slug: 'floral-collection', description: 'Elegant & feminine.' },
    { name: 'Fresh Collection', slug: 'fresh-collection', description: 'Light & invigorating.' },
    { name: 'Signature Collection', slug: 'signature-collection', description: 'Timeless & iconic.' },
    { name: 'Attar Collection', slug: 'attar-collection', description: 'Alcohol-free.' },
  ];
  const featured = {};
  for (let i = 0; i < featuredDefs.length; i += 1) {
    const def = featuredDefs[i];
    featured[def.slug] = await upsert(
      FeaturedCollection,
      { slug: def.slug },
      { ...def, displayOrder: i + 1, isFeaturedOnHomepage: true }
    );
  }
  console.log('Featured Collections ready:', featuredDefs.map((f) => f.name).join(', '));

  // --- Products ---
  const productDefs = [
    {
      name: 'Oud Elixir',
      slug: 'oud-elixir',
      collection: perfumes._id,
      featuredCollection: featured['oud-collection']._id,
      fragranceFamily: families.woody._id,
      shortDescription: 'Deep. Powerful. Unforgettable.',
      fullDescription:
        "Oud Elixir is an intense and sophisticated extrait de parfum crafted for those who appreciate depth and character. It opens with a warm whisper of saffron and smoky spice, revealing a heart of rich woods and amber, and settles into a long-lasting trail of pure oud and resin.",
      sizes: [
        { size: '30ml', sku: 'ALS-OUD-001-30', price: 8900, salePrice: 7100, costPrice: 3200, stock: 40 },
        { size: '50ml', sku: 'ALS-OUD-001-50', price: 14450, salePrice: 11500, costPrice: 5100, stock: 65 },
        { size: '70ml', sku: 'ALS-OUD-001-70', price: 18900, salePrice: 15100, costPrice: 6800, stock: 25 },
        { size: '100ml', sku: 'ALS-OUD-001-100', price: 24500, salePrice: 19600, costPrice: 8900, stock: 12 },
      ],
      fragranceNotes: {
        top: ['Saffron', 'Black Pepper', 'Bergamot'],
        heart: ['Oud', 'Cedarwood', 'Patchouli', 'Vetiver'],
        base: ['Amber', 'Musk', 'Leather', 'Sandalwood'],
      },
      facts: { longevity: '8-10 Hours', sillage: 'Strong', gender: 'Unisex', ingredients: 'Alcohol Denat, Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Coumarin, Eugenol' },
      isBestSeller: true,
      isFeatured: true,
    },
    {
      name: 'Santal Blanc',
      slug: 'santal-blanc',
      collection: perfumes._id,
      fragranceFamily: families.woody._id,
      shortDescription: 'Creamy Sandalwood & Musk',
      fullDescription: 'A creamy, comforting blend built around smooth sandalwood, softened with warm musk for an effortless everyday signature.',
      sizes: [
        { size: '50ml', sku: 'ALS-SAN-002-50', price: 8600, costPrice: 3100, stock: 58 },
        { size: '100ml', sku: 'ALS-SAN-002-100', price: 15400, costPrice: 5600, stock: 12 },
      ],
      fragranceNotes: { top: ['Bergamot', 'Pink Pepper'], heart: ['Sandalwood', 'Iris'], base: ['White Musk', 'Cedar'] },
      facts: { longevity: '6-8 Hours', sillage: 'Moderate', gender: 'Unisex' },
    },
    {
      name: 'Oud Noir',
      slug: 'oud-noir',
      collection: perfumes._id,
      featuredCollection: featured['oud-collection']._id,
      fragranceFamily: families.woody._id,
      shortDescription: 'Deep Oud & Precious Woods',
      fullDescription: 'A darker, more brooding take on oud - smoky woods layered over a smoldering base for those who like to make an entrance.',
      sizes: [
        { size: '50ml', sku: 'ALS-OUN-003-50', price: 9200, costPrice: 3400, stock: 7 },
        { size: '100ml', sku: 'ALS-OUN-003-100', price: 16500, costPrice: 6000, stock: 15 },
      ],
      fragranceNotes: { top: ['Bergamot', 'Saffron'], heart: ['Oud', 'Rose'], base: ['Leather', 'Amber'] },
      facts: { longevity: '8+ Hours', sillage: 'Strong', gender: 'Men' },
      isBestSeller: true,
    },
    {
      name: 'Royal Amber',
      slug: 'royal-amber',
      collection: perfumes._id,
      featuredCollection: featured['signature-collection']._id,
      fragranceFamily: families.amber._id,
      shortDescription: 'Amber, Vanilla & Tonka',
      fullDescription: 'Warm amber wrapped in vanilla and tonka bean - a rich, cozy signature scent built to linger.',
      sizes: [
        { size: '50ml', sku: 'ALS-AMB-002-50', price: 8960, costPrice: 3300, stock: 145 },
        { size: '30ml', sku: 'ALS-AMB-002-30', price: 5960, costPrice: 2200, stock: 60 },
      ],
      fragranceNotes: { top: ['Cinnamon', 'Orange Blossom'], heart: ['Amber', 'Tonka Bean'], base: ['Vanilla', 'Musk'] },
      facts: { longevity: '7-9 Hours', sillage: 'Strong', gender: 'Unisex' },
      isBestSeller: true,
      isFeatured: true,
    },
    {
      name: "Rose D'or",
      slug: 'rose-dor',
      collection: perfumes._id,
      featuredCollection: featured['floral-collection']._id,
      fragranceFamily: families.floral._id,
      shortDescription: 'Rose, Peony & Musk',
      fullDescription: 'A romantic bouquet of Bulgarian rose and peony, softened with clean musk - elegant and unmistakably feminine.',
      sizes: [{ size: '50ml', sku: 'ALS-ROS-003-50', price: 9100, costPrice: 3200, stock: 58 }],
      fragranceNotes: { top: ['Litchi', 'Peony'], heart: ['Rose', 'Jasmine'], base: ['White Musk'] },
      facts: { longevity: '6-8 Hours', sillage: 'Moderate', gender: 'Women' },
    },
    {
      name: 'Lumière',
      slug: 'lumiere',
      collection: perfumes._id,
      featuredCollection: featured['fresh-collection']._id,
      fragranceFamily: families.citrus._id,
      shortDescription: 'Citrus, Jasmine & Woods',
      fullDescription: 'Bright citrus and jasmine over a soft woody base - an uplifting scent for daytime wear.',
      sizes: [{ size: '50ml', sku: 'ALS-LUM-004-50', price: 8600, costPrice: 3000, stock: 90 }],
      fragranceNotes: { top: ['Bergamot', 'Mandarin'], heart: ['Jasmine', 'Neroli'], base: ['Cedarwood', 'Musk'] },
      facts: { longevity: '5-7 Hours', sillage: 'Moderate', gender: 'Unisex' },
    },
    {
      name: 'Noir Intense',
      slug: 'noir-intense',
      collection: perfumes._id,
      fragranceFamily: families.woody._id,
      shortDescription: 'Dark Woods & Amber',
      fullDescription: 'An intense, brooding blend of dark woods and smoky amber built for evening wear.',
      sizes: [{ size: '50ml', sku: 'ALS-BLK-005-50', price: 9500, salePrice: 7600, costPrice: 3400, stock: 0 }],
      fragranceNotes: { top: ['Black Pepper'], heart: ['Dark Woods'], base: ['Amber', 'Leather'] },
      facts: { longevity: '8+ Hours', sillage: 'Strong', gender: 'Men' },
    },
    {
      name: 'Musk Blanc',
      slug: 'musk-blanc',
      collection: perfumes._id,
      fragranceFamily: families.powdery._id,
      shortDescription: 'White Musk & Powdery Notes',
      fullDescription: 'Soft, skin-like white musk with a powdery finish - clean, comforting, and easy to wear daily.',
      sizes: [{ size: '50ml', sku: 'ALS-MUS-006-50', price: 8600, costPrice: 3100, stock: 32 }],
      fragranceNotes: { top: ['Aldehydes'], heart: ['Iris', 'Violet'], base: ['White Musk', 'Powdery Notes'] },
      facts: { longevity: '6-8 Hours', sillage: 'Soft', gender: 'Unisex' },
      isNewArrival: true,
    },
    {
      name: 'Belle Âme',
      slug: 'belle-ame',
      collection: perfumes._id,
      featuredCollection: featured['floral-collection']._id,
      fragranceFamily: families.floral._id,
      shortDescription: 'Soft Floral & White Musk',
      fullDescription: 'A soft, romantic floral bouquet finished with clean white musk - gentle and graceful.',
      sizes: [
        { size: '30ml', sku: 'ALS-BEL-008-30', price: 6700, costPrice: 2500, stock: 0 },
        { size: '50ml', sku: 'ALS-BEL-008-50', price: 9800, costPrice: 3600, stock: 20 },
      ],
      fragranceNotes: { top: ['Pear', 'Freesia'], heart: ['Peony', 'Lily of the Valley'], base: ['White Musk'] },
      facts: { longevity: '6-8 Hours', sillage: 'Moderate', gender: 'Women' },
      isNewArrival: true,
    },
    {
      name: 'Amber Attar',
      slug: 'amber-attar',
      collection: attars._id,
      featuredCollection: featured['attar-collection']._id,
      fragranceFamily: families.amber._id,
      shortDescription: 'Pure Amber Oil, Alcohol-Free',
      fullDescription: 'A concentrated, alcohol-free amber oil in the traditional attar style - long-lasting and skin-friendly.',
      sizes: [{ size: '12ml', sku: 'ALS-ATR-001-12', price: 6500, costPrice: 2300, stock: 45 }],
      facts: { concentration: 'Attar (Oil-Based)', longevity: '10+ Hours', sillage: 'Strong', gender: 'Unisex' },
      isNewArrival: true,
    },
  ];

  const savedProducts = {};
  for (const def of productDefs) {
    const saved = await upsert(Product, { slug: def.slug }, def);
    savedProducts[def.slug] = saved;
  }
  console.log(`Products ready: ${productDefs.length} products across Perfumes & Attars`);

  // Related products: cross-link a few for the single product page
  await Product.findByIdAndUpdate(savedProducts['oud-elixir']._id, {
    relatedProducts: [
      savedProducts['santal-blanc']._id,
      savedProducts['oud-noir']._id,
      savedProducts['royal-amber']._id,
      savedProducts['belle-ame']._id,
    ],
  });
  await Product.findByIdAndUpdate(savedProducts['oud-noir']._id, {
    relatedProducts: [savedProducts['oud-elixir']._id, savedProducts['royal-amber']._id, savedProducts['noir-intense']._id],
  });

  // --- Gift Sets ---
  await upsert(
    GiftSet,
    { slug: 'the-signature-trio' },
    {
      name: 'The Signature Trio',
      slug: 'the-signature-trio',
      price: 21500,
      description: 'A curated trio of our finest fragrances - 3 x 50ml.',
      includedProducts: [
        { product: savedProducts['royal-amber']._id, size: '50ml' },
        { product: savedProducts['santal-blanc']._id, size: '50ml' },
        { product: savedProducts['rose-dor']._id, size: '50ml' },
      ],
      displayOrder: 1,
    }
  );
  await upsert(
    GiftSet,
    { slug: 'oud-discovery-set' },
    {
      name: 'Oud Discovery Set',
      slug: 'oud-discovery-set',
      price: 24500,
      description: 'A refined selection for every oud occasion - 3 x 50ml.',
      includedProducts: [
        { product: savedProducts['oud-elixir']._id, size: '50ml' },
        { product: savedProducts['oud-noir']._id, size: '50ml' },
        { product: savedProducts['noir-intense']._id, size: '50ml' },
      ],
      displayOrder: 2,
    }
  );
  console.log('Gift Sets ready: The Signature Trio, Oud Discovery Set');

  // --- Website Content (Navbar/Footer) ---
  await seedOnce(
    WebsiteContent,
    {},
    {
      aboutPage: {
        heading: 'The Essence of Luxury',
        description: "AL SA'I is more than a perfume house. It is a journey of passion, craftsmanship, and the pursuit of olfactory perfection.",
      },
      contactInfo: {
        storeName: "AL SA'I Fragrances",
        address: 'Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan',
        phone: '+92 300 1234567',
        email: 'info@alsai.com',
        whatsapp: '+92 300 1234567',
        workingHours: 'Monday - Saturday, 10:00 AM - 8:00 PM. Sunday Closed.',
      },
      footer: {
        description: 'Crafted with passion, inspired by heritage, designed for timeless impressions.',
        columns: [
          {
            title: 'Shop',
            links: [
              { label: 'All Perfumes', url: '/shop?collection=perfumes' },
              { label: 'Best Sellers', url: '/shop?sort=popular' },
              { label: 'New Arrivals', url: '/shop?sort=newest' },
              { label: 'Promotions', url: '/promotions' },
              { label: 'Gift Sets', url: '/gift-sets' },
            ],
          },
          {
            title: 'Customer Care',
            links: [
              { label: 'Shipping & Delivery', url: '/policies/shipping' },
              { label: 'Returns & Exchanges', url: '/policies/returns' },
              { label: 'FAQs', url: '/faqs' },
              { label: 'Contact Us', url: '/contact' },
              { label: 'Track Order', url: '/orders' },
            ],
          },
          {
            title: 'About Us',
            links: [
              { label: 'Our Story', url: '/about' },
              { label: 'Ingredients', url: '/about#ingredients' },
              { label: 'Sustainability', url: '/about#sustainability' },
              { label: 'Careers', url: '/careers' },
            ],
          },
        ],
      },
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com/alsai' },
        { platform: 'instagram', url: 'https://instagram.com/alsai' },
        { platform: 'tiktok', url: 'https://tiktok.com/@alsai' },
        { platform: 'youtube', url: 'https://youtube.com/@alsai' },
      ],
      announcementBar: { text: 'COMPLIMENTARY SHIPPING ON ORDERS OVER PKR 10,000', isActive: true },
      faqs: [
        { question: 'What is extrait de parfum?', answer: 'The most concentrated form of fragrance, offering the richest scent and longest wear time.', displayOrder: 1 },
        { question: "How long do AL SA'I perfumes last?", answer: 'Most of our extraits last 6-10 hours depending on skin type and the individual fragrance.', displayOrder: 2 },
        { question: 'Do you offer Cash on Delivery?', answer: 'Yes, Cash on Delivery is available nationwide alongside EasyPaisa, JazzCash, and card payments.', displayOrder: 3 },
        { question: 'Can I return or exchange a product?', answer: 'Unused, unopened items in original packaging can be returned within 7 days of delivery.', displayOrder: 4 },
      ],
      policies: {
        shippingPolicy: 'Orders are dispatched within 1-2 business days. Free shipping on orders over PKR 10,000; standard shipping is PKR 250 otherwise.',
        returnPolicy: 'Unused, unopened items in original packaging may be returned within 7 days of delivery.',
      },
    }
  );
  console.log('Website Content ready');

  // --- Homepage Content ---
  await seedOnce(
    HomepageContent,
    {},
    {
      heroSlides: [
        {
          heading: 'Crafted For Timeless Impressions',
          description: 'Discover signature scents that speak luxury, crafted with rare ingredients and passion.',
          buttonText: 'Explore Collection',
          buttonUrl: '/shop',
          secondaryButtonText: 'Our Story',
          secondaryButtonUrl: '/about',
          displayOrder: 1,
          isActive: true,
        },
        {
          heading: 'The Essence of Luxury',
          description: "Experience the art of fine perfumery with AL SA'I.",
          buttonText: 'Discover Now',
          buttonUrl: '/shop',
          displayOrder: 2,
          isActive: true,
        },
        {
          heading: 'Elevate Every Moment',
          description: "Luxury fragrances for those who appreciate life's finer moments.",
          buttonText: 'Shop Now',
          buttonUrl: '/shop',
          displayOrder: 3,
          isActive: true,
        },
      ],
      featuredCollections: Object.values(featured).map((f) => f._id),
      bestSellers: [savedProducts['oud-elixir']._id, savedProducts['royal-amber']._id, savedProducts['oud-noir']._id],
      newArrivals: [savedProducts['musk-blanc']._id, savedProducts['belle-ame']._id, savedProducts['amber-attar']._id],
      ourStory: {
        tagline: 'THE ESSENCE OF LUXURY',
        heading: 'Our Story',
        description: "AL SA'I is more than a perfume house. It is a journey of passion, craftsmanship, and the pursuit of olfactory perfection.",
        buttonText: 'Discover Our Journey',
        buttonUrl: '/about',
      },
      newsletterSection: {
        heading: 'Stay in the Know',
        description: 'Subscribe to get exclusive offers, new arrivals, and fragrance stories.',
      },
    }
  );
  console.log('Homepage Content ready');

  // --- Testimonials (written fresh - not copied from placeholder template text) ---
  const testimonialDefs = [
    { customerName: 'Ali Raza', rating: 5, message: 'Oud Elixir is stunning - rich, long-lasting, and the packaging feels genuinely luxury.', displayOrder: 1 },
    { customerName: 'Zainab Khan', rating: 5, message: "Royal Amber has become my everyday scent. Compliments every single time I wear it.", displayOrder: 2 },
    { customerName: 'Usman Ahmed', rating: 4, message: 'Fast delivery and the Santal Blanc smells even better in person than in the photos.', displayOrder: 3 },
    { customerName: 'Sara Ali', rating: 5, message: 'Rose D\'or is beautifully soft without being overpowering. Will be reordering soon.', displayOrder: 4 },
  ];
  for (const t of testimonialDefs) {
    await upsert(Testimonial, { customerName: t.customerName, message: t.message }, { ...t, status: 'approved' });
  }
  console.log('Testimonials ready:', testimonialDefs.length);

  await mongoose.disconnect();
  console.log('\nCatalog seed complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
