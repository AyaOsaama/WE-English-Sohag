const mongoose = require('mongoose');

const REQUIREMENT_TYPES = [
  'streak',
  'completedLessons',
  'masteredVocabulary',
  'completedSpeaking',
  'completedChallenges',
  'aiConversations',
  'totalXP',
];

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '🏆' },
    requirementType: { type: String, enum: REQUIREMENT_TYPES, required: true },
    requirementValue: { type: Number, required: true, min: 1 },
    xpReward: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
module.exports.REQUIREMENT_TYPES = REQUIREMENT_TYPES;
