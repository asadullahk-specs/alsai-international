const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

// Flattens every product into one row per size, matching the reference Inventory
// table (one line per SKU, not one line per product).
const flattenToStockRows = (products) => {
  const rows = [];
  products.forEach((p) => {
    p.sizes.forEach((s) => {
      let status = 'in_stock';
      if (s.stock === 0) status = 'out_of_stock';
      else if (s.stock <= p.lowStockThreshold) status = 'low_stock';

      rows.push({
        productId: p._id,
        productName: p.name,
        image: p.mainImage,
        sku: s.sku,
        size: s.size,
        collection: p.featuredCollection?.name || p.collection?.name || 'Uncategorized',
        price: s.price,
        salePrice: s.salePrice,
        costPrice: s.costPrice || 0,
        stock: s.stock,
        lowStockThreshold: p.lowStockThreshold,
        status,
        profitMargin: s.price > 0 && s.costPrice ? Math.round(((s.price - s.costPrice) / s.price) * 1000) / 10 : null,
        stockValue: (s.costPrice || 0) * s.stock,
        updatedAt: p.updatedAt,
      });
    });
  });
  return rows;
};

exports.listInventory = asyncHandler(async (req, res) => {
  const { search, status, collection, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { 'sizes.sku': new RegExp(search, 'i') }];
  if (collection) filter.collection = collection;

  const products = await Product.find(filter)
    .populate('collection', 'name')
    .populate('featuredCollection', 'name')
    .sort({ name: 1 });

  let rows = flattenToStockRows(products);
  if (status === 'low_stock') rows = rows.filter((r) => r.status === 'low_stock');
  if (status === 'out_of_stock') rows = rows.filter((r) => r.status === 'out_of_stock');
  if (status === 'in_stock') rows = rows.filter((r) => r.status === 'in_stock');

  const totalStockUnits = rows.reduce((sum, r) => sum + r.stock, 0);
  const totalStockValue = rows.reduce((sum, r) => sum + r.stockValue, 0);
  const lowStockCount = rows.filter((r) => r.status === 'low_stock').length;
  const outOfStockCount = rows.filter((r) => r.status === 'out_of_stock').length;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 200);
  const total = rows.length;
  const paginated = rows.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.status(200).json(
    new ApiResponse(200, {
      rows: paginated,
      stats: {
        totalProducts: products.length,
        totalStockUnits,
        lowStockCount,
        outOfStockCount,
        totalStockValue,
      },
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.adjustStock = asyncHandler(async (req, res) => {
  const { productId, size, changeType, quantityChange, costPrice, note } = req.body;

  if (!productId || !size || !changeType) throw new ApiError(400, 'Product, size, and change type are required');
  const qty = Number(quantityChange);
  if (!Number.isFinite(qty) || qty === 0) throw new ApiError(400, 'Quantity change must be a non-zero number');

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const sizeIndex = product.sizes.findIndex((s) => s.size === size);
  if (sizeIndex === -1) throw new ApiError(404, 'Size not found on this product');

  const previousStock = product.sizes[sizeIndex].stock;
  const newStock = previousStock + qty;
  if (newStock < 0) throw new ApiError(400, 'Stock cannot go below zero');

  product.sizes[sizeIndex].stock = newStock;
  if (costPrice !== undefined && costPrice !== '' && changeType === 'restock') {
    product.sizes[sizeIndex].costPrice = Number(costPrice);
  }
  await product.save();

  const history = await StockHistory.create({
    product: product._id,
    size,
    changeType,
    quantityChange: qty,
    previousStock,
    newStock,
    costPrice: changeType === 'restock' ? Number(costPrice) || product.sizes[sizeIndex].costPrice : undefined,
    note: note || '',
    admin: req.admin._id,
    adminName: req.admin.fullName,
  });

  if (newStock > 0 && newStock <= product.lowStockThreshold) {
    const admins = await Admin.find({ isActive: true }).limit(20).select('_id');
    await Promise.all(
      admins.map((a) =>
        Notification.create({
          recipientType: 'Admin',
          recipient: a._id,
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `${product.name} (${size}) has low stock. Remaining: ${newStock} units.`,
          link: '/admin/inventory',
        })
      )
    );
  } else if (newStock === 0) {
    const admins = await Admin.find({ isActive: true }).limit(20).select('_id');
    await Promise.all(
      admins.map((a) =>
        Notification.create({
          recipientType: 'Admin',
          recipient: a._id,
          type: 'out_of_stock',
          title: 'Out of Stock',
          message: `${product.name} (${size}) is out of stock. Restock required.`,
          link: '/admin/inventory',
        })
      )
    );
  }

  await logActivity({
    admin: req.admin._id,
    action: 'Adjusted stock',
    module: 'inventory',
    details: `${product.name} (${size}): ${previousStock} -> ${newStock}`,
  });

  res.status(200).json(new ApiResponse(200, { product, history }, 'Stock updated successfully'));
});

exports.getStockHistory = asyncHandler(async (req, res) => {
  const { productId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (productId) filter.product = productId;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [history, total] = await Promise.all([
    StockHistory.find(filter)
      .populate('product', 'name mainImage')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    StockHistory.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      history,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});
