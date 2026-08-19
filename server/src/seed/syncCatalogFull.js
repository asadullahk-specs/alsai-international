const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Product = require('../models/Product');
const FeaturedCollection = require('../models/FeaturedCollection');
const HomepageContent = require('../models/HomepageContent');

const run = async () => {
  await connectDB();
  console.log('Starting full database catalog sync...');

  // 1. Get all featured collections
  const featuredCollections = await FeaturedCollection.find({}).sort({ displayOrder: 1 });
  console.log(`Found ${featuredCollections.length} featured collections.`);

  const featImages = [
    '/uploads/media/perfumes/111.png',
    '/uploads/media/perfumes/211.png',
    '/uploads/media/perfumes/311.png',
    '/uploads/media/perfumes/411.png',
    '/uploads/media/perfumes/511.png',
  ];

  for (let idx = 0; idx < featuredCollections.length; idx += 1) {
    const fc = featuredCollections[idx];
    if (!fc.image && featImages[idx]) {
      fc.image = featImages[idx];
    }
    fc.isActive = true;
    fc.displayOrder = idx + 1;
    await fc.save();
  }

  // 2. Fetch all products
  const products = await Product.find({});
  console.log(`Found ${products.length} products to sync.`);

  let updatedCount = 0;
  for (let i = 0; i < products.length; i += 1) {
    const product = products[i];

    // Unique pricing step per product index:
    // Base 50ml price ranges between 9,800 and 17,200 PKR across products
    const p50 = 9800 + ((i * 370) % 7500);
    const p100 = Math.round(p50 * 1.68);
    const p150 = Math.round(p50 * 2.35);

    const sizes = [
      {
        size: '50ml',
        sku: `ALS-${product.slug.toUpperCase()}-50`,
        price: p50,
        salePrice: p50, // Price and Sale Price are identical as requested
        costPrice: Math.round(p50 * 0.83),
        stock: 60, // Stock > 55
      },
      {
        size: '100ml',
        sku: `ALS-${product.slug.toUpperCase()}-100`,
        price: p100,
        salePrice: p100, // Price and Sale Price are identical as requested
        costPrice: Math.round(p100 * 0.83),
        stock: 70, // Stock > 55
      },
      {
        size: '150ml',
        sku: `ALS-${product.slug.toUpperCase()}-150`,
        price: p150,
        salePrice: p150, // Price and Sale Price are identical as requested
        costPrice: Math.round(p150 * 0.83),
        stock: 80, // Stock > 55
      },
    ];

    product.sizes = sizes;
    product.totalStock = 60 + 70 + 80; // 210 total
    product.basePrice = p50;
    product.isFeatured = true;
    product.isBestSeller = true;
    product.isNewArrival = true;
    product.isActive = true;
    product.isHidden = false;

    await product.save();
    updatedCount += 1;
  }
  console.log(`Successfully updated and saved ${updatedCount} products with stock > 55, salePrice == price, and basePrice/totalStock computed.`);

  // 3. Populate HomepageContent
  const allProds = await Product.find({ isActive: true, isHidden: false });
  const bestSellerIds = allProds.slice(0, 12).map((p) => p._id);
  const newArrivalIds = allProds.slice(12, 24).map((p) => p._id);
  const featColIds = featuredCollections.map((fc) => fc._id);

  let homepageDoc = await HomepageContent.findOne();
  if (!homepageDoc) {
    homepageDoc = new HomepageContent();
  }

  homepageDoc.featuredCollections = featColIds;
  homepageDoc.bestSellers = bestSellerIds;
  homepageDoc.newArrivals = newArrivalIds;

  if (!homepageDoc.heroSlides || homepageDoc.heroSlides.length === 0) {
    homepageDoc.heroSlides = [
      {
        heading: 'Crafted For Timeless Impressions',
        description: 'Discover signature scents that speak luxury, crafted with rare ingredients and passion.',
        buttonText: 'Explore Collection',
        buttonUrl: '/shop',
        displayOrder: 1,
        isActive: true,
      },
    ];
  }

  await homepageDoc.save();
  console.log('HomepageContent successfully updated with featuredCollections, bestSellers, and newArrivals!');

  await mongoose.disconnect();
  console.log('Sync complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error('Error during catalog sync:', err);
  process.exit(1);
});
