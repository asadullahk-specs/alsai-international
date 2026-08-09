const Product = require('../models/Product');
const Collection = require('../models/Collection');
const FeaturedCollection = require('../models/FeaturedCollection');
const FragranceFamily = require('../models/FragranceFamily');
const GiftSet = require('../models/GiftSet');
const SeasonalCollection = require('../models/SeasonalCollection');
const HomepageContent = require('../models/HomepageContent');
const WebsiteContent = require('../models/WebsiteContent');
const Testimonial = require('../models/Testimonial');
const Settings = require('../models/Settings');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

// Backup/restore covers store CONTENT (catalog, homepage, website content,
// marketing, settings) - the things an admin edits day to day. Orders,
// customers, reviews, and admin/auth data are deliberately excluded: those
// are live transactional/security data that a JSON round-trip could corrupt
// or duplicate, and belong to proper database-level backup tooling instead.
const COLLECTIONS = {
  products: Product,
  collections: Collection,
  featuredCollections: FeaturedCollection,
  fragranceFamilies: FragranceFamily,
  giftSets: GiftSet,
  seasonalCollections: SeasonalCollection,
  homepageContent: HomepageContent,
  websiteContent: WebsiteContent,
  testimonials: Testimonial,
  settings: Settings,
};

exports.exportBackup = asyncHandler(async (req, res) => {
  const data = {};
  for (const [key, Model] of Object.entries(COLLECTIONS)) {
    data[key] = await Model.find();
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    scope: 'Store content only (catalog, homepage, website content, marketing, settings). Orders, customers, and admin accounts are not included.',
    data,
  };

  await logActivity({ admin: req.admin._id, action: 'Exported backup', module: 'backup', details: '' });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="alsai-backup-${Date.now()}.json"`);
  res.status(200).send(JSON.stringify(payload, null, 2));
});

exports.importBackup = asyncHandler(async (req, res) => {
  const { data } = req.body;
  if (!data || typeof data !== 'object') {
    throw new ApiError(400, 'Invalid backup file: missing data payload');
  }

  const summary = {};
  for (const [key, Model] of Object.entries(COLLECTIONS)) {
    const records = data[key];
    if (!Array.isArray(records)) continue;

    let restored = 0;
    for (const record of records) {
      const { _id, ...rest } = record;
      await Model.findByIdAndUpdate(_id, rest, { upsert: true, setDefaultsOnInsert: true, runValidators: true });
      restored += 1;
    }
    summary[key] = restored;
  }

  await logActivity({ admin: req.admin._id, action: 'Restored backup', module: 'backup', details: JSON.stringify(summary) });

  res.status(200).json(new ApiResponse(200, { summary }, 'Backup restored successfully'));
});
