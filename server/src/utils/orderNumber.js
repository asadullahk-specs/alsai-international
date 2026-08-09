const Counter = require('../models/Counter');

const getNextOrderNumber = async () => {
  const year = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    `order_${year}`,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `ALSAI-${year}-${String(counter.seq).padStart(6, '0')}`;
};

module.exports = getNextOrderNumber;
