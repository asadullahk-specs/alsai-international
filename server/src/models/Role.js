const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    permissions: [
      {
        module: { type: String, required: true },
        actions: [{ type: String, enum: ['view', 'create', 'edit', 'delete', 'approve'] }],
        _id: false,
      },
    ],
    isSystemRole: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
