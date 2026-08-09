const mongoose = require('mongoose');
const Product = require('./Product');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true, trim: true, maxlength: 1000 },
    image: { type: String, default: '' }, // uploaded directly by the customer
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

reviewSchema.statics.recalculateProductRating = async function recalculateProductRating(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    ratingCount: stats.length ? stats[0].count : 0,
  });
};

reviewSchema.post('save', function triggerRatingRecalc() {
  this.constructor.recalculateProductRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
