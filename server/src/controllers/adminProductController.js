const Product = require('../models/Product');
const HomepageContent = require('../models/HomepageContent');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');

const generateUniqueSlug = async (name, excludeId) => {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};

// Keeps HomepageContent.bestSellers and newArrivals in sync with product flags so both
// the homepage controller's live query AND any stored-ID logic always agree.
const syncHomepageSections = async () => {
  const [bestSellers, newArrivals] = await Promise.all([
    Product.find({ isBestSeller: true, isActive: true, isHidden: false }).select('_id'),
    Product.find({ isNewArrival: true, isActive: true, isHidden: false }).select('_id'),
  ]);
  await HomepageContent.findOneAndUpdate(
    {},
    {
      bestSellers: bestSellers.map((p) => p._id),
      newArrivals: newArrivals.map((p) => p._id),
    },
    { upsert: true }
  );
};

exports.listProducts = asyncHandler(async (req, res) => {
  const { search, collection, status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [{ name: new RegExp(search, 'i') }, { 'sizes.sku': new RegExp(search, 'i') }];
  }
  if (collection) filter.collection = collection;
  if (status === 'active') filter.isActive = true;
  if (status === 'hidden') filter.isHidden = true;
  if (status === 'out_of_stock') filter.totalStock = 0;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('collection', 'name')
      .populate('featuredCollection', 'name')
      .populate('fragranceFamily', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('collection', 'name')
    .populate('featuredCollection', 'name')
    .populate('fragranceFamily', 'name')
    .populate('relatedProducts', 'name mainImage');
  if (!product) throw new ApiError(404, 'Product not found');
  res.status(200).json(new ApiResponse(200, { product }));
});

exports.createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.slug && data.name) {
    data.slug = await generateUniqueSlug(data.name);
  }
  const product = await Product.create(data);
  // Fire-and-forget sync so it doesn't slow down the response
  syncHomepageSections().catch(() => {});
  res.status(201).json(new ApiResponse(201, { product }, 'Product created successfully'));
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const data = { ...req.body };
  if (data.name && data.name !== product.name && !req.body.slug) {
    data.slug = await generateUniqueSlug(data.name, product._id);
  }

  Object.assign(product, data);
  await product.save();

  // Sync homepage sections whenever flags may have changed
  syncHomepageSections().catch(() => {});

  res.status(200).json(new ApiResponse(200, { product }, 'Product updated successfully'));
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  syncHomepageSections().catch(() => {});
  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});
