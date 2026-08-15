const Counter = require('../models/Counter');

// Generic year-scoped sequence generator, same pattern as utils/orderNumber.js,
// reused for the new business modules (Purchases, Payments, Expenses, Returns).
const getNextDocNumber = async (prefix) => {
  const year = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    `${prefix}_${year}`,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `${prefix}-${year}-${String(counter.seq).padStart(6, '0')}`;
};

module.exports = getNextDocNumber;
