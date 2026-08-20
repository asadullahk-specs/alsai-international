const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { applyPromotionsToProducts } = require('../utils/applyPromotions');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  'price-asc': { basePrice: 1 },
  'price-desc': { basePrice: -1 },
  rating: { ratingAverage: -1 },
  popular: { ratingCount: -1 },
};

exports.listProducts = asyncHandler(async (req, res) => {
  const {
    collection,
    fragranceFamily,
    featuredCollection,
    minPrice,
    maxPrice,
    size,
    availability,
    rating,
    search,
    ids,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true, isHidden: false };

  if (ids) filter._id = { $in: ids.split(',').filter(Boolean) };
  if (collection) filter.collection = { $in: collection.split(',') };
  if (fragranceFamily) filter.fragranceFamily = { $in: fragranceFamily.split(',') };
  if (featuredCollection) filter.featuredCollection = { $in: featuredCollection.split(',') };
  if (size) filter['sizes.size'] = { $in: size.split(',') };
  if (rating) filter.ratingAverage = { $gte: Number(rating) };

  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = Number(minPrice);
    if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
  }

  if (availability === 'in_stock') {
    filter.$expr = { $gt: ['$totalStock', '$lowStockThreshold'] };
  } else if (availability === 'limited') {
    filter.$and = [{ totalStock: { $gt: 0 } }, { $expr: { $lte: ['$totalStock', '$lowStockThreshold'] } }];
  } else if (availability === 'out_of_stock') {
    filter.totalStock = 0;
  }

  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [{ name: new RegExp(safe, 'i') }, { shortDescription: new RegExp(safe, 'i') }];
  }

  const sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 48);

  const [rawProducts, total] = await Promise.all([
    Product.find(filter)
      .populate('collection', 'name slug')
      .populate('featuredCollection', 'name slug')
      .populate('fragranceFamily', 'name slug')
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  const products = await applyPromotionsToProducts(rawProducts);

  res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    })
  );
});

exports.getProductBySlug = asyncHandler(async (req, res) => {
  const rawProduct = await Product.findOne({ slug: req.params.slug, isActive: true, isHidden: false })
    .populate('collection', 'name slug')
    .populate('featuredCollection', 'name slug')
    .populate('fragranceFamily', 'name slug')
    .populate({
      path: 'relatedProducts',
      match: { isActive: true, isHidden: false },
      select: 'name slug shortDescription mainImage hoverImage basePrice sizes ratingAverage ratingCount isBestSeller isNewArrival',
    });

  if (!rawProduct) throw new ApiError(404, 'Product not found');

  const product = await applyPromotionsToProducts(rawProduct);
  if (product.relatedProducts && product.relatedProducts.length > 0) {
    product.relatedProducts = await applyPromotionsToProducts(product.relatedProducts);
  }

  res.status(200).json(new ApiResponse(200, { product }));
});
