const mongoose = require('mongoose');

const studentBadgeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);
studentBadgeSchema.index({ studentId: 1, badgeId: 1 }, { unique: true }); // never award twice

module.exports = mongoose.model('StudentBadge', studentBadgeSchema);
