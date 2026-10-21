const Challenge = require('../models/Challenge');
const ChallengeProgress = require('../models/ChallengeProgress');
const Activity = require('../models/Activity');
const { awardXP } = require('./xpService');
const { startOfDay } = require('../utils/dates');

const dayKeyOf = (d = new Date()) => startOfDay(d).toISOString().slice(0, 10);

// Challenges available today: evergreen (no date) or dated for today.
async function getTodaysChallenges(now = new Date()) {
  const today = startOfDay(now);
  const tomorrow = new Date(today.getTime() + 86400000);
  return Challenge.find({
    isActive: true,
    $or: [{ activeDate: null }, { activeDate: { $gte: today, $lt: tomorrow } }],
  }).sort({ createdAt: 1 });
}

// Called after every qualifying activity. Increments progress on today's matching challenges
// and pays the challenge reward exactly once when the target is reached.
async function recordActivity(studentId, activityTypes, amount = 1, now = new Date()) {
  const types = [...activityTypes, 'general'];
  const challenges = (await getTodaysChallenges(now)).filter((c) => types.includes(c.type));
  const dayKey = dayKeyOf(now);
  const completed = [];

  for (const challenge of challenges) {
    let progress = await ChallengeProgress.findOne({ studentId, challengeId: challenge._id, dayKey });
    if (!progress) {
      try {
        progress = await ChallengeProgress.create({ studentId, challengeId: challenge._id, dayKey, progress: 0 });
      } catch (err) {
        if (err.code !== 11000) throw err;
        progress = await ChallengeProgress.findOne({ studentId, challengeId: challenge._id, dayKey });
      }
    }
    if (progress.status === 'completed') continue;

    progress.progress = Math.min(progress.progress + amount, challenge.requirement.target);
    if (progress.progress >= challenge.requirement.target) {
      progress.status = 'completed';
      progress.completedAt = now;
    } else {
      progress.status = 'in_progress';
    }
    await progress.save();

    if (progress.status === 'completed') {
      const xp = await awardXP({
        studentId,
        amount: challenge.xpReward,
        reason: `Challenge: ${challenge.title}`,
        source: 'challenge',
        referenceId: `${challenge._id}:${dayKey}`,
      });
      if (xp.awarded) {
        await Activity.create({ studentId, type: 'challenge', title: `Completed challenge: ${challenge.title}`, referenceId: String(challenge._id), xp: xp.amount });
      }
      completed.push(challenge);
    }
  }
  return completed;
}

async function startChallenge(studentId, challengeId, now = new Date()) {
  const dayKey = dayKeyOf(now);
  return ChallengeProgress.findOneAndUpdate(
    { studentId, challengeId, dayKey },
    { $setOnInsert: { progress: 0, status: 'in_progress', startedAt: now } },
    { upsert: true, new: true }
  );
}

module.exports = { getTodaysChallenges, recordActivity, startChallenge, dayKeyOf };
