const mongoose = require('mongoose');

const TYPES = ['vocabulary', 'speaking', 'course', 'lesson', 'ai', 'general'];

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: TYPES, required: true },
    // Counts qualifying activities of `type`. e.g. { target: 5 } = 5 vocabulary reviews.
    requirement: { target: { type: Number, default: 1, min: 1 } },
    xpReward: { type: Number, default: 30 },
    // Date the challenge becomes current; null = always available (evergreen).
    activeDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Challenge', challengeSchema);
module.exports.TYPES = TYPES;
