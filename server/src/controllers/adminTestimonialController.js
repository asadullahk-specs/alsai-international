const Testimonial = require('../models/Testimonial');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

exports.listTestimonials = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  const testimonials = await Testimonial.find(filter).sort({ displayOrder: 1, createdAt: -1 });
  const counts = {
    all: await Testimonial.countDocuments(),
    pending: await Testimonial.countDocuments({ status: 'pending' }),
    approved: await Testimonial.countDocuments({ status: 'approved' }),
    rejected: await Testimonial.countDocuments({ status: 'rejected' }),
  };
  res.status(200).json(new ApiResponse(200, { testimonials, counts }));
});

exports.updateTestimonialStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) throw new ApiError(400, 'Invalid status');

  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');

  await logActivity({ admin: req.admin._id, action: `Testimonial ${status}`, module: 'content', details: testimonial.customerName });

  res.status(200).json(new ApiResponse(200, { testimonial }, `Testimonial ${status}`));
});

exports.updateTestimonial = asyncHandler(async (req, res) => {
  // Moderators can still adjust display order or lightly edit an approved
  // testimonial (e.g. trim a typo), but customerName/message ownership stays
  // with the submitting customer - this is not a create endpoint.
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  res.status(200).json(new ApiResponse(200, { testimonial }, 'Testimonial updated'));
});

exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  res.status(200).json(new ApiResponse(200, null, 'Testimonial deleted'));
});
