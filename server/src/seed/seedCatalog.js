const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const fs = require('fs');
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
const seedOnce = (Model, match, data) =>
  Model.findOneAndUpdate(match, { $setOnInsert: data }, { upsert: true, new: true, setDefaultsOnInsert: true });

const https = require('https');

const FOLDERS = {
  attars: '1Lnq9xx7-qVGzk5tpgCWuaaI2nKxMOWqY',
  giftsets: '1tJQpY7pkR725VdpY31E4rJ_FSxcHxuvD',
  perfumes: '1-rHJBh6ikAMwc4kjYPyXqHnVSpiz86Z2',
};

function fetchFolderDriveMap(folderName, folderId) {
  return new Promise((resolve) => {
    const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const map = {};
          const regex = /id="entry-([a-zA-Z0-9_-]+)"[\s\S]*?class="flip-entry-title">([^<]+)<\/div>/g;
          let match;
          while ((match = regex.exec(data)) !== null) {
            const fileId = match[1];
            const fileName = match[2].trim().toLowerCase();
            map[fileName] = fileId;
          }
          resolve(map);
        });
      })
      .on('error', () => resolve({}));
  });
}

// Media file path resolver helper (Drive URL primary, local fallback)
const resolveMedia = (driveMap, folder, prefix, suffix) => {
  const base = `${prefix}${suffix}`;
  const fileName = `${base}.png`.toLowerCase();
  const fileId = driveMap[folder]?.[fileName];
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  const dir = path.join(__dirname, '..', 'uploads', 'media', folder);
  if (fs.existsSync(path.join(dir, `${base}.png`))) return `/uploads/media/${folder}/${base}.png`;
  if (fs.existsSync(path.join(dir, `${base}.PNG`))) return `/uploads/media/${folder}/${base}.PNG`;
  return `/uploads/media/${folder}/${base}.png`;
};

