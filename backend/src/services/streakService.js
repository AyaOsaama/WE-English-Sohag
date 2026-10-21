const User = require('../models/User');
const { computeStreak } = require('../utils/rules');

async function recordActivity(studentId, now = new Date()) {
  const user = await User.findById(studentId);
  if (!user) return null;
  const result = computeStreak(user, now);
  user.currentStreak = result.currentStreak;
  user.longestStreak = result.longestStreak;
  user.lastActiveDate = result.lastActiveDate;
  await user.save();
  return result;
}

module.exports = { recordActivity };
