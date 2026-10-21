const mongoose = require('mongoose');

// Append-only log of qualifying learning activities. Powers "recent activity".
const activitySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['lesson', 'vocabulary', 'speaking', 'ai', 'challenge', 'badge'], required: true },
    title: { type: String, required: true },
    referenceId: { type: String, default: '' },
    xp: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
activitySchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
