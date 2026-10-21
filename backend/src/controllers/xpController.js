const XPTransaction = require('../models/XPTransaction');
const { asyncHandler, ok } = require('../utils/ApiError');

exports.mine = asyncHandler(async (req, res) => {
  const transactions = await XPTransaction.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  ok(res, { totalXP: req.user.xp, transactions });
});
