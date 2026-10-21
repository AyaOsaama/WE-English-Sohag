const User = require('../models/User');
const XPTransaction = require('../models/XPTransaction');

// Central XP entry point. Idempotent: the unique index on (student, source, referenceId)
// means the same reward can never be paid twice, even on refresh or double submit.
async function awardXP({ studentId, amount, reason, source, referenceId }) {
  if (!amount || amount <= 0) return { awarded: false, amount: 0 };
  try {
    await XPTransaction.create({ studentId, amount, reason, source, referenceId: String(referenceId) });
  } catch (err) {
    if (err.code === 11000) return { awarded: false, amount: 0, duplicate: true };
    throw err;
  }
  await User.updateOne({ _id: studentId }, { $inc: { xp: amount } });
  return { awarded: true, amount };
}

async function xpSince(studentId, since) {
  const rows = await XPTransaction.aggregate([
    { $match: { studentId, createdAt: { $gte: since } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return rows[0]?.total || 0;
}

module.exports = { awardXP, xpSince };
