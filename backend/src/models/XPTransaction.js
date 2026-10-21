const mongoose = require('mongoose');

const xpTransactionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    source: { type: String, required: true }, // lesson | vocabulary | speaking | challenge | badge
    referenceId: { type: String, required: true }, // id (or composite key) of the thing that earned the XP
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
// Idempotency: the same source+reference can only pay out once per student.
xpTransactionSchema.index({ studentId: 1, source: 1, referenceId: 1 }, { unique: true });

module.exports = mongoose.model('XPTransaction', xpTransactionSchema);
