const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const https = require('https');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Product = require('../models/Product');
const GiftSet = require('../models/GiftSet');

const FOLDERS = {
  attars: '1Lnq9xx7-qVGzk5tpgCWuaaI2nKxMOWqY',
  giftsets: '1tJQpY7pkR725VdpY31E4rJ_FSxcHxuvD',
  perfumes: '1-rHJBh6ikAMwc4kjYPyXqHnVSpiz86Z2',
};

function fetchFolderDriveMap(folderName, folderId) {
  return new Promise((resolve, reject) => {
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
          console.log(`[${folderName}] Indexed ${Object.keys(map).length} Google Drive files.`);
          resolve(map);
        });
      })
      .on('error', reject);
  });
}

function getDriveUrl(driveMap, folder, baseName) {
  const fileName = `${baseName}.png`.toLowerCase();
  const fileId = driveMap[folder]?.[fileName];
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  console.warn(`Warning: Could not find Drive ID for ${folder}/${fileName}, using local fallback.`);
  return `/uploads/media/${folder}/${baseName}.png`;
}

async function run() {
  await connectDB();
  console.log('Fetching file maps from Google Drive folders...');

  const driveMap = {};
  for (const [name, id] of Object.entries(FOLDERS)) {
    driveMap[name] = await fetchFolderDriveMap(name, id);
  }

  // 1. Update Perfumes
  const perfumeData = [
    { slug: 'royal-oud', collNum: 1, prodNum: 1 },
    { slug: 'velvet-musk', collNum: 1, prodNum: 2 },
    { slug: 'midnight-amber', collNum: 1, prodNum: 3 },
    { slug: 'golden-rose', collNum: 1, prodNum: 4 },
    { slug: 'noir-essence', collNum: 1, prodNum: 5 },
    { slug: 'imperial-musk', collNum: 1, prodNum: 6 },

    { slug: 'oud-royale', collNum: 2, prodNum: 1 },
    { slug: 'sultans-oud', collNum: 2, prodNum: 2 },
    { slug: 'royal-saffron', collNum: 2, prodNum: 3 },
    { slug: 'golden-oud', collNum: 2, prodNum: 4 },
    { slug: 'black-majesty', collNum: 2, prodNum: 5 },
    { slug: 'amber-elixir', collNum: 2, prodNum: 6 },

    { slug: 'blue-majesty', collNum: 3, prodNum: 1 },
    { slug: 'urban-king', collNum: 3, prodNum: 2 },
    { slug: 'black-sultan', collNum: 3, prodNum: 3 },
    { slug: 'royal-leather', collNum: 3, prodNum: 4 },
    { slug: 'apex', collNum: 3, prodNum: 5 },
    { slug: 'dark-vetiver', collNum: 3, prodNum: 6 },
    { slug: 'arabian-warrior', collNum: 3, prodNum: 7 },
    { slug: 'night-rider', collNum: 3, prodNum: 8 },

    { slug: 'velvet-queen', collNum: 4, prodNum: 1 },
    { slug: 'royal-rose', collNum: 4, prodNum: 2 },
    { slug: 'golden-bloom', collNum: 4, prodNum: 3 },
    { slug: 'pink-musk', collNum: 4, prodNum: 4 },
    { slug: 'pearl', collNum: 4, prodNum: 5 },
    { slug: 'vanilla-dream', collNum: 4, prodNum: 6 },
    { slug: 'arabian-princess', collNum: 4, prodNum: 7 },
    { slug: 'blossom-elixir', collNum: 4, prodNum: 8 },

    { slug: 'ocean-mist', collNum: 5, prodNum: 1 },
    { slug: 'citrus-rush', collNum: 5, prodNum: 2 },
    { slug: 'blue-wave', collNum: 5, prodNum: 3 },
    { slug: 'fresh-aura', collNum: 5, prodNum: 4 },
    { slug: 'aqua-woods', collNum: 5, prodNum: 5 },
    { slug: 'morning-breeze', collNum: 5, prodNum: 6 },
    { slug: 'green-spirit', collNum: 5, prodNum: 7 },
    { slug: 'pure-musk', collNum: 5, prodNum: 8 },
  ];

  let perfumesUpdated = 0;
  for (const p of perfumeData) {
    const prefix = `${p.collNum}${p.prodNum}`;
    const mainImage = getDriveUrl(driveMap, 'perfumes', `${prefix}1`);
    const hoverImage = getDriveUrl(driveMap, 'perfumes', `${prefix}2`);
    const galleryImages = [3, 4, 5, 6].map((idx) => getDriveUrl(driveMap, 'perfumes', `${prefix}${idx}`));

    await Product.findOneAndUpdate({ slug: p.slug }, { mainImage, hoverImage, galleryImages });
    perfumesUpdated++;
  }
  console.log(`Updated Google Drive URLs for ${perfumesUpdated} Perfumes.`);

  // 2. Update Attars
  const attarData = [
    { slug: 'royal-oud-attar', attarIdx: 1 },
    { slug: 'dehn-al-oud', attarIdx: 2 },
    { slug: 'white-musk', attarIdx: 3 },

    { slug: 'black-oud', attarIdx: 4 },
    { slug: 'oud-rose', attarIdx: 5 },
    { slug: 'royal-musk', attarIdx: 6 },

    { slug: 'gulab-attar', attarIdx: 7 },
    { slug: 'jasmine-attar', attarIdx: 8 },
    { slug: 'golden-amber', attarIdx: 9 },

    { slug: 'vanilla-musk', attarIdx: 10 },
    { slug: 'arabian-musk', attarIdx: 11 },

    { slug: 'sandal-musk', attarIdx: 12 },
  ];

  let attarsUpdated = 0;
  for (const a of attarData) {
    const prefix = `${a.attarIdx}`;
    const mainImage = getDriveUrl(driveMap, 'attars', `${prefix}1`);
    const hoverImage = getDriveUrl(driveMap, 'attars', `${prefix}2`);
    const galleryImages = [3, 4, 5, 6].map((idx) => getDriveUrl(driveMap, 'attars', `${prefix}${idx}`));

    await Product.findOneAndUpdate({ slug: a.slug }, { mainImage, hoverImage, galleryImages });
    attarsUpdated++;
  }
  console.log(`Updated Google Drive URLs for ${attarsUpdated} Attars.`);

  // 3. Update Gift Sets
  const giftSetData = [
    { slug: 'royal-bloom-duo', setNum: 1 },
    { slug: 'fresh-duo', setNum: 2 },
    { slug: 'modern-masculine-trio', setNum: 3 },
    { slug: 'rose-and-vanilla-trio', setNum: 4 },
    { slug: 'complete-musk-collection', setNum: 5 },
  ];

  let giftSetsUpdated = 0;
  for (const gs of giftSetData) {
    const mainImage = getDriveUrl(driveMap, 'giftsets', `${gs.setNum}1`);
    const hoverImage = getDriveUrl(driveMap, 'giftsets', `${gs.setNum}2`);
    const galleryImages = [3, 4, 5, 6].map((idx) => getDriveUrl(driveMap, 'giftsets', `${gs.setNum}${idx}`));

    await GiftSet.findOneAndUpdate({ slug: gs.slug }, { mainImage, hoverImage, galleryImages });
    giftSetsUpdated++;
  }
  console.log(`Updated Google Drive URLs for ${giftSetsUpdated} Gift Sets.`);

  console.log('\nSUCCESS! All database products and gift sets have been updated with Google Drive share URLs!');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error updating Google Drive URLs:', err);
  process.exit(1);
});
