const Badge = require('../models/Badge');
const StudentBadge = require('../models/StudentBadge');
const badgeService = require('../services/badgeService');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertObjectId, pick } = require('../utils/validate');

const FIELDS = ['name', 'description', 'icon', 'requirementType', 'requirementValue', 'xpReward', 'active'];

// All badges with the student's earned state and current progress toward each requirement.
exports.list = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { active: true };
  const [badges, earned, stats] = await Promise.all([
    Badge.find(filter).sort({ requirementValue: 1 }).lean(),
    StudentBadge.find({ studentId: req.user._id }).lean(),
    badgeService.getStats(req.user._id),
  ]);
  const earnedAt = new Map(earned.map((e) => [String(e.badgeId), e.earnedAt]));
  ok(res, {
    badges: badges.map((b) => ({
      ...b,
      earned: earnedAt.has(String(b._id)),
      earnedAt: earnedAt.get(String(b._id)) || null,
      current: Math.min(stats[b.requirementType] ?? 0, b.requirementValue),
    })),
  });
});

exports.mine = asyncHandler(async (req, res) => {
  const rows = await StudentBadge.find({ studentId: req.user._id }).populate('badgeId').sort({ earnedAt: -1 }).lean();
  ok(res, { badges: rows.map((r) => ({ ...r.badgeId, earnedAt: r.earnedAt })) });
});

exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'requirementType', 'requirementValue']);
  ok(res, { badge: await Badge.create(pick(req.body, FIELDS)) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const badge = await Badge.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), { new: true, runValidators: true });
  if (!badge) throw new ApiError(404, 'Badge not found');
  ok(res, { badge });
});

exports.remove = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const badge = await Badge.findByIdAndDelete(req.params.id);
  if (!badge) throw new ApiError(404, 'Badge not found');
  await StudentBadge.deleteMany({ badgeId: badge._id });
  ok(res, { message: 'Badge deleted' });
});
