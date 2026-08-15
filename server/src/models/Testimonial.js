const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    // The account that submitted this testimonial. Optional only because a
    // handful of pre-existing testimonials may have been entered directly
    // in the database before this became customer-submitted-only.
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true, trim: true },
    customerImage: { type: String, default: '' },
    // A separate, fixed-size slot for a photo of the actual product/order,
    // distinct from the customer's own avatar. Optional - when present, the
    // message is capped tighter (100 chars) to keep every card the same
    // height; without an image it can run up to 150.
    reviewImage: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true, maxlength: 150 },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.pre('validate', function enforceConditionalMessageLength(next) {
  const limit = this.reviewImage ? 100 : 150;
  if (this.message && this.message.length > limit) {
    this.invalidate('message', `Message must be ${limit} characters or fewer${this.reviewImage ? ' when a review image is attached' : ''}.`);
  }
  next();
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
