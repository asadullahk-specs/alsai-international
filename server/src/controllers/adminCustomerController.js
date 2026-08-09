const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Address = require('../models/Address');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

exports.listCustomers = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { fullName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }
  if (status && status !== 'all') filter.status = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [customers, total, activeCount, inactiveCount, orderTotals] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Customer.countDocuments(filter),
    Customer.countDocuments({ status: 'active' }),
    Customer.countDocuments({ status: 'inactive' }),
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: '$customer', totalSpent: { $sum: '$total' }, orderCount: { $sum: 1 } } },
    ]),
  ]);

  const totalsByCustomer = new Map(orderTotals.map((t) => [String(t._id), t]));
  const enriched = customers.map((c) => {
    const t = totalsByCustomer.get(String(c._id));
    return {
      ...c.toObject(),
      totalOrders: t?.orderCount || 0,
      totalSpent: t?.totalSpent || 0,
    };
  });

  const grandTotalSpent = orderTotals.reduce((sum, t) => sum + t.totalSpent, 0);
  const grandTotalOrders = orderTotals.reduce((sum, t) => sum + t.orderCount, 0);

  res.status(200).json(
    new ApiResponse(200, {
      customers: enriched,
      stats: {
        total: await Customer.countDocuments(),
        active: activeCount,
        inactive: inactiveCount,
        totalOrders: grandTotalOrders,
        totalSpent: grandTotalSpent,
      },
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate('wishlist', 'name mainImage basePrice');
  if (!customer) throw new ApiError(404, 'Customer not found');

  const [orders, addresses, orderStats] = await Promise.all([
    Order.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(20),
    Address.find({ customer: customer._id }),
    Order.aggregate([
      { $match: { customer: customer._id, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSpent: { $sum: '$total' }, orderCount: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      customer,
      orders,
      addresses,
      totalOrders: orderStats[0]?.orderCount || 0,
      totalSpent: orderStats[0]?.totalSpent || 0,
      wishlistCount: customer.wishlist.length,
    })
  );
});

exports.updateCustomerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) throw new ApiError(400, 'Invalid status');

  const customer = await Customer.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!customer) throw new ApiError(404, 'Customer not found');

  await logActivity({
    admin: req.admin._id,
    action: `Set customer status to ${status}`,
    module: 'customers',
    details: customer.email,
  });

  res.status(200).json(new ApiResponse(200, { customer }, 'Customer status updated'));
});

exports.exportCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  const rows = [['Name', 'Email', 'Phone', 'Registered', 'Status']];
  customers.forEach((c) => {
    rows.push([c.fullName, c.email, c.phone, c.createdAt.toISOString().slice(0, 10), c.status]);
  });
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
  res.status(200).send(csv);
});
