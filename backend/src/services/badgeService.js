const Badge = require('../models/Badge');
const StudentBadge = require('../models/StudentBadge');
const User = require('../models/User');
const CourseProgress = require('../models/CourseProgress');
const StudentVocabulary = require('../models/StudentVocabulary');
const SpeakingSubmission = require('../models/SpeakingSubmission');
const ChallengeProgress = require('../models/ChallengeProgress');
const Conversation = require('../models/Conversation');
const Activity = require('../models/Activity');
const { awardXP } = require('./xpService');

const { MASTERED_LEVEL, meetsRequirement } = require('../utils/rules');

async function getStats(studentId) {
  const user = await User.findById(studentId);
  const [progressDocs, masteredVocabulary, completedSpeaking, completedChallenges, aiConversations] = await Promise.all([
    CourseProgress.find({ studentId }).select('completedLessons'),
    StudentVocabulary.countDocuments({ studentId, masteryLevel: { $gte: MASTERED_LEVEL } }),
    SpeakingSubmission.countDocuments({ studentId }),
    ChallengeProgress.countDocuments({ studentId, status: 'completed' }),
    Conversation.countDocuments({ studentId }),
  ]);
  return {
    streak: user?.currentStreak || 0,
    totalXP: user?.xp || 0,
    completedLessons: progressDocs.reduce((n, p) => n + p.completedLessons.length, 0),
    masteredVocabulary,
    completedSpeaking,
    completedChallenges,
    aiConversations,
  };
}

// Checks every active badge the student does not own yet and awards the ones now satisfied.
async function checkBadges(studentId) {
  const [badges, owned, stats] = await Promise.all([
    Badge.find({ active: true }),
    StudentBadge.find({ studentId }).select('badgeId'),
    getStats(studentId),
  ]);
  const ownedIds = new Set(owned.map((o) => String(o.badgeId)));
  const newlyEarned = [];

  for (const badge of badges) {
    if (ownedIds.has(String(badge._id)) || !meetsRequirement(badge, stats)) continue;
    try {
      await StudentBadge.create({ studentId, badgeId: badge._id });
    } catch (err) {
      if (err.code === 11000) continue; // earned concurrently - never twice
      throw err;
    }
    if (badge.xpReward) {
      await awardXP({ studentId, amount: badge.xpReward, reason: `Badge: ${badge.name}`, source: 'badge', referenceId: badge._id });
    }
    await Activity.create({ studentId, type: 'badge', title: `Earned badge: ${badge.name}`, referenceId: String(badge._id), xp: badge.xpReward || 0 });
    newlyEarned.push(badge);
  }
  return newlyEarned;
}

module.exports = { checkBadges, getStats };
