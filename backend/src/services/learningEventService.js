const Activity = require('../models/Activity');
const streakService = require('./streakService');
const challengeService = require('./challengeService');
const badgeService = require('./badgeService');

// Single pipeline run after every qualifying learning activity:
//   (result already saved by caller) -> activity log -> streak -> challenges -> badges
// `types` are the challenge types this activity counts toward (e.g. ['vocabulary']).
async function handleActivity({ studentId, type, title, referenceId = '', xp = 0, types = [type], amount = 1, log = true }) {
  if (log) await Activity.create({ studentId, type, title, referenceId: String(referenceId), xp });
  const streak = await streakService.recordActivity(studentId);
  const completedChallenges = await challengeService.recordActivity(studentId, types, amount);
  const newBadges = await badgeService.checkBadges(studentId);
  return { streak, completedChallenges, newBadges };
}

module.exports = { handleActivity };
