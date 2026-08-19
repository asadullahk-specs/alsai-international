const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Product = require('../models/Product');
const HomepageContent = require('../models/HomepageContent');

const BEST_SELLER_SLUGS = ['vanilla-musk', 'black-oud', 'green-spirit', 'pure-musk'];
const NEW_ARRIVAL_SLUGS = ['arabian-musk', 'white-musk', 'morning-breeze', 'citrus-rush'];

const run = async () => {
  await connectDB();
  console.log('Setting specific Best Sellers and New Arrivals...');

  // Reset flags for all products
  await Product.updateMany({}, { isBestSeller: false, isNewArrival: false });

  // Update Best Sellers
  const bestSellerProds = await Product.find({ slug: { $in: BEST_SELLER_SLUGS } });
  const bestSellerIds = [];
  for (const slug of BEST_SELLER_SLUGS) {
    const found = bestSellerProds.find((p) => p.slug === slug);
    if (found) {
      found.isBestSeller = true;
      await found.save();
      bestSellerIds.push(found._id);
      console.log(`Updated Best Seller: ${found.name} (${found.slug})`);
    } else {
      console.warn(`Best Seller slug not found: ${slug}`);
    }
  }

  // Update New Arrivals
  const newArrivalProds = await Product.find({ slug: { $in: NEW_ARRIVAL_SLUGS } });
  const newArrivalIds = [];
  for (const slug of NEW_ARRIVAL_SLUGS) {
    const found = newArrivalProds.find((p) => p.slug === slug);
    if (found) {
      found.isNewArrival = true;
      await found.save();
      newArrivalIds.push(found._id);
      console.log(`Updated New Arrival: ${found.name} (${found.slug})`);
    } else {
      console.warn(`New Arrival slug not found: ${slug}`);
    }
  }

  // Update HomepageContent document
  let hp = await HomepageContent.findOne();
  if (!hp) {
    hp = new HomepageContent();
  }

  hp.bestSellers = bestSellerIds;
  hp.newArrivals = newArrivalIds;
  await hp.save();

  console.log('HomepageContent successfully updated with exact Best Sellers and New Arrivals.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
