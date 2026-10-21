const mongoose = require('mongoose');

const challengeProgressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    // One attempt per challenge per day: dayKey = YYYY-MM-DD
    dayKey: { type: String, required: true },
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
challengeProgressSchema.index({ studentId: 1, challengeId: 1, dayKey: 1 }, { unique: true });

module.exports = mongoose.model('ChallengeProgress', challengeProgressSchema);