const run = async () => {
  await connectDB();

  console.log('Fetching Google Drive folder maps...');
  const driveMap = {};
  for (const [name, id] of Object.entries(FOLDERS)) {
    driveMap[name] = await fetchFolderDriveMap(name, id);
    console.log(`Indexed ${Object.keys(driveMap[name]).length} Drive files for ${name}.`);
  }

  // Clean up old catalog collections for a fresh seed
  await Promise.all([
    Product.deleteMany({}),
    GiftSet.deleteMany({}),
    FragranceFamily.deleteMany({}),
    FeaturedCollection.deleteMany({}),
  ]);
  console.log('Cleared existing catalog items.');

  // 1. Collections (Perfumes & Attars with descriptions)
  const [perfumes, attars] = await Promise.all([
    upsert(
      Collection,
      { slug: 'perfumes' },
      {
        name: 'Perfumes',
        slug: 'perfumes',
        description: 'Exquisite Extraits de Parfum crafted with high-concentration oils, rare botanicals, and unmatched longevity for the ultimate olfactory signature.',
        displayOrder: 1,
      }
    ),
    upsert(
      Collection,
      { slug: 'attars' },
      {
        name: 'Attars',
        slug: 'attars',
        description: 'Pure, alcohol-free artisanal fragrance oils rooted in centuries of oriental master perfumery, formulated for intimate skin warmth and enduring richness.',
        displayOrder: 2,
      }
    ),
  ]);
  console.log('Collections ready: Perfumes, Attars');

  // 2. Fragrance Families (with descriptions, empty image URL, belongsTo: Both/Perfumes)
  const familyDefs = [
    { name: 'Oud & Woody', slug: 'oud-woody', belongsTo: 'Both', description: 'Rich, mysterious, and deep woody notes rooted in aged agarwood, cedarwood, and sandalwood.', displayOrder: 1 },
    { name: 'Musk & Powdery', slug: 'musk-powdery', belongsTo: 'Both', description: 'Clean, velvet, and skin-like musk accords wrapped in soft comforting powdery nuances.', displayOrder: 2 },
    { name: 'Amber & Oriental', slug: 'amber-oriental', belongsTo: 'Both', description: 'Warm, opulent, and resinous amber blended with sweet vanilla, tonka bean, and exotic spices.', displayOrder: 3 },
    { name: 'Floral & Rose', slug: 'floral-rose', belongsTo: 'Both', description: 'Elegant floral bouquets featuring Bulgarian rose, delicate peony, jasmine, and blooming blossoms.', displayOrder: 4 },
    { name: 'Fresh & Citrus', slug: 'fresh-citrus', belongsTo: 'Both', description: 'Bright, zesty citrus peel, oceanic breeze, and invigorating fresh herbal notes.', displayOrder: 5 },
    { name: 'Leather & Spice', slug: 'leather-spice', belongsTo: 'Perfumes', description: 'Bold leather accords, warm saffron, black pepper, and sensual oriental spices.', displayOrder: 6 },
  ];

  const families = {};
  for (const def of familyDefs) {
    families[def.slug] = await upsert(
      FragranceFamily,
      { name: def.name },
      { name: def.name, slug: def.slug, description: def.description, image: '', belongsTo: def.belongsTo, displayOrder: def.displayOrder }
    );
  }
  console.log('Fragrance Families ready:', Object.keys(families).join(', '));

  // 3. Featured Collections
  const featuredDefs = [
    { name: 'Signature Collection', slug: 'signature-collection', description: 'Timeless & iconic signature creations.' },
    { name: 'Luxury Collection', slug: 'luxury-collection', description: 'Opulent, grand, and intense masterworks.' },
    { name: 'Men\'s Collection', slug: 'mens-collection', description: 'Bold, masculine, and sophisticated fragrances.' },
    { name: 'Women\'s Collection', slug: 'womens-collection', description: 'Graceful, elegant, and alluring scents.' },
    { name: 'Fresh Collection', slug: 'fresh-collection', description: 'Vibrant, uplifting, and crisp olfactory journeys.' },
  ];

  const featured = {};
  for (let i = 0; i < featuredDefs.length; i += 1) {
    const def = featuredDefs[i];
    featured[def.slug] = await upsert(
      FeaturedCollection,
      { name: def.name },
      { ...def, displayOrder: i + 1, isFeaturedOnHomepage: true }
    );
  }
  console.log('Featured Collections ready:', Object.keys(featured).join(', '));

  // Standard sizes & pricing (Profit margin: 17%)
  // 50ml: 9,500 PKR (Cost: 8,120)
  // 100ml: 16,500 PKR (Cost: 14,103)
  // 150ml: 22,500 PKR (Cost: 19,231)
  const makeStandardSizes = (slugPrefix) => [
    { size: '50ml', sku: `ALS-${slugPrefix.toUpperCase()}-50`, price: 9500, costPrice: 8120, stock: 50 },
    { size: '100ml', sku: `ALS-${slugPrefix.toUpperCase()}-100`, price: 16500, costPrice: 14103, stock: 35 },
    { size: '150ml', sku: `ALS-${slugPrefix.toUpperCase()}-150`, price: 22500, costPrice: 19231, stock: 20 },
  ];

  const standardShippingInfo = {
    deliveryTime: '2-3 working days',
    shippingCharges: '250',
    returnExchange: 'Unopened items in original packaging eligible for exchange within 7 days.',
    orderCancellation: 'Orders may be cancelled within 2 hours of placement.',
  };

  // 4. Products Data Definitions (36 Perfumes + 12 Attars)
  const perfumeData = [
    // Collection 1: Signature Collection (6 products)
    { name: 'Royal Oud', slug: 'royal-oud', collNum: 1, prodNum: 1, fam: 'oud-woody', feat: 'signature-collection', short: 'Regal Aged Oud & Warm Spices', top: ['Saffron', 'Bergamot'], heart: ['Aged Oud', 'Cedarwood'], base: ['Amber', 'Musk'], gender: 'Unisex' },
    { name: 'Velvet Musk', slug: 'velvet-musk', collNum: 1, prodNum: 2, fam: 'musk-powdery', feat: 'signature-collection', short: 'Ultra-Soft Velvet Musk Accord', top: ['Aldehydes', 'White Iris'], heart: ['Soft Musk', 'Jasmine'], base: ['Sandalwood', 'Powder'], gender: 'Unisex' },
    { name: 'Midnight Amber', slug: 'midnight-amber', collNum: 1, prodNum: 3, fam: 'amber-oriental', feat: 'signature-collection', short: 'Intense Nighttime Amber & Spice', top: ['Cinnamon', 'Cardamom'], heart: ['Smoked Amber', 'Patchouli'], base: ['Vanilla', 'Leather'], gender: 'Unisex' },
    { name: 'Golden Rose', slug: 'golden-rose', collNum: 1, prodNum: 4, fam: 'floral-rose', feat: 'signature-collection', short: 'Opulent Damask & Taif Rose Bouquet', top: ['Pink Pepper', 'Taif Rose'], heart: ['Bulgarian Rose', 'Peony'], base: ['Ambergris', 'Musk'], gender: 'Women' },
    { name: 'Noir Essence', slug: 'noir-essence', collNum: 1, prodNum: 5, fam: 'leather-spice', feat: 'signature-collection', short: 'Mysterious Dark Leather & Woods', top: ['Black Pepper', 'Incense'], heart: ['Dark Leather', 'Vetiver'], base: ['Tonka Bean', 'Wood'], gender: 'Men' },
    { name: 'Imperial Musk', slug: 'imperial-musk', collNum: 1, prodNum: 6, fam: 'musk-powdery', feat: 'signature-collection', short: 'Majestic Cashmere & Royal Musk', top: ['White Tea', 'Pear'], heart: ['Royal Musk', 'Violet'], base: ['Cashmere Wood', 'Amber'], gender: 'Unisex' },

    // Collection 2: Luxury Collection (6 products)
    { name: 'Oud Royale', slug: 'oud-royale', collNum: 2, prodNum: 1, fam: 'oud-woody', feat: 'luxury-collection', short: 'Precious Cambodi Oud Masterpiece', top: ['Saffron', 'Rose'], heart: ['Pure Cambodi Oud'], base: ['Amber', 'Leather'], gender: 'Unisex' },
    { name: 'Sultan\'s Oud', slug: 'sultans-oud', collNum: 2, prodNum: 2, fam: 'oud-woody', feat: 'luxury-collection', short: 'Smoked Agarwood Fit for Royalty', top: ['Cinnamon', 'Nutmeg'], heart: ['Smoked Agarwood', 'Cedar'], base: ['Labdanum', 'Musk'], gender: 'Men' },
    { name: 'Royal Saffron', slug: 'royal-saffron', collNum: 2, prodNum: 3, fam: 'leather-spice', feat: 'luxury-collection', short: 'Rich Kashmiri Red Saffron Scent', top: ['Kashmiri Saffron', 'Citrus'], heart: ['Rose', 'Nutmeg'], base: ['Leather', 'Sandalwood'], gender: 'Unisex' },
    { name: 'Golden Oud', slug: 'golden-oud', collNum: 2, prodNum: 4, fam: 'oud-woody', feat: 'luxury-collection', short: 'Luminous Golden Oud & Warm Vanilla', top: ['Bergamot', 'Cardamom'], heart: ['Golden Oud', 'Amber'], base: ['Vanilla', 'Cedar'], gender: 'Unisex' },
    { name: 'Black Majesty', slug: 'black-majesty', collNum: 2, prodNum: 5, fam: 'leather-spice', feat: 'luxury-collection', short: 'Commanding Smoked Leather Accord', top: ['Black Pepper', 'Bergamot'], heart: ['Smoked Leather', 'Guaiac Wood'], base: ['Vetiver', 'Musk'], gender: 'Men' },
    { name: 'Amber Elixir', slug: 'amber-elixir', collNum: 2, prodNum: 6, fam: 'amber-oriental', feat: 'luxury-collection', short: 'Concentrated Warm Amber Elixir', top: ['Cinnamon', 'Orange Blossom'], heart: ['Golden Amber', 'Tonka'], base: ['Vanilla', 'Musk'], gender: 'Unisex' },

    // Collection 3: Men's Collection (8 products)
    { name: 'Blue Majesty', slug: 'blue-majesty', collNum: 3, prodNum: 1, fam: 'fresh-citrus', feat: 'mens-collection', short: 'Ocean Breeze & Vibrant Citrus', top: ['Bergamot', 'Grapefruit'], heart: ['Sea Salt', 'Lavender'], base: ['Cedar', 'Ambergris'], gender: 'Men' },
    { name: 'Urban King', slug: 'urban-king', collNum: 3, prodNum: 2, fam: 'leather-spice', feat: 'mens-collection', short: 'Sophisticated Urban Spice & Leather', top: ['Cardamom', 'Pink Pepper'], heart: ['Leather', 'Patchouli'], base: ['Sandalwood', 'Musk'], gender: 'Men' },
    { name: 'Black Sultan', slug: 'black-sultan', collNum: 3, prodNum: 3, fam: 'oud-woody', feat: 'mens-collection', short: 'Dark & Brooding Agarwood Scent', top: ['Incense', 'Black Pepper'], heart: ['Dark Agarwood', 'Cypress'], base: ['Amber', 'Vetiver'], gender: 'Men' },
    { name: 'Royal Leather', slug: 'royal-leather', collNum: 3, prodNum: 4, fam: 'leather-spice', feat: 'mens-collection', short: 'Luxurious Suede & Tuscan Leather', top: ['Saffron', 'Thyme'], heart: ['Tuscan Leather', 'Jasmine'], base: ['Amber', 'Suede'], gender: 'Men' },
    { name: 'Apex', slug: 'apex', collNum: 3, prodNum: 5, fam: 'fresh-citrus', feat: 'mens-collection', short: 'High-Energy Citrus & Fresh Woods', top: ['Lemon', 'Bergamot', 'Pineapple'], heart: ['Cedar', 'Patchouli'], base: ['Oakmoss', 'Musk'], gender: 'Men' },
    { name: 'Dark Vetiver', slug: 'dark-vetiver', collNum: 3, prodNum: 6, fam: 'oud-woody', feat: 'mens-collection', short: 'Earthy Haitian Vetiver & Smoked Oak', top: ['Grapefruit', 'Cypress'], heart: ['Haitian Vetiver', 'Cedar'], base: ['Smoked Woods', 'Amber'], gender: 'Men' },
    { name: 'Arabian Warrior', slug: 'arabian-warrior', collNum: 3, prodNum: 7, fam: 'leather-spice', feat: 'mens-collection', short: 'Powerful Smoked Oud & Spiced Leather', top: ['Black Pepper', 'Saffron'], heart: ['Smoked Oud', 'Leather'], base: ['Amber', 'Vetiver'], gender: 'Men' },
    { name: 'Night Rider', slug: 'night-rider', collNum: 3, prodNum: 8, fam: 'amber-oriental', feat: 'mens-collection', short: 'Sensual Evening Vanilla & Tonka', top: ['Cardamom', 'Lavender'], heart: ['Smoked Vanilla', 'Tonka'], base: ['Leather', 'Cedar'], gender: 'Men' },

    // Collection 4: Women's Collection (8 products)
    { name: 'Velvet Queen', slug: 'velvet-queen', collNum: 4, prodNum: 1, fam: 'floral-rose', feat: 'womens-collection', short: 'Romantic Velvet Rose & Sweet Peony', top: ['Peony', 'Lychee'], heart: ['Velvet Rose', 'Iris'], base: ['White Musk', 'Amber'], gender: 'Women' },
    { name: 'Royal Rose', slug: 'royal-rose', collNum: 4, prodNum: 2, fam: 'floral-rose', feat: 'womens-collection', short: 'Pure Royal Damask Rose Extract', top: ['Bulgarian Rose', 'Mandarin'], heart: ['Rose de Mai', 'Jasmine'], base: ['Musk', 'Vanilla'], gender: 'Women' },
    { name: 'Golden Bloom', slug: 'golden-bloom', collNum: 4, prodNum: 3, fam: 'floral-rose', feat: 'womens-collection', short: 'Luminous Blossom & Golden Orchid', top: ['Peach', 'Freesia'], heart: ['Yellow Orchid', 'Jasmine'], base: ['Sandalwood', 'Musk'], gender: 'Women' },
    { name: 'Pink Musk', slug: 'pink-musk', collNum: 4, prodNum: 4, fam: 'musk-powdery', feat: 'womens-collection', short: 'Delicate Pink Musk & Vanilla', top: ['Pink Berries', 'Mandarin'], heart: ['Soft Pink Musk', 'Rose'], base: ['Vanilla', 'Cashmere'], gender: 'Women' },
    { name: 'Pearl', slug: 'pearl', collNum: 4, prodNum: 5, fam: 'musk-powdery', feat: 'womens-collection', short: 'Clean, Luminous White Pearl Accord', top: ['White Linen', 'Pear'], heart: ['Lily of the Valley', 'Iris'], base: ['White Amber', 'Musk'], gender: 'Women' },
    { name: 'Vanilla Dream', slug: 'vanilla-dream', collNum: 4, prodNum: 6, fam: 'amber-oriental', feat: 'womens-collection', short: 'Creamy Madagascar Vanilla Dream', top: ['Almond', 'Milk'], heart: ['Madagascar Vanilla', 'Orchid'], base: ['Tonka Bean', 'Musk'], gender: 'Women' },
    { name: 'Arabian Princess', slug: 'arabian-princess', collNum: 4, prodNum: 7, fam: 'floral-rose', feat: 'womens-collection', short: 'Enchanting Royal Jasmine & Amber', top: ['Saffron', 'Orange Blossom'], heart: ['Royal Jasmine', 'Amber'], base: ['Vanilla', 'Oud'], gender: 'Women' },
    { name: 'Blossom Elixir', slug: 'blossom-elixir', collNum: 4, prodNum: 8, fam: 'floral-rose', feat: 'womens-collection', short: 'Concentrated Cherry Blossom & Peony', top: ['Bergamot', 'Apple Blossom'], heart: ['Cherry Blossom', 'Peony'], base: ['White Musk', 'Cedar'], gender: 'Women' },

    // Collection 5: Fresh Collection (8 products)
    { name: 'Ocean Mist', slug: 'ocean-mist', collNum: 5, prodNum: 1, fam: 'fresh-citrus', feat: 'fresh-collection', short: 'Invigorating Coastal Ocean Breeze', top: ['Sea Notes', 'Calone'], heart: ['Water Lily', 'Crisp Mint'], base: ['Driftwood', 'Musk'], gender: 'Unisex' },
    { name: 'Citrus Rush', slug: 'citrus-rush', collNum: 5, prodNum: 2, fam: 'fresh-citrus', feat: 'fresh-collection', short: 'Zesty Sicilian Lemon & Neroli', top: ['Sicilian Lemon', 'Grapefruit'], heart: ['Neroli', 'Petitgrain'], base: ['White Cedar', 'Musk'], gender: 'Unisex' },
    { name: 'Blue Wave', slug: 'blue-wave', collNum: 5, prodNum: 3, fam: 'fresh-citrus', feat: 'fresh-collection', short: 'Refreshing Blue Sea Salt & Mint', top: ['Sea Salt', 'Bergamot'], heart: ['Aquatic Mint', 'Lavender'], base: ['Ambergris', 'Cedar'], gender: 'Unisex' },
    { name: 'Fresh Aura', slug: 'fresh-aura', collNum: 5, prodNum: 4, fam: 'fresh-citrus', feat: 'fresh-collection', short: 'Crisp Green Apple & Bamboo Aura', top: ['Green Apple', 'Lemon'], heart: ['Bamboo', 'White Rose'], base: ['Cedarwood', 'Amber'], gender: 'Unisex' },
    { name: 'Aqua Woods', slug: 'aqua-woods', collNum: 5, prodNum: 5, fam: 'fresh-citrus', feat: 'fresh-collection', short: 'Cool Marine Accord & Clean Woods', top: ['Marine Accord', 'Bergamot'], heart: ['Juniper Berries', 'Sage'], base: ['Driftwood', 'Vetiver'], gender: 'Men' },
    { name: 'Morning Breeze', slug: 'morning-breeze', collNum: 5, prodNum: 6, fam: 'fresh-citrus', feat: 'fresh-collection', short: 'Dewy Morning Breeze & White Tea', top: ['Dewy Grass', 'Mint'], heart: ['Freesia', 'White Tea'], base: ['Soft Musk', 'Amber'], gender: 'Unisex' },
    { name: 'Green Spirit', slug: 'green-spirit', collNum: 5, prodNum: 7, fam: 'fresh-citrus', feat: 'fresh-collection', short: 'Uplifting Green Tea & Lime Leaves', top: ['Vetiver Leaves', 'Lime'], heart: ['Green Tea', 'Basil'], base: ['Cedar', 'Musk'], gender: 'Unisex' },
    { name: 'Pure Musk', slug: 'pure-musk', collNum: 5, prodNum: 8, fam: 'musk-powdery', feat: 'fresh-collection', short: 'Pure Clean White Musk Signature', top: ['Fresh Aldehydes'], heart: ['Clean White Musk', 'Iris'], base: ['Powdery Musk', 'Amber'], gender: 'Unisex' },
  ];

  const attarData = [
    // 12 Attars
    { name: 'Royal Oud Attar', slug: 'royal-oud-attar', attarIdx: 1, fam: 'oud-woody', feat: 'signature-collection', short: 'Pure Concentrated Royal Oud Oil', top: ['Aged Agarwood'], heart: ['Smoked Oud'], base: ['Amber', 'Musk'], gender: 'Unisex' },
    { name: 'Dehn Al Oud', slug: 'dehn-al-oud', attarIdx: 2, fam: 'oud-woody', feat: 'signature-collection', short: 'Authentic Traditional Dehn Al Oud Oil', top: ['Wild Agarwood'], heart: ['Cambodi Oud Oil'], base: ['Resin', 'Leather'], gender: 'Unisex' },
    { name: 'White Musk', slug: 'white-musk', attarIdx: 3, fam: 'musk-powdery', feat: 'signature-collection', short: 'Concentrated Velvet White Musk Oil', top: ['Soft Floral'], heart: ['Velvet White Musk'], base: ['Powder', 'Amber'], gender: 'Unisex' },

    { name: 'Black Oud', slug: 'black-oud', attarIdx: 4, fam: 'oud-woody', feat: 'luxury-collection', short: 'Intense Smoked Black Oud Oil', top: ['Dark Wood'], heart: ['Black Agarwood Oil'], base: ['Smoked Amber'], gender: 'Unisex' },
    { name: 'Oud Rose', slug: 'oud-rose', attarIdx: 5, fam: 'floral-rose', feat: 'luxury-collection', short: 'Harmonic Blend of Oud & Taif Rose', top: ['Taif Rose'], heart: ['Oud Extract'], base: ['Ambergris'], gender: 'Unisex' },
    { name: 'Royal Musk', slug: 'royal-musk', attarIdx: 6, fam: 'musk-powdery', feat: 'luxury-collection', short: 'Opulent Royal Musk Concentration', top: ['White Iris'], heart: ['Royal Musk Oil'], base: ['Sandalwood'], gender: 'Unisex' },

    { name: 'Gulab Attar', slug: 'gulab-attar', attarIdx: 7, fam: 'floral-rose', feat: 'mens-collection', short: 'Traditional Distilled Rose Petal Oil', top: ['Fresh Rose'], heart: ['Gulab Distillate'], base: ['White Musk'], gender: 'Unisex' },
    { name: 'Jasmine Attar', slug: 'jasmine-attar', attarIdx: 8, fam: 'floral-rose', feat: 'mens-collection', short: 'Rich Night-Blooming Jasmine Oil', top: ['Night Jasmine'], heart: ['Sambac Extract'], base: ['Amber'], gender: 'Unisex' },
    { name: 'Golden Amber', slug: 'golden-amber', attarIdx: 9, fam: 'amber-oriental', feat: 'mens-collection', short: 'Concentrated Golden Amber Oil', top: ['Warm Spices'], heart: ['Golden Amber Resin'], base: ['Vanilla'], gender: 'Unisex' },

    { name: 'Vanilla Musk', slug: 'vanilla-musk', attarIdx: 10, fam: 'amber-oriental', feat: 'womens-collection', short: 'Indulgent Vanilla & Musk Oil', top: ['Sweet Cream'], heart: ['Vanilla Pod Oil'], base: ['White Musk'], gender: 'Women' },
    { name: 'Arabian Musk', slug: 'arabian-musk', attarIdx: 11, fam: 'musk-powdery', feat: 'womens-collection', short: 'Oriental Arabian Musk Oil Scent', top: ['Arabian Spices'], heart: ['Rich Musk Extract'], base: ['Amber'], gender: 'Unisex' },

    { name: 'Sandal Musk', slug: 'sandal-musk', attarIdx: 12, fam: 'oud-woody', feat: 'fresh-collection', short: 'Pure Mysuru Sandalwood & Soft Musk', top: ['Mysuru Sandalwood'], heart: ['Creamy Wood'], base: ['White Musk'], gender: 'Unisex' },
  ];

  const savedProducts = {};

  // Insert Perfumes
  for (const p of perfumeData) {
    const prefix = `${p.collNum}${p.prodNum}`;
    const mainImage = resolveMedia(driveMap, 'perfumes', prefix, 1);
    const hoverImage = resolveMedia(driveMap, 'perfumes', prefix, 2);
    const galleryImages = [3, 4, 5, 6].map((idx) => resolveMedia(driveMap, 'perfumes', prefix, idx));

    const doc = {
      name: p.name,
      slug: p.slug,
      brand: "AL SA'I",
      collection: perfumes._id,
      featuredCollection: featured[p.feat]._id,
      fragranceFamily: families[p.fam]._id,
      shortDescription: p.short,
      fullDescription: `${p.name} by AL SA'I is an exquisite International creation crafted for connoisseurs. Opening with notes of ${p.top.join(', ')}, evolving into ${p.heart.join(', ')}, and settling into a long-lasting base of ${p.base.join(', ')}.`,
      sizes: makeStandardSizes(p.slug),
      mainImage,
      hoverImage,
      galleryImages,
      fragranceNotes: { top: p.top, heart: p.heart, base: p.base },
      facts: {
        concentration: 'International',
        longevity: '8-10 Hours',
        sillage: 'Strong',
        gender: p.gender,
        ingredients: 'Alcohol Denat, Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Coumarin, Eugenol',
      },
      shippingInfo: standardShippingInfo,
      // Flags left false as requested by user
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isActive: true,
      isHidden: false,
    };

    savedProducts[p.slug] = await upsert(Product, { slug: p.slug }, doc);
  }

  // Insert Attars
  for (const a of attarData) {
    const prefix = `${a.attarIdx}`;
    const mainImage = resolveMedia(driveMap, 'attars', prefix, 1);
    const hoverImage = resolveMedia(driveMap, 'attars', prefix, 2);
    const galleryImages = [3, 4, 5, 6].map((idx) => resolveMedia(driveMap, 'attars', prefix, idx));

    const doc = {
      name: a.name,
      slug: a.slug,
      brand: "AL SA'I",
      collection: attars._id,
      featuredCollection: featured[a.feat]._id,
      fragranceFamily: families[a.fam]._id,
      shortDescription: a.short,
      fullDescription: `${a.name} is a concentrated, alcohol-free pure fragrance oil crafted in the traditional attar style. Features top notes of ${a.top.join(', ')}, heart notes of ${a.heart.join(', ')}, and base notes of ${a.base.join(', ')}.`,
      sizes: makeStandardSizes(a.slug),
      mainImage,
      hoverImage,
      galleryImages,
      fragranceNotes: { top: a.top, heart: a.heart, base: a.base },
      facts: {
        concentration: 'Attar (Oil-Based)',
        longevity: '10+ Hours',
        sillage: 'Strong',
        gender: a.gender,
        ingredients: 'Parfum (Fragrance Oil), Essential Oils, Dipropylene Glycol',
      },
      shippingInfo: standardShippingInfo,
      // Flags left false as requested by user
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isActive: true,
      isHidden: false,
    };

    savedProducts[a.slug] = await upsert(Product, { slug: a.slug }, doc);
  }

  console.log(`Products ready: ${Object.keys(savedProducts).length} items seeded across Perfumes & Attars`);

  // 5. Gift Sets (Display order: 0 for all)
  const giftSetDefs = [
    {
      name: 'Royal Bloom Duo',
      slug: 'royal-bloom-duo',
      price: 19500,
      setNum: 1,
      description: 'A regal duo pairing the intense depth of Royal Oud with the floral grace of Golden Bloom.',
      included: [
        { product: savedProducts['royal-oud']?._id, size: '50ml' },
        { product: savedProducts['golden-bloom']?._id, size: '50ml' },
      ],
    },
    {
      name: 'Fresh Duo',
      slug: 'fresh-duo',
      price: 18000,
      setNum: 2,
      description: 'An invigorating duo bringing together the crisp coastal breeze of Ocean Mist and Citrus Rush.',
      included: [
        { product: savedProducts['ocean-mist']?._id, size: '50ml' },
        { product: savedProducts['citrus-rush']?._id, size: '50ml' },
      ],
    },
    {
      name: 'Modern Masculine Trio',
      slug: 'modern-masculine-trio',
      price: 28500,
      setNum: 3,
      description: 'A sophisticated masculine trio comprising Arabian Musk, Black Majesty, and Apex.',
      included: [
        { product: savedProducts['arabian-musk']?._id, size: '50ml' },
        { product: savedProducts['black-majesty']?._id, size: '50ml' },
        { product: savedProducts['apex']?._id, size: '50ml' },
      ],
    },
    {
      name: 'Rose & Vanilla Trio',
      slug: 'rose-and-vanilla-trio',
      price: 27000,
      setNum: 4,
      description: 'An indulgent sweet & floral trio featuring Black Oud, Gulab Attar, and Vanilla Dream.',
      included: [
        { product: savedProducts['black-oud']?._id, size: '50ml' },
        { product: savedProducts['gulab-attar']?._id, size: '50ml' },
        { product: savedProducts['vanilla-dream']?._id, size: '50ml' },
      ],
    },
    {
      name: 'Complete Musk Collection',
      slug: 'complete-musk-collection',
      price: 42000,
      setNum: 5,
      description: 'The ultimate curation of AL SA\'I musks: White Musk, Vanilla Musk, Pink Musk, Green Spirit, and Pure Musk.',
      included: [
        { product: savedProducts['white-musk']?._id, size: '50ml' },
        { product: savedProducts['vanilla-musk']?._id, size: '50ml' },
        { product: savedProducts['pink-musk']?._id, size: '50ml' },
        { product: savedProducts['green-spirit']?._id, size: '50ml' },
        { product: savedProducts['pure-musk']?._id, size: '50ml' },
      ],
    },
  ];

  for (const gs of giftSetDefs) {
    const mainImage = resolveMedia(driveMap, 'giftsets', gs.setNum, 1);
    const hoverImage = resolveMedia(driveMap, 'giftsets', gs.setNum, 2);
    const galleryImages = [3, 4, 5, 6].map((idx) => resolveMedia(driveMap, 'giftsets', gs.setNum, idx));

    await upsert(
      GiftSet,
      { slug: gs.slug },
      {
        name: gs.name,
        slug: gs.slug,
        price: gs.price,
        description: gs.description,
        mainImage,
        hoverImage,
        galleryImages,
        includedProducts: gs.included.filter((item) => item.product),
        displayOrder: 0,
        isActive: true,
      }
    );
  }
  console.log('Gift Sets ready: 5 sets created with displayOrder 0');

  // 6. Website Content & Homepage Content
  await seedOnce(
    WebsiteContent,
    {},
    {
      aboutPage: {
        eyebrow: 'THE ESSENCE OF HAUTE PARFUMERIE',
        heading: 'Curating Timeless Olfactory Masterpieces',
        description: "Founded with an unyielding passion for luxury and distinction, AL SA'I crafts extraordinary extraits de parfum and pure oils that encapsulate elegance, heritage, and emotion.",
        image: '/uploads/media/perfumes/111.png',
        video: '',
        storyHeading: 'Our Story & Legacy',
        storyBody: "AL SA'I was born from an unwavering dedication to rare botanical essences, oriental heritage, and modern master perfumery.",
        storyImage: '/uploads/media/perfumes/112.png',
        storyVideo: '',
        values: [
          { icon: 'feather', title: 'Uncompromising Quality', description: 'Every formulation uses ultra-rare raw ingredients, cold-pressed extracts, and pure oils.' },
          { icon: 'droplet', title: 'Artisanal Purity', description: 'Crafted without synthetic fillers or diluted bases, preserving natural vibrancy.' },
        ],
        milestones: [{ year: '2024', title: 'Alcohol-Free Attar Range', description: 'Introduced our pure oil attars.' }],
        craftEyebrow: 'OUR CRAFT',
        craftHeading: 'The Art of Master Blending',
        craftImage: '/uploads/media/perfumes/113.png',
        quoteText: "Perfume is an invisible portrait of one's identity.",
        quoteAuthor: "House of AL SA'I",
        closingImage: '/uploads/media/perfumes/114.png',
        stats: [{ icon: 'award', value: '48+', label: 'Signature Scents' }],
      },
      contactInfo: {
        storeName: "AL SA'I Fragrances",
        address: 'Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan',
        phone: '+92 300 1234567',
        email: 'info@alsai.com',
        whatsapp: '+92 300 1234567',
        workingHours: 'Monday - Saturday, 10:00 AM - 8:00 PM. Sunday Closed.',
      },
      contactPage: { heroHeading: 'Contact Us', heroDescription: 'Reach out for inquiries, feedback, or assistance.' },
      faqsPage: { heroHeading: 'Frequently Asked Questions', heroDescription: 'Answers to common questions about products and shipping.' },
      footer: {
        description: 'Crafted with passion, inspired by heritage, designed for timeless impressions.',
        columns: [
          { title: 'Shop', links: [{ label: 'All Products', url: '/shop' }, { label: 'Gift Sets', url: '/gift-sets' }] },
          { title: 'Customer Care', links: [{ label: 'Shipping & Delivery', url: '/policies/shipping' }, { label: 'Contact Us', url: '/contact' }] },
          { title: 'About Us', links: [{ label: 'Our Story', url: '/about' }] },
        ],
      },
      socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/alsai' }],
      announcementBar: { text: 'COMPLIMENTARY SHIPPING ON ORDERS OVER PKR 10,000', isActive: true },
      faqs: [{ question: 'What is International fragrance?', answer: 'The most concentrated form of fragrance.', displayOrder: 1 }],
      policies: {
        privacy: { heroImage: '/uploads/media/perfumes/111.png', heroHeading: 'Privacy Policy', heroDescription: 'Your privacy is paramount to us.', sections: [] },
        terms: { heroImage: '/uploads/media/perfumes/111.png', heroHeading: 'Terms & Conditions', heroDescription: 'Terms governing our boutique platform.', sections: [] },
        shipping: { heroImage: '/uploads/media/perfumes/111.png', heroHeading: 'Shipping & Delivery Policy', heroDescription: 'Flat rate shipping PKR 250 across Pakistan with 2-3 working days delivery.', highlightCards: [], bullets: [] },
        returns: { heroImage: '/uploads/media/perfumes/111.png', heroHeading: 'Return & Exchange Policy', heroDescription: '14-day transparent return policy for unopened products.', highlightCards: [], bullets: [] },
      },
    }
  );

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
          displayOrder: 1,
          isActive: true,
        },
      ],
      featuredCollections: Object.values(featured).map((f) => f._id),
      bestSellers: [savedProducts['royal-oud']?._id, savedProducts['velvet-queen']?._id, savedProducts['blue-majesty']?._id].filter(Boolean),
      newArrivals: [savedProducts['ocean-mist']?._id, savedProducts['amber-elixir']?._id, savedProducts['dehn-al-oud']?._id].filter(Boolean),
      ourStory: {
        tagline: 'THE ESSENCE OF LUXURY',
        heading: 'Our Story',
        description: "AL SA'I is more than a perfume house. It is a journey of passion, craftsmanship, and olfactory perfection.",
        buttonText: 'Discover Our Journey',
        buttonUrl: '/about',
      },
      newsletterSection: { heading: 'Stay in the Know', description: 'Subscribe to get exclusive offers and fragrance stories.' },
    }
  );
  console.log('Homepage & Website Content ready');

  // Testimonials
  const testimonialDefs = [
    { customerName: 'Ali Raza', rating: 5, message: 'Royal Oud is stunning - rich, long-lasting, and premium quality.', displayOrder: 1 },
    { customerName: 'Zainab Khan', rating: 5, message: 'Velvet Queen has become my everyday scent. Compliments every time!', displayOrder: 2 },
  ];
  for (const t of testimonialDefs) {
    await upsert(Testimonial, { customerName: t.customerName }, { ...t, status: 'approved' });
  }

  console.log('\nAll Catalog seeding completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
