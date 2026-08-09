const Testimonial = require('../models/Testimonial');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');

exports.listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ displayOrder: 1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { testimonials }));
});

exports.createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.create({ ...req.body, status: req.body.status || 'approved' });
  await logActivity({ admin: req.admin._id, action: 'Added testimonial', module: 'content', details: testimonial.customerName });
  res.status(201).json(new ApiResponse(201, { testimonial }, 'Testimonial added'));
});

exports.updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  res.status(200).json(new ApiResponse(200, { testimonial }, 'Testimonial updated'));
});

exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  res.status(200).json(new ApiResponse(200, null, 'Testimonial deleted'));
});
