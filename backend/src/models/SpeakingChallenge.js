const mongoose = require('mongoose');

const speakingChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    prompt: { type: String, required: true },
    timeLimit: { type: Number, default: 60 }, // seconds
    xpReward: { type: Number, default: 40 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpeakingChallenge', speakingChallengeSchema);
