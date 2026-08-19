const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const PRICE_MAP = {
  // Perfumes Signature
  'royal-oud': { p50: 14800, p100: 24900, p150: 33500 },
  'velvet-musk': { p50: 9200, p100: 15800, p150: 21500 },
  'midnight-amber': { p50: 11500, p100: 19600, p150: 26800 },
  'golden-rose': { p50: 10400, p100: 17900, p150: 24200 },
  'noir-essence': { p50: 12200, p100: 20800, p150: 28400 },
  'imperial-musk': { p50: 9800, p100: 16900, p150: 22900 },

  // Perfumes Luxury
  'oud-royale': { p50: 16500, p100: 28500, p150: 38900 },
  'sultans-oud': { p50: 15800, p100: 26900, p150: 36500 },
  'royal-saffron': { p50: 13900, p100: 23800, p150: 32400 },
  'golden-oud': { p50: 14900, p100: 25500, p150: 34800 },
  'black-majesty': { p50: 15200, p100: 26000, p150: 35500 },
  'amber-elixir': { p50: 13500, p100: 23000, p150: 31200 },

  // Perfumes Men's
  'blue-majesty': { p50: 8800, p100: 14900, p150: 20400 },
  'urban-king': { p50: 9400, p100: 16200, p150: 22000 },
  'black-sultan': { p50: 12600, p100: 21500, p150: 29000 },
  'royal-leather': { p50: 11800, p100: 20200, p150: 27500 },
  'apex': { p50: 8500, p100: 14500, p150: 19800 },
  'dark-vetiver': { p50: 10200, p100: 17400, p150: 23800 },
  'arabian-warrior': { p50: 13200, p100: 22500, p150: 30800 },
  'night-rider': { p50: 9900, p100: 16800, p150: 22800 },

  // Perfumes Women's
  'velvet-queen': { p50: 9600, p100: 16400, p150: 22500 },
  'royal-rose': { p50: 10800, p100: 18500, p150: 25200 },
  'golden-bloom': { p50: 9200, p100: 15800, p150: 21500 },
  'pink-musk': { p50: 8400, p100: 14200, p150: 19400 },
  'pearl': { p50: 8900, p100: 15200, p150: 20800 },
  'vanilla-dream': { p50: 9400, p100: 16000, p150: 21900 },
  'arabian-princess': { p50: 12400, p100: 21200, p150: 28900 },
  'blossom-elixir': { p50: 10200, p100: 17400, p150: 23800 },

  // Perfumes Fresh
  'ocean-mist': { p50: 7800, p100: 13200, p150: 18000 },
  'citrus-rush': { p50: 7400, p100: 12600, p150: 17200 },
  'blue-wave': { p50: 7900, p100: 13500, p150: 18400 },
  'fresh-aura': { p50: 7600, p100: 12900, p150: 17600 },
  'aqua-woods': { p50: 8200, p100: 14000, p150: 19000 },
  'morning-breeze': { p50: 7200, p100: 12200, p150: 16800 },
  'green-spirit': { p50: 7500, p100: 12800, p150: 17500 },
  'pure-musk': { p50: 8600, p100: 14600, p150: 19900 },

  // Attars
  'royal-oud-attar': { p50: 13500, p100: 23000, p150: 31500 },
  'dehn-al-oud': { p50: 15900, p100: 27200, p150: 37000 },
  'white-musk': { p50: 7800, p100: 13400, p150: 18200 },
  'black-oud': { p50: 14200, p100: 24200, p150: 33000 },
  'oud-rose': { p50: 12900, p100: 22000, p150: 30000 },
  'royal-musk': { p50: 8900, p100: 15200, p150: 20800 },
  'gulab-attar': { p50: 6800, p100: 11600, p150: 15800 },
  'jasmine-attar': { p50: 7200, p100: 12200, p150: 16600 },
  'golden-amber': { p50: 9500, p100: 16200, p150: 22000 },
  'vanilla-musk': { p50: 8200, p100: 14000, p150: 19000 },
  'arabian-musk': { p50: 9900, p100: 16800, p150: 22800 },
  'sandal-musk': { p50: 10500, p100: 17900, p150: 24500 },
};

async function run() {
  await connectDB();
  console.log('Updating catalog prices with unique prices & 17% cost margin...');

  let count = 0;
  for (const [slug, prices] of Object.entries(PRICE_MAP)) {
    const sizes = [
      {
        size: '50ml',
        sku: `ALS-${slug.toUpperCase()}-50`,
        price: prices.p50,
        costPrice: Math.round(prices.p50 / 1.17),
        stock: 50,
      },
      {
        size: '100ml',
        sku: `ALS-${slug.toUpperCase()}-100`,
        price: prices.p100,
        costPrice: Math.round(prices.p100 / 1.17),
        stock: 35,
      },
      {
        size: '150ml',
        sku: `ALS-${slug.toUpperCase()}-150`,
        price: prices.p150,
        costPrice: Math.round(prices.p150 / 1.17),
        stock: 20,
      },
    ];

    const res = await Product.findOneAndUpdate(
      { slug },
      { sizes },
      { new: true }
    );
    if (res) count++;
  }

  console.log(`Successfully updated unique prices for ${count} products.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
