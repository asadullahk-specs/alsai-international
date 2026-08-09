const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

exports.listSubscribers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) filter.email = new RegExp(search, 'i');

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 200);

  const [subscribers, total, active, unsubscribed] = await Promise.all([
    NewsletterSubscriber.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    NewsletterSubscriber.countDocuments(filter),
    NewsletterSubscriber.countDocuments({ isActive: true }),
    NewsletterSubscriber.countDocuments({ isActive: false }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      subscribers,
      stats: { total: active + unsubscribed, active, unsubscribed },
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    })
  );
});

exports.removeSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
  if (!subscriber) throw new ApiError(404, 'Subscriber not found');

  await logActivity({ admin: req.admin._id, action: 'Removed newsletter subscriber', module: 'newsletter', details: subscriber.email });

  res.status(200).json(new ApiResponse(200, null, 'Subscriber removed'));
});

exports.exportSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
  const rows = [['Email', 'Status', 'Subscribed On']];
  subscribers.forEach((s) => {
    rows.push([s.email, s.isActive ? 'Active' : 'Unsubscribed', s.createdAt.toISOString().slice(0, 10)]);
  });
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"');
  res.status(200).send(csv);
});
